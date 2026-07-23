import assert from "node:assert/strict";
import test from "node:test";

let activeMocks: Array<{ restore: () => void }> = [];
let queue: unknown[][] = [];

const restoreAll = () => {
  for (const m of activeMocks) m.restore();
  activeMocks = [];
  queue = [];
};

const realFetch = globalThis.fetch;
(globalThis as any).fetch = async () => new Response("{}", { status: 200 });

const makeResult = (rows: unknown[]): any => {
  const out: any = [...rows];
  out.then = (onFulfilled: any, onRejected: any) =>
    Promise.resolve(rows).then(onFulfilled, onRejected);
  out.length = rows.length;
  out.map = Array.prototype.map.bind(out);
  return out;
};

const buildFakeDb = (): any => {
  const fake: any = {
    select: () => fake,
    from: () => {
      const t: any = {
        innerJoin: () => t,
        leftJoin: () => t,
        where: () => {
          const r: any = {
            orderBy: () => r,
            limit: () => {
              const result = queue.shift() ?? [];
              return makeResult(result);
            },
          };
          Object.defineProperty(r, "then", {
            get() {
              return (onFulfilled: any, onRejected: any) =>
                makeResult(queue.shift() ?? []).then(onFulfilled, onRejected);
            },
          });
          return r;
        },
      };
      t.then = (onFulfilled: any, onRejected: any) =>
        makeResult(queue.shift() ?? []).then(onFulfilled, onRejected);
      return t;
    },
    update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
    insert: () => ({ values: () => Promise.resolve() }),
    delete: () => ({ where: () => Promise.resolve() }),
  };
  return fake;
};

const installMocks = () => {
  restoreAll();
  (globalThis as any).fetch = async () => new Response("{}", { status: 200 });
  activeMocks.push(
    test.mock.module("~/db", { namedExports: { getDb: () => buildFakeDb() } }),
  );
  activeMocks.push(
    test.mock.module("~/utils/users.ts", { namedExports: { ensureUserIdByEmail: async () => 99 } }),
  );
};

test.afterEach(restoreAll);

const importApi = async () => (await import(`./rpc.ts?cb=${Math.random()}`)).POST;

const postEvent = (body: unknown) => ({
  request: new Request("http://localhost/api/rpc", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  }),
});

test("returns 400 on invalid JSON", async () => {
  installMocks();
  const POST = await importApi();
  const res = await POST({
    request: new Request("http://localhost/api/rpc", {
      method: "POST",
      body: "not json",
      headers: { "content-type": "application/json" },
    }),
  });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "invalid_json" });
});

test("returns 400 when method is missing", async () => {
  installMocks();
  const POST = await importApi();
  const res = await POST(postEvent({}));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "method_required" });
});

test("returns 404 for an unknown method", async () => {
  installMocks();
  const POST = await importApi();
  const res = await POST(postEvent({ method: "does.not.exist" }));
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: "method_not_found" });
});

test("meta.getSupportedMethods lists every method", async () => {
  installMocks();
  const POST = await importApi();
  const res = await POST(postEvent({ method: "meta.getSupportedMethods" }));
  assert.equal(res.status, 200);
  const body = await res.json();
  for (const m of [
    "derbyname.submitAction",
    "derbyname.confirmAction",
    "derbyname.checkAvailability",
    "derbyname.list",
    "clubs.list",
    "renameHistory.requestAccess",
    "renameHistory.listByToken",
    "derbyname.createPlayer",
    "derbyname.createReferee",
    "derbyname.updatePlayerName",
    "derbyname.updateRefereeName",
    "derbyname.updateClub",
  ]) {
    assert.ok(body.result.includes(m), `missing method ${m}`);
  }
});

test("derbyname.checkAvailability returns available when no row", async () => {
  installMocks();
  queue = [[]];
  const POST = await importApi();
  const res = await POST(postEvent({ method: "derbyname.checkAvailability", params: { derbyname: "alpha", type: "player" } }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.result.available, true);
  assert.equal(body.result.count, 0);
});

test("derbyname.checkAvailability returns 400 on invalid type", async () => {
  installMocks();
  const POST = await importApi();
  const res = await POST(postEvent({ method: "derbyname.checkAvailability", params: { derbyname: "alpha", type: "manager" } }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "invalid_type" });
});

test("derbyname.list returns the rows with parent names", async () => {
  installMocks();
  queue = [[
    { derbyname: "alpha", derbyType: "player", numRoster: "1", clubId: "child", clubName: "Child", parentClubId: "parent", department: "75" },
  ]];
  queue.push([{ id: "parent", name: "Parent Club" }]);
  const POST = await importApi();
  const res = await POST(postEvent({ method: "derbyname.list" }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.result.length, 1);
  assert.equal(body.result[0].parentClubName, "Parent Club");
});

test("derbyname.list returns 400 on invalid type filter", async () => {
  installMocks();
  const POST = await importApi();
  const res = await POST(postEvent({ method: "derbyname.list", params: { type: "manager" } }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "invalid_type" });
});

test("clubs.list returns clubs sorted with 'autre' pinned first", async () => {
  installMocks();
  queue = [[
    { id: "zebra", name: "Zebra" },
    { id: "autre", name: "=== AUTRE ===" },
    { id: "alpha", name: "Alpha" },
  ]];
  const POST = await importApi();
  const res = await POST(postEvent({ method: "clubs.list" }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.result[0].id, "autre");
  assert.equal(body.result[1].id, "alpha");
  assert.equal(body.result[2].id, "zebra");
});

test("renameHistory.requestAccess returns 400 on invalid email", async () => {
  installMocks();
  const POST = await importApi();
  const res = await POST(postEvent({ method: "renameHistory.requestAccess", params: { email: "nope" } }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "email invalide" });
});

test("renameHistory.listByToken returns 400 on missing token", async () => {
  installMocks();
  const POST = await importApi();
  const res = await POST(postEvent({ method: "renameHistory.listByToken", params: {} }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "token manquant" });
});

test("derbyname.createPlayer surfaces a 400 error from submit", async () => {
  installMocks();
  const POST = await importApi();
  const res = await POST(postEvent({ method: "derbyname.createPlayer", params: { name: "alpha", email: "nope" } }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "données invalides" });
});

test("derbyname.updateClub returns 400 on invalid type", async () => {
  installMocks();
  const POST = await importApi();
  const res = await POST(postEvent({ method: "derbyname.updateClub", params: { derbyType: "manager" } }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "invalid_type" });
});

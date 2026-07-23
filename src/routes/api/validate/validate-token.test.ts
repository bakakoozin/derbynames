import assert from "node:assert/strict";
import test from "node:test";

let activeMocks: Array<{ restore: () => void }> = [];
let queue: unknown[][] = [];
let updateCalls: Array<{ set: unknown }> = [];
let insertCalls: Array<{ values: unknown }> = [];
let deleteCalls: number = 0;

const restoreAll = () => {
  for (const m of activeMocks) m.restore();
  activeMocks = [];
  queue = [];
  updateCalls = [];
  insertCalls = [];
  deleteCalls = 0;
};

const makeResult = (rows: unknown[]): any => {
  const out: any = [...rows];
  out.then = (onFulfilled: any, onRejected: any) =>
    Promise.resolve(rows).then(onFulfilled, onRejected);
  out.length = rows.length;
  out.map = Array.prototype.map.bind(out);
  out.filter = Array.prototype.filter.bind(out);
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
    update: () => {
      const u: any = {
        set: (s: unknown) => {
          u._set = s;
          return u;
        },
        where: () => {
          updateCalls.push({ set: u._set });
          return Promise.resolve();
        },
      };
      return u;
    },
    insert: () => {
      const i: any = {
        values: (v: unknown) => {
          insertCalls.push({ values: v });
          return Promise.resolve();
        },
      };
      return i;
    },
    delete: () => {
      deleteCalls += 1;
      const d: any = {
        where: () => Promise.resolve(),
      };
      return d;
    },
  };
  return fake;
};

const installMocks = () => {
  restoreAll();
  activeMocks.push(
    test.mock.module("~/db", {
      namedExports: { getDb: () => buildFakeDb() },
    }),
  );
};

test.afterEach(restoreAll);

const importApi = async () => {
  const m = await import(`./[token].ts?cb=${Math.random()}`);
  return m;
};

test("returns 400 when token is missing", async () => {
  installMocks();
  const { confirmDerbynameAction } = await importApi();
  const res = await confirmDerbynameAction(undefined);
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "token manquant" });
});

test("returns 404 when action is already completed", async () => {
  installMocks();
  queue = [[{ id: 1, status: "completed", expiresAt: new Date(Date.now() + 60_000), payload: null }]];
  const { confirmDerbynameAction } = await importApi();
  const res = await confirmDerbynameAction("done");
  assert.equal(res.status, 404);
});

test("returns 404 when action is not found", async () => {
  installMocks();
  queue = [[]];
  const { confirmDerbynameAction } = await importApi();
  const res = await confirmDerbynameAction("unknown");
  assert.equal(res.status, 404);
});

test("returns 400 when the action is expired and marks it as such", async () => {
  installMocks();
  const past = new Date(Date.now() - 60_000);
  queue = [[{ id: 7, status: "pending", expiresAt: past, payload: null }]];
  const { confirmDerbynameAction } = await importApi();
  const res = await confirmDerbynameAction("expired");
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "token expiré" });
  assert.equal(updateCalls.length, 1);
  assert.equal((updateCalls[0]!.set as any).status, "expired");
});

test("returns 404 when payload has no derbyname/derbyType", async () => {
  installMocks();
  const future = new Date(Date.now() + 60_000);
  queue = [
    [{ id: 8, status: "pending", expiresAt: future, payload: JSON.stringify({}) }],
  ];
  const { confirmDerbynameAction } = await importApi();
  const res = await confirmDerbynameAction("invalid");
  assert.equal(res.status, 404);
});

test("returns 404 when the target derbyname row is missing", async () => {
  installMocks();
  const future = new Date(Date.now() + 60_000);
  queue = [
    [{ id: 9, status: "pending", expiresAt: future, payload: JSON.stringify({ derbyname: "alpha", derbyType: "player" }) }],
    [],
  ];
  const { confirmDerbynameAction } = await importApi();
  const res = await confirmDerbynameAction("ok");
  assert.equal(res.status, 404);
});

test("succeeds and updates the derbyname + action", async () => {
  installMocks();
  const future = new Date(Date.now() + 60_000);
  queue = [
    // action row
    [{
      id: 1,
      status: "pending",
      expiresAt: future,
      payload: JSON.stringify({ derbyname: "alpha", derbyType: "player" }),
    }],
    // derbyname row
    [{
      derbyname: "alpha",
      derbyType: "player",
      name: "Alice",
      email: "alice@example.com",
      emailConfirmed: false,
      clubId: null,
      numRoster: "1",
    }],
  ];
  const { confirmDerbynameAction } = await importApi();
  const res = await confirmDerbynameAction("ok");
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.emailConfirmed, true);
  // derbyname updated, history inserted, action completed
  assert.ok(updateCalls.length >= 2);
  assert.ok(insertCalls.length >= 1, "history should be inserted");
  const completed = updateCalls.find((u) => (u.set as any).status === "completed");
  assert.ok(completed, "action should be marked completed");
});

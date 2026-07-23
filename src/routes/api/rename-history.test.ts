import assert from "node:assert/strict";
import test from "node:test";

let updateCalls: Array<{ where: unknown; set: unknown }> = [];
let insertCalls: Array<{ values: unknown }> = [];
let updateShouldThrow: Error | null = null;

let activeMocks: Array<{ restore: () => void }> = [];

const restoreAll = () => {
  for (const m of activeMocks) m.restore();
  activeMocks = [];
  dbInstances.length = 0;
  updateCalls = [];
  insertCalls = [];
  updateShouldThrow = null;
};

const makeResult = (rows: unknown[]): any => {
  const out: any = [...rows];
  out.then = (onFulfilled: any, onRejected: any) =>
    Promise.resolve(rows).then(onFulfilled, onRejected);
  out.length = rows.length;
  out.map = Array.prototype.map.bind(out);
  out.filter = Array.prototype.filter.bind(out);
  out.find = Array.prototype.find.bind(out);
  return out;
};

const dbInstances: any[] = [];

const buildFakeDb = (): any => {
  let localQueue: unknown[][] = [];
  const fake: any = {
    select: () => fake,
    from: () => {
      const t: any = {
        innerJoin: () => t,
        leftJoin: () => t,
        where: () => {
          const r: any = {
            limit: () => {
              const result = localQueue.shift() ?? [];
              return makeResult(result);
            },
            // Make `where(...)` itself awaitable, returning the same data.
            then: undefined as any,
          };
          Object.defineProperty(r, "then", {
            get() {
              return (onFulfilled: any, onRejected: any) =>
                makeResult(localQueue.shift() ?? []).then(onFulfilled, onRejected);
            },
          });
          return r;
        },
      };
      t.then = (onFulfilled: any, onRejected: any) =>
        makeResult(localQueue.shift() ?? []).then(onFulfilled, onRejected);
      return t;
    },
    update: () => {
      const u: any = {
        set: (s: unknown) => {
          u._set = s;
          return u;
        },
        where: (w: unknown) => {
          updateCalls.push({ where: w, set: u._set });
          if (updateShouldThrow) return Promise.reject(updateShouldThrow);
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
    delete: () => Promise.resolve(),
    _setQueue: (rows: unknown[][]) => {
      localQueue = [...rows];
    },
  };
  dbInstances.push(fake);
  return fake;
};

const installMocks = () => {
  restoreAll();
  // Eagerly create the first fake so tests can queue results on it.
  const eager = buildFakeDb();
  activeMocks.push(
    test.mock.module("~/db", {
      namedExports: { getDb: () => eager },
    }),
  );
  activeMocks.push(
    test.mock.module("~/utils/users.ts", {
      namedExports: {
        ensureUserIdByEmail: async (_db: unknown, _email: string) => 99,
      },
    }),
  );
};

test.afterEach(restoreAll);

let fetchCalls: Array<{ url: string; body: string }> = [];
const realFetch = globalThis.fetch;
test.before(() => {
  (globalThis as any).fetch = async (url: string | URL, init?: any) => {
    fetchCalls.push({ url: String(url), body: init?.body ?? "" });
    return new Response("{}", { status: 200 });
  };
});
test.afterEach(() => { fetchCalls = []; });
test.after(() => { (globalThis as any).fetch = realFetch; });

const importApi = async () => {
  const m = await import(`./rename-history.ts?cb=${Math.random()}`);
  return m;
};

const postEvent = (body: unknown) => ({
  request: new Request("http://localhost/api/rename-history", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  }),
});

const getEvent = (token?: string) => ({
  request: new Request(
    `http://localhost/api/rename-history${token ? "?token=" + encodeURIComponent(token) : ""}`,
  ),
});

test("POST returns 400 on invalid email", async () => {
  installMocks();
  const { POST } = await importApi();
  const res = await POST(postEvent({ email: "not-an-email" }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "email invalide" });
});

test("POST returns 404 when no confirmed derbyname exists for the email", async () => {
  installMocks();
  dbInstances[0]._setQueue([[]]);
  const { POST } = await importApi();
  const res = await POST(postEvent({ email: "alice@example.com" }));
  assert.equal(res.status, 404);
});

test("POST creates an action and sends a history email", async () => {
  installMocks();
  dbInstances[0]._setQueue([[{ emailConfirmed: true }]]);
  const { POST } = await importApi();
  const res = await POST(postEvent({ email: "  Alice@Example.com  " }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(insertCalls.length, 1);
  const inserted = insertCalls[0]?.values as any;
  assert.equal(inserted.actionType, "renameHistory.requestAccess");
  assert.equal(inserted.status, "pending");
  assert.equal(inserted.userId, 99);
  assert.equal(fetchCalls.length, 1);
});

test("GET returns 400 when token is missing", async () => {
  installMocks();
  const { GET } = await importApi();
  const res = await GET(getEvent());
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "token manquant" });
});

test("GET returns 404 when token is unknown", async () => {
  installMocks();
  dbInstances[0]._setQueue([[]]);
  const { GET } = await importApi();
  const res = await GET(getEvent("unknown-token"));
  assert.equal(res.status, 404);
});

test("GET returns 400 when the action is expired and updates the action", async () => {
  installMocks();
  const past = new Date(Date.now() - 60_000);
  dbInstances[0]._setQueue([
    [{ userEmail: "alice@example.com", expiresAt: past, status: "pending" }],
  ]);
  const { GET } = await importApi();
  const res = await GET(getEvent("expired-token"));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "lien expiré" });
  assert.equal(updateCalls.length, 1);
  assert.deepEqual((updateCalls[0]!.set as any).status, "expired");
});

test("GET returns the history items for a valid token", async () => {
  installMocks();
  const future = new Date(Date.now() + 60_000);
  dbInstances[0]._setQueue([
    [{ userEmail: "alice@example.com", expiresAt: future, status: "pending" }],
    [
      {
        oldDerbyname: "old-1",
        newDerbyname: "new-1",
        numRoster: "1",
        clubId: "c1",
        createdAt: new Date(0),
      },
    ],
  ]);
  const { GET } = await importApi();
  const res = await GET(getEvent("valid-token"));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.items.length, 1);
  assert.equal(body.items[0].oldDerbyname, "old-1");
  assert.equal(body.items[0].newDerbyname, "new-1");
});

test("GET returns 404 when the action is cancelled", async () => {
  installMocks();
  const future = new Date(Date.now() + 60_000);
  dbInstances[0]._setQueue([
    [
      {
        userEmail: "alice@example.com",
        expiresAt: future,
        status: "cancelled",
      },
    ],
  ]);
  const { GET } = await importApi();
  const res = await GET(getEvent("any"));
  assert.equal(res.status, 404);
});

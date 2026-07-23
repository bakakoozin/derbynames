import assert from "node:assert/strict";
import test from "node:test";

type FakeDb = { select: () => any; from: () => any; where: (...args: unknown[]) => any };

let queue: unknown[][] = [];
let callLog: string[] = [];

const makeFakeDb = (): FakeDb => {
  const fake: any = {
    select: () => { callLog.push("select"); return fake; },
    from: () => {
      callLog.push("from");
      const t: any = {
        where: (...args: unknown[]) => {
          callLog.push("where");
          const result = queue.shift() ?? [];
          return Promise.resolve(result);
        },
      };
      // Make the result awaitable so the initial `db.select().from(...)`
      // can be `await`-ed even without a `.where()`.
      t.then = (onFulfilled: any, onRejected: any) => {
        const result = queue.shift() ?? [];
        return Promise.resolve(result).then(onFulfilled, onRejected);
      };
      return t;
    },
  };
  return fake;
};

let activeMock: { restore: () => void } | null = null;

const installMock = (rows: unknown[][]) => {
  if (activeMock) activeMock.restore();
  callLog = [];
  queue = [...rows];
  activeMock = test.mock.module("~/db", {
    namedExports: { getDb: () => makeFakeDb() },
  });
};

test.afterEach(() => {
  if (activeMock) {
    activeMock.restore();
    activeMock = null;
  }
});

const importApi = async () => {
  const m = await import(`./clubs.ts?cb=${Math.random()}`);
  return m.GET;
};

const makeEvent = (q = "") => ({
  request: new Request(`http://localhost/api/clubs${q ? "?" + q : ""}`),
});

test("GET returns all clubs sorted by name, 'autre' pinned first", async () => {
  installMock([
    [
      { id: "zebra", name: "Zebra" },
      { id: "autre", name: "=== AUTRE ===" },
      { id: "alpha", name: "Alpha" },
    ],
  ]);
  const GET = await importApi();
  const res = await GET(makeEvent());
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body[0].id, "autre");
  assert.equal(body[1].id, "alpha");
  assert.equal(body[2].id, "zebra");
});

test("GET maps nullable fields to null", async () => {
  installMock([
    [{ id: "alpha", name: "Alpha" }],
  ]);
  const GET = await importApi();
  const res = await GET(makeEvent());
  const body = await res.json();
  assert.equal(body[0].parentClubId, null);
  assert.equal(body[0].website, null);
  assert.equal(body[0].source, null);
});

test("GET falls back to [{ id: 'autre', name: '=== AUTRE ===' }] on error", async () => {
  if (activeMock) activeMock.restore();
  activeMock = test.mock.module("~/db", {
    namedExports: {
      getDb: () => ({
        select: () => {
          throw new Error("db down");
        },
      }),
    },
  });
  const GET = await importApi();
  const res = await GET(makeEvent());
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body, [{ id: "autre", name: "=== AUTRE ===" }]);
});

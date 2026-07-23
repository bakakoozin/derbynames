import assert from "node:assert/strict";
import test from "node:test";

// Each test imports a fresh copy of the API with its own `?cb=` cache-bust
// query string.
const importApi = () => import(`./[derbyname].ts?cb=${Math.random()}`);

type FakeDb = { select: () => any; from: () => any; where: () => any };

const makeFakeDb = (results: unknown[][]): FakeDb => {
  const queue = [...results];
  const fake: any = {
    select: () => fake,
    from: () => fake,
    where: () => {
      const result = queue.shift() ?? [];
      return Promise.resolve(result);
    },
  };
  return fake;
};

const makeEvent = (derbyname: string, query = "") => ({
  params: { derbyname },
  request: new Request(`http://localhost/api/check/${derbyname}${query}`),
});

let activeMock: { restore: () => void } | null = null;
const installMock = (results: unknown[][]) => {
  if (activeMock) {
    activeMock.restore();
    activeMock = null;
  }
  activeMock = test.mock.module("~/db", {
    namedExports: { getDb: () => makeFakeDb(results) },
  });
};

test.afterEach(() => {
  if (activeMock) {
    activeMock.restore();
    activeMock = null;
  }
});

test("returns count 0 when derbyname is empty", async () => {
  installMock([[]]);
  const { GET } = await importApi();
  const res = await GET(makeEvent("   "));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { count: 0 });
});

test("returns 400 when type is invalid", async () => {
  installMock([[]]);
  const { GET } = await importApi();
  const res = await GET(makeEvent("alpha", "?type=bogus"));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "type invalide" });
});

test("returns count 0 when no confirmed derbyname exists", async () => {
  installMock([[]]);
  const { GET } = await importApi();
  const res = await GET(makeEvent("alpha", "?type=player"));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { count: 0 });
});

test("returns count 1 when a confirmed derbyname exists", async () => {
  installMock([[{ derbyname: "alpha" }]]);
  const { GET } = await importApi();
  const res = await GET(makeEvent("Alpha", "?type=player"));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { count: 1 });
});

test("defaults to type=player when no type is provided", async () => {
  installMock([[{ derbyname: "alpha" }]]);
  const { GET } = await importApi();
  const res = await GET(makeEvent("alpha"));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { count: 1 });
});

import assert from "node:assert/strict";
import test from "node:test";

let allowAccess = true;
let premiumBadgesEnabled = true;
let queue: unknown[][] = [];

let activeMocks: Array<{ restore: () => void }> = [];

const makeFakeDb = (): any => {
  // For the badge endpoint, we expect a single chain of calls that all
  // return one `result` (a single row object). Wrap the value as needed.
  const fake: any = {
    select: () => fake,
    from: () => {
      const t: any = {
        where: () => {
          const r: any = {
            limit: () => makeResult(queue.shift()),
          };
          return r;
        },
      };
      t.then = (onFulfilled: any, onRejected: any) =>
        makeResult(queue.shift()).then(onFulfilled, onRejected);
      return t;
    },
  };
  return fake;
};

const makeResult = (rows: unknown): any => {
  // rows is an array; we return a value that is both iterable (for
  // `const [row] = await ...`) and thenable.
  const arr = Array.isArray(rows) ? rows : [rows];
  const base: any = [...arr];
  base.then = (onFulfilled: any, onRejected: any) =>
    Promise.resolve(arr).then(onFulfilled, onRejected);
  base.length = arr.length;
  return base;
};

const importApi = async () => {
  const m = await import(`./[derbyname].ts?cb=${Math.random()}`);
  return m.GET;
};

const restoreAll = () => {
  for (const m of activeMocks) m.restore();
  activeMocks = [];
};

const installMocks = (overrides: { access?: boolean; premium?: boolean; rows?: unknown[][] } = {}) => {
  restoreAll();
  allowAccess = overrides.access ?? true;
  premiumBadgesEnabled = overrides.premium ?? true;
  queue = [...(overrides.rows ?? [])];

  activeMocks.push(
    test.mock.module("~/db", {
      namedExports: { getDb: () => makeFakeDb() },
    }),
  );
  activeMocks.push(
    test.mock.module("~/utils/premium-access.ts", {
      namedExports: {
        derbynameHasPremiumBadgeAccess: async () => allowAccess,
      },
    }),
  );
  activeMocks.push(
    test.mock.module("~/utils/feature-flags.ts", {
      namedExports: {
        isPremiumBadgesEnabled: () => premiumBadgesEnabled,
        isPremiumClubManagerEnabled: () => false,
        getPublicFeatureFlags: () => ({ premiumBadges: premiumBadgesEnabled, premiumClubManager: false }),
      },
    }),
  );
};

test.afterEach(restoreAll);

const makeEvent = (derbyname: string) => ({
  params: { derbyname },
  request: new Request(`http://localhost/api/badge/${derbyname}`),
});

test("returns 400 when derbyname is empty", async () => {
  installMocks();
  const GET = await importApi();
  const res = await GET(makeEvent("   "));
  assert.equal(res.status, 400);
});

test("returns 404 when premium badges feature is disabled", async () => {
  installMocks({ premium: false });
  const GET = await importApi();
  const res = await GET(makeEvent("alpha"));
  assert.equal(res.status, 404);
});

test("returns 403 when access is denied", async () => {
  installMocks({ access: false });
  const GET = await importApi();
  const res = await GET(makeEvent("alpha"));
  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { error: "premium requis" });
});

test("returns SVG with escaped name and numRoster when access granted", async () => {
  installMocks({ rows: [[{ name: `Q "the <quick> & brown"`, numRoster: "007" }]] });
  const GET = await importApi();
  const res = await GET(makeEvent("alpha"));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("Content-Type"), "image/svg+xml; charset=utf-8");
  const body = await res.text();
  assert.match(body, /&amp;/);
  assert.match(body, /&lt;quick>/);
  assert.match(body, /&quot;/);
  assert.match(body, /#007/);
  assert.match(body, /Q [^<]+quick/);
});

test("falls back to derbyname key and em-dash when DB returns nothing", async () => {
  installMocks({ rows: [] });
  const GET = await importApi();
  const res = await GET(makeEvent("alpha"));
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, />alpha</);
  assert.match(body, /#—/);
});

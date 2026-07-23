import assert from "node:assert/strict";
import test from "node:test";

let premiumEnabled = true;
let queue: unknown[][] = [];

let activeMocks: Array<{ restore: () => void }> = [];

const restoreAll = () => {
  for (const m of activeMocks) m.restore();
  activeMocks = [];
  queue = [];
};

const installMocks = (opts: { premium?: boolean; rows?: unknown[][] } = {}) => {
  restoreAll();
  premiumEnabled = opts.premium ?? true;
  queue = [...(opts.rows ?? [])];
  activeMocks.push(
    test.mock.module("~/db", {
      namedExports: {
        getDb: () => {
          const fake: any = {
            select: () => fake,
            from: () => {
              const t: any = {
                where: () => {
                  const result = queue.shift() ?? [];
                  return makeResult(result);
                },
              };
              t.then = (onFulfilled: any, onRejected: any) =>
                makeResult(queue.shift() ?? []).then(onFulfilled, onRejected);
              return t;
            },
          };
          return fake;
        },
      },
    }),
  );
  activeMocks.push(
    test.mock.module("~/utils/feature-flags.ts", {
      namedExports: {
        isPremiumClubManagerEnabled: () => premiumEnabled,
        isPremiumBadgesEnabled: () => false,
        getPublicFeatureFlags: () => ({ premiumClubManager: premiumEnabled, premiumBadges: false }),
      },
    }),
  );
};

const makeResult = (rows: unknown): any => {
  const arr = Array.isArray(rows) ? rows : [rows];
  const out: any = [...arr];
  out.then = (onFulfilled: any, onRejected: any) =>
    Promise.resolve(arr).then(onFulfilled, onRejected);
  out.length = arr.length;
  return out;
};

test.afterEach(restoreAll);

const importApi = async () => (await import(`./roster.ts?cb=${Math.random()}`)).GET;

const makeEvent = (clubId?: string) => ({
  request: new Request(`http://localhost/api/premium/roster${clubId ? "?clubId=" + clubId : ""}`),
});

test("returns 404 when feature flag is off", async () => {
  installMocks({ premium: false });
  const GET = await importApi();
  const res = await GET(makeEvent("club-1"));
  assert.equal(res.status, 404);
});

test("returns 400 when clubId is missing", async () => {
  installMocks();
  const GET = await importApi();
  const res = await GET(makeEvent());
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "clubId requis" });
});

test("returns the roster items", async () => {
  installMocks({
    rows: [
      [
        { id: 1, clubId: "club-1", displayName: "Alice" },
        { id: 2, clubId: "club-1", displayName: "Bob" },
      ],
    ],
  });
  const GET = await importApi();
  const res = await GET(makeEvent("club-1"));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.items.length, 2);
  assert.equal(body.items[0].displayName, "Alice");
});

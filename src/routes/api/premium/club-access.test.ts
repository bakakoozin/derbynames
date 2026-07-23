import assert from "node:assert/strict";
import test from "node:test";

let premiumClubManagerEnabled = true;
let insertedValues: unknown = null;
let insertError: Error | null = null;

let activeMocks: Array<{ restore: () => void }> = [];

const restoreAll = () => {
  for (const m of activeMocks) m.restore();
  activeMocks = [];
  insertedValues = null;
  insertError = null;
};

const installMocks = () => {
  restoreAll();
  // Re-set the value after restore (restoreAll() resets it).
  // insertError is set in caller after installMocks().
  activeMocks.push(
    test.mock.module("~/db", {
      namedExports: {
        getDb: () => ({
          insert: () => ({
            values: (v: unknown) => {
              insertedValues = v;
              if (insertError) return Promise.reject(insertError);
              return Promise.resolve();
            },
          }),
        }),
      },
    }),
  );
  activeMocks.push(
    test.mock.module("~/utils/feature-flags.ts", {
      namedExports: {
        isPremiumClubManagerEnabled: () => premiumClubManagerEnabled,
        isPremiumBadgesEnabled: () => false,
        getPublicFeatureFlags: () => ({ premiumClubManager: premiumClubManagerEnabled, premiumBadges: false }),
      },
    }),
  );
};

test.afterEach(restoreAll);

const importApi = async () => (await import(`./club-access.ts?cb=${Math.random()}`)).POST;

const makeEvent = (body: unknown) => ({
  request: new Request("http://localhost/api/premium/club-access", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  }),
});

test("returns 404 when the feature flag is off", async () => {
  installMocks();
  premiumClubManagerEnabled = false;
  const POST = await importApi();
  const res = await POST(makeEvent({ clubId: "c1", email: "a@b.co" }));
  assert.equal(res.status, 404);
});

test("returns 400 when clubId is missing", async () => {
  installMocks();
  premiumClubManagerEnabled = true;
  const POST = await importApi();
  const res = await POST(makeEvent({ email: "a@b.co" }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "données invalides" });
});

test("returns 400 when email is missing", async () => {
  installMocks();
  premiumClubManagerEnabled = true;
  const POST = await importApi();
  const res = await POST(makeEvent({ clubId: "c1" }));
  assert.equal(res.status, 400);
});

test("returns 400 when email is invalid", async () => {
  installMocks();
  premiumClubManagerEnabled = true;
  const POST = await importApi();
  const res = await POST(makeEvent({ clubId: "c1", email: "not-an-email" }));
  assert.equal(res.status, 400);
});

test("inserts a pending request and returns ok", async () => {
  installMocks();
  premiumClubManagerEnabled = true;
  const POST = await importApi();
  const res = await POST(makeEvent({
    clubId: "club-1",
    email: "  Alice@Example.com ",
    message: "Hello, manager!",
  }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, received: true });
  assert.deepEqual(insertedValues, {
    clubId: "club-1",
    requesterEmail: "alice@example.com",
    status: "pending",
    adminNote: "Hello, manager!",
  });
});

test("truncates a long message to 2000 chars and returns null when missing", async () => {
  installMocks();
  premiumClubManagerEnabled = true;
  const POST = await importApi();
  const longMessage = "x".repeat(5000);
  await POST(makeEvent({ clubId: "club-1", email: "a@b.co", message: longMessage }));
  assert.equal((insertedValues as any).adminNote.length, 2000);

  await POST(makeEvent({ clubId: "club-1", email: "a@b.co", message: "   " }));
  assert.equal((insertedValues as any).adminNote, null);
});

test("returns 500 on insert failure", async () => {
  installMocks();
  premiumClubManagerEnabled = true;
  insertError = new Error("boom");
  const POST = await importApi();
  const res = await POST(makeEvent({ clubId: "club-1", email: "a@b.co" }));
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { error: "erreur serveur" });
});

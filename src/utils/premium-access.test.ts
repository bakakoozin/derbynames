import assert from "node:assert/strict";
import test from "node:test";

// Mutable state for the fake DB — replaced uniquely per test.
let currentResults: unknown[][] = [[]];

const buildThenable = (): any => {
  const t: any = {
    from() {
      return t;
    },
    where() {
      t._resolve = Promise.resolve(currentResults[index.value] ?? []);
      index.value += 1;
      return t;
    },
    limit() {
      return t;
    },
    then(onFulfilled: any, onRejected: any) {
      return t._resolve.then(onFulfilled, onRejected);
    },
  };
  return t;
};

let index = { value: 0 };

const resetResults = (results: unknown[][]) => {
  currentResults = results;
  index = { value: 0 };
};

test.mock.module("../db/index.ts", {
  namedExports: {
    getDb: () => ({
      select: () => buildThenable(),
    }),
  },
});

const { derbynameHasPremiumBadgeAccess } = await import("./premium-access");

test("derbynameHasPremiumBadgeAccess returns false on empty key", async () => {
  resetResults([[]]);
  assert.equal(await derbynameHasPremiumBadgeAccess("   "), false);
});

test("derbynameHasPremiumBadgeAccess returns false when derbyname row missing/unconfirmed", async () => {
  resetResults([[]]);
  assert.equal(await derbynameHasPremiumBadgeAccess("ghost"), false);
});

test("derbynameHasPremiumBadgeAccess returns false when confirmed derbyname has no club", async () => {
  resetResults([
    [{ email: "alice@example.com", clubId: null, emailConfirmed: true }],
  ]);
  assert.equal(await derbynameHasPremiumBadgeAccess("alice"), false);
});

test("derbynameHasPremiumBadgeAccess returns false when membership is missing", async () => {
  resetResults([
    [{ email: "alice@example.com", clubId: "club-1", emailConfirmed: true }],
    [],
  ]);
  assert.equal(await derbynameHasPremiumBadgeAccess("alice"), false);
});

test("derbynameHasPremiumBadgeAccess returns true when membership premium is unlimited", async () => {
  resetResults([
    [{ email: "alice@example.com", clubId: "club-1", emailConfirmed: true }],
    [{ premiumValidUntil: null }],
  ]);
  assert.equal(await derbynameHasPremiumBadgeAccess("alice"), true);
});

test("derbynameHasPremiumBadgeAccess returns true when membership premium is in the future", async () => {
  const future = new Date(Date.now() + 60_000);
  resetResults([
    [{ email: "alice@example.com", clubId: "club-1", emailConfirmed: true }],
    [{ premiumValidUntil: future }],
  ]);
  assert.equal(await derbynameHasPremiumBadgeAccess("alice"), true);
});

test("derbynameHasPremiumBadgeAccess returns false when membership premium is expired", async () => {
  const past = new Date(Date.now() - 60_000);
  resetResults([
    [{ email: "alice@example.com", clubId: "club-1", emailConfirmed: true }],
    [{ premiumValidUntil: past }],
  ]);
  assert.equal(await derbynameHasPremiumBadgeAccess("alice"), false);
});

test("derbynameHasPremiumBadgeAccess accepts ISO string for premiumValidUntil", async () => {
  const future = new Date(Date.now() + 60_000).toISOString();
  resetResults([
    [{ email: "alice@example.com", clubId: "club-1", emailConfirmed: true }],
    [{ premiumValidUntil: future }],
  ]);
  assert.equal(await derbynameHasPremiumBadgeAccess("alice"), true);
});

test("derbynameHasPremiumBadgeAccess normalizes trims/case", async () => {
  resetResults([
    [{ email: "alice@example.com", clubId: "club-1", emailConfirmed: true }],
    [{ premiumValidUntil: null }],
  ]);
  assert.equal(await derbynameHasPremiumBadgeAccess("  ALICE  "), true);
});

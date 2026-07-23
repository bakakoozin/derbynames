import assert from "node:assert/strict";
import test from "node:test";

const importApi = () => import("./feature-flags");

test("api/feature-flags returns the public feature flags", async () => {
  const previous1 = process.env.FEATURE_PREMIUM_CLUB_MANAGER;
  const previous2 = process.env.FEATURE_PREMIUM_BADGES;
  process.env.FEATURE_PREMIUM_CLUB_MANAGER = "1";
  process.env.FEATURE_PREMIUM_BADGES = "true";

  try {
    const { GET } = await importApi();
    const res = await GET();
    assert.equal(res.status, 200);
    assert.equal(
      res.headers.get("Content-Type"),
      "application/json",
    );
    const body = await res.json();
    assert.deepEqual(body, {
      premiumClubManager: true,
      premiumBadges: true,
    });
  } finally {
    if (previous1 === undefined) delete process.env.FEATURE_PREMIUM_CLUB_MANAGER;
    else process.env.FEATURE_PREMIUM_CLUB_MANAGER = previous1;
    if (previous2 === undefined) delete process.env.FEATURE_PREMIUM_BADGES;
    else process.env.FEATURE_PREMIUM_BADGES = previous2;
  }
});

test("api/feature-flags returns false when env is unset", async () => {
  const previous1 = process.env.FEATURE_PREMIUM_CLUB_MANAGER;
  const previous2 = process.env.FEATURE_PREMIUM_BADGES;
  delete process.env.FEATURE_PREMIUM_CLUB_MANAGER;
  delete process.env.FEATURE_PREMIUM_BADGES;

  try {
    const { GET } = await importApi();
    const res = await GET();
    const body = await res.json();
    assert.deepEqual(body, {
      premiumClubManager: false,
      premiumBadges: false,
    });
  } finally {
    if (previous1 !== undefined) process.env.FEATURE_PREMIUM_CLUB_MANAGER = previous1;
    if (previous2 !== undefined) process.env.FEATURE_PREMIUM_BADGES = previous2;
  }
});

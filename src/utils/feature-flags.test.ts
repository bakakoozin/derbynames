import assert from "node:assert/strict";
import test from "node:test";

import {
  getPublicFeatureFlags,
  isPremiumBadgesEnabled,
  isPremiumClubManagerEnabled,
} from "~/utils/feature-flags";

const withEnv = <T>(key: string, value: string | undefined, fn: () => T): T => {
  const previous = process.env[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
  try {
    return fn();
  } finally {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  }
};

test("isPremiumClubManagerEnabled returns false when env is unset", () => {
  withEnv("FEATURE_PREMIUM_CLUB_MANAGER", undefined, () => {
    assert.equal(isPremiumClubManagerEnabled(), false);
  });
});

test("isPremiumClubManagerEnabled accepts 1/true/yes/on (case + space insensitive)", () => {
  for (const truthy of ["1", "true", "TRUE", " yes ", "On", "on"]) {
    withEnv("FEATURE_PREMIUM_CLUB_MANAGER", truthy, () => {
      assert.equal(isPremiumClubManagerEnabled(), true, `value ${truthy!}`);
    });
  }
});

test("isPremiumClubManagerEnabled rejects anything else", () => {
  for (const falsy of ["0", "false", "no", "off", "", "random"]) {
    withEnv("FEATURE_PREMIUM_CLUB_MANAGER", falsy, () => {
      assert.equal(isPremiumClubManagerEnabled(), false, `value ${falsy!}`);
    });
  }
});

test("isPremiumBadgesEnabled reads its own variable", () => {
  withEnv("FEATURE_PREMIUM_BADGES", "1", () => {
    assert.equal(isPremiumBadgesEnabled(), true);
  });
  withEnv("FEATURE_PREMIUM_BADGES", "0", () => {
    assert.equal(isPremiumBadgesEnabled(), false);
  });
});

test("getPublicFeatureFlags aggregates both flags", () => {
  withEnv("FEATURE_PREMIUM_CLUB_MANAGER", "1", () =>
    withEnv("FEATURE_PREMIUM_BADGES", "true", () => {
      assert.deepEqual(getPublicFeatureFlags(), {
        premiumClubManager: true,
        premiumBadges: true,
      });
    }),
  );
});

import test from "node:test";
import assert from "node:assert/strict";
import { parsePendingClubJson } from "~/utils/pending-club";

test("parsePendingClubJson returns null on invalid payloads", () => {
  assert.equal(parsePendingClubJson(null), null);
  assert.equal(parsePendingClubJson(""), null);
  assert.equal(parsePendingClubJson("{}"), null);
  assert.equal(parsePendingClubJson("{\"name\":\"   \"}"), null);
  assert.equal(parsePendingClubJson("not-json"), null);
});

test("parsePendingClubJson trims and normalizes optional fields", () => {
  const parsed = parsePendingClubJson(
    JSON.stringify({
      name: "  Team A  ",
      website: " https://club.test ",
      department: " 75 ",
    }),
  );

  assert.deepEqual(parsed, {
    name: "Team A",
    website: "https://club.test",
    department: "75",
    parentClubId: undefined,
    facebookUrl: undefined,
    instagramUrl: undefined,
    twitterUrl: undefined,
    logoUrl: undefined,
  });
});

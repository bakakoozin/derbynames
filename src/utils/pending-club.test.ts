import assert from "node:assert/strict";
import test from "node:test";
import {
  makeUserProposedClubId,
  parsePendingClubJson,
} from "~/utils/pending-club";

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

test("parsePendingClubJson keeps trimmed parentClubId when present", () => {
  const parsed = parsePendingClubJson(
    JSON.stringify({ name: "Team", parentClubId: " parent-1 " }),
  );
  assert.equal(parsed?.parentClubId, "parent-1");
});

test("parsePendingClubJson drops empty optional fields", () => {
  const parsed = parsePendingClubJson(
    JSON.stringify({
      name: "Team",
      website: "   ",
      facebookUrl: "",
      instagramUrl: undefined,
    }),
  );
  assert.equal(parsed?.website, undefined);
  assert.equal(parsed?.facebookUrl, undefined);
  assert.equal(parsed?.instagramUrl, undefined);
});

test("makeUserProposedClubId normalizes name, slugifies and prefixes 'u-'", () => {
  const id = makeUserProposedClubId(" Équipe de Roller Paris !! ");
  assert.match(id, /^u-equipe-de-roller-paris-[a-z0-9]{8}$/);
});

test("makeUserProposedClubId handles accented/lowercase input", () => {
  const id = makeUserProposedClubId("Ñandú & Co.");
  // Ñ → n, & and . → dropped, spaces → hyphen
  assert.match(id, /^u-nandu-co-[a-z0-9]{8}$/);
});

test("makeUserProposedClubId caps at 60 chars before suffix", () => {
  const longName = "A".repeat(200);
  const id = makeUserProposedClubId(longName);
  // u-(60 chars)-suffix(8)
  const [, base] = id.split("-");
  // base = first letter "a" (lowercased)
  const parts = id.split("-");
  // the base part between "u-" and the suffix is at most 60 chars
  const middle = parts.slice(1, -1).join("-");
  assert.ok(middle.length <= 60, `middle length ${middle.length}`);
  assert.ok(id.endsWith(parts.at(-1)!));
});

test("makeUserProposedClubId returns u-<suffix> for empty name", () => {
  const id = makeUserProposedClubId("");
  assert.match(id, /^u-[a-z0-9]{8}$/);
});

test("makeUserProposedClubId returns u-<suffix> for non-alpha name", () => {
  const id = makeUserProposedClubId("!!!");
  assert.match(id, /^u-[a-z0-9]{8}$/);
});

test("makeUserProposedClubId produces unique suffixes", () => {
  const ids = new Set<string>();
  for (let i = 0; i < 50; i += 1) ids.add(makeUserProposedClubId("Team A"));
  // Probabilistic : 50 ids should be distinct, statistically guaranteed.
  assert.equal(ids.size, 50);
});

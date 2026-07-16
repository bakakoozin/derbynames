import test from "node:test";
import assert from "node:assert/strict";
import { DERBY_TYPES, isDerbyType } from "~/utils/constants";

test("DERBY_TYPES exposes expected values", () => {
  assert.deepEqual(DERBY_TYPES, ["player", "referee", "coach"]);
});

test("isDerbyType validates allowed values", () => {
  assert.equal(isDerbyType("player"), true);
  assert.equal(isDerbyType("referee"), true);
  assert.equal(isDerbyType("coach"), true);
  assert.equal(isDerbyType("manager"), false);
  assert.equal(isDerbyType(""), false);
  assert.equal(isDerbyType(null), false);
});

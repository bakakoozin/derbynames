import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserIdByEmail } from "~/utils/users";

type SelectStage = {
  results: unknown[][];
  index: { value: number };
  calls: Array<{ where: unknown; limit?: number }>;
};

const createFakeDb = (overrides: {
  selectResults?: unknown[][];
  insertError?: boolean;
}) => {
  const selectCalls: Array<{ where: unknown; limit?: number }> = [];
  const insertCalls: Array<{ values: unknown }> = [];
  const index = { value: 0 };
  const results = overrides.selectResults ?? [];

  const buildThenable = () => {
    const t: any = {
      from() {
        return t;
      },
      where(arg: unknown) {
        selectCalls.push({ where: arg });
        t._resolve = Promise.resolve(results[index.value] ?? []);
        index.value += 1;
        return t;
      },
      limit(n: number) {
        selectCalls[selectCalls.length - 1]!.limit = n;
        return t;
      },
      then(onFulfilled: any, onRejected: any) {
        return t._resolve.then(onFulfilled, onRejected);
      },
    };
    return t;
  };

  const insertChain: any = {
    values(payload: unknown) {
      insertCalls.push({ values: payload });
      if (overrides.insertError) return Promise.reject(new Error("db failure"));
      return Promise.resolve();
    },
  };

  const db: any = {
    select: () => buildThenable(),
    insert: () => insertChain,
  };

  return { db, selectCalls, insertCalls };
};

test("ensureUserIdByEmail returns existing user id when row is found", async () => {
  const { db } = createFakeDb({
    selectResults: [[{ id: 42 }]],
  });

  const id = await ensureUserIdByEmail(db, "Foo@Bar.test");
  assert.equal(id, 42);
});

test("ensureUserIdByEmail creates a user, trims and lowercases email", async () => {
  const { db, insertCalls } = createFakeDb({
    selectResults: [[], [{ id: 99 }]],
  });

  const id = await ensureUserIdByEmail(db, "  NEW@Example.com  ");
  assert.equal(id, 99);
  assert.equal(insertCalls.length, 1);
  assert.deepEqual(insertCalls[0]?.values, { email: "new@example.com" });
});

test("ensureUserIdByEmail throws when post-insert lookup fails", async () => {
  const { db } = createFakeDb({
    selectResults: [[], []],
  });

  await assert.rejects(
    () => ensureUserIdByEmail(db, "missing@example.com"),
    /impossible de cr\u00e9er\/r\u00e9cup\u00e9rer l'utilisateur/,
  );
});

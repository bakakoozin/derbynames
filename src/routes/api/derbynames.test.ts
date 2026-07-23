import assert from "node:assert/strict";
import test from "node:test";

const realFetch = globalThis.fetch;
(globalThis as any).fetch = async (url: string | URL, init?: any) => {
  return new Response("{}", { status: 200 });
};

let activeMocks: Array<{ restore: () => void }> = [];
let queue: unknown[][] = [];
let updateCalls: Array<{ set: unknown }> = [];
let insertCalls: Array<{ values: unknown }> = [];
let deleteCalls: number = 0;

const restoreAll = () => {
  for (const m of activeMocks) m.restore();
  activeMocks = [];
  queue = [];
  updateCalls = [];
  insertCalls = [];
  deleteCalls = 0;
  (globalThis as any).fetch = realFetch;
};

const makeResult = (rows: unknown[]): any => {
  const out: any = [...rows];
  out.then = (onFulfilled: any, onRejected: any) =>
    Promise.resolve(rows).then(onFulfilled, onRejected);
  out.length = rows.length;
  out.map = Array.prototype.map.bind(out);
  out.filter = Array.prototype.filter.bind(out);
  out.find = Array.prototype.find.bind(out);
  return out;
};

const buildFakeDb = (): any => {
  const fake: any = {
    select: () => fake,
    from: () => {
      const t: any = {
        innerJoin: () => t,
        leftJoin: () => t,
        orderBy: () => {
          const r: any = {
            limit: () => {
              const result = queue.shift() ?? [];
              return makeResult(result);
            },
          };
          Object.defineProperty(r, "then", {
            get() {
              return (onFulfilled: any, onRejected: any) =>
                makeResult(queue.shift() ?? []).then(onFulfilled, onRejected);
            },
          });
          return r;
        },
        where: () => {
          const r: any = {
            orderBy: () => r,
            limit: () => {
              const result = queue.shift() ?? [];
              return makeResult(result);
            },
          };
          Object.defineProperty(r, "then", {
            get() {
              return (onFulfilled: any, onRejected: any) =>
                makeResult(queue.shift() ?? []).then(onFulfilled, onRejected);
            },
          });
          return r;
        },
      };
      t.then = (onFulfilled: any, onRejected: any) =>
        makeResult(queue.shift() ?? []).then(onFulfilled, onRejected);
      return t;
    },
    update: () => {
      const u: any = {
        set: (s: unknown) => {
          u._set = s;
          return u;
        },
        where: () => {
          updateCalls.push({ set: u._set });
          return Promise.resolve();
        },
      };
      return u;
    },
    insert: () => {
      const i: any = {
        values: (v: unknown) => {
          insertCalls.push({ values: v });
          return Promise.resolve();
        },
      };
      return i;
    },
    delete: () => {
      deleteCalls += 1;
      return { where: () => Promise.resolve() };
    },
  };
  return fake;
};

const installMocks = () => {
  restoreAll();
  (globalThis as any).fetch = async (url: string | URL, init?: any) => {
    return new Response("{}", { status: 200 });
  };
  activeMocks.push(
    test.mock.module("~/db", {
      namedExports: { getDb: () => buildFakeDb() },
    }),
  );
  activeMocks.push(
    test.mock.module("~/utils/users.ts", {
      namedExports: {
        ensureUserIdByEmail: async (_db: unknown, _email: string) => 99,
      },
    }),
  );
};

test.afterEach(restoreAll);

const importApi = async () => {
  const m = await import(`./derbynames.ts?cb=${Math.random()}`);
  return m;
};

const postEvent = (body: unknown) => ({
  request: new Request("http://localhost/api/derbynames", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  }),
});

const getEvent = (q = "") => ({
  request: new Request(`http://localhost/api/derbynames${q ? "?" + q : ""}`),
});

test("POST returns 400 when email is invalid", async () => {
  installMocks();
  const { POST } = await importApi();
  const res = await POST(postEvent({ name: "alpha", email: "not-an-email", type: "player" }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "données invalides" });
});

test("POST returns 400 when type is invalid", async () => {
  installMocks();
  const { POST } = await importApi();
  const res = await POST(postEvent({ name: "alpha", email: "a@b.co", type: "manager" }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "type invalide" });
});

test("POST rejects XSS in name/email/numRoster", async () => {
  installMocks();
  const { POST } = await importApi();
  for (const payload of [
    { name: "<script>alert(1)</script>", email: "a@b.co", type: "player" },
    { name: "alpha", email: "<iframe>x</iframe>", type: "player" },
    { name: "alpha", email: "a@b.co", numRoster: "<img src=x>", type: "player" },
  ]) {
    const res = await POST(postEvent(payload));
    assert.equal(res.status, 400, JSON.stringify(payload));
  }
});

test("POST returns 400 when numRoster is longer than 4 chars", async () => {
  installMocks();
  const { POST } = await importApi();
  const res = await POST(postEvent({ name: "alpha", email: "a@b.co", numRoster: "12345", type: "player" }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "données invalides" });
});

test("POST ignores newClub when its name is too short (no club, no error)", async () => {
  installMocks();
  queue = [[]]; // existingForEmail empty
  queue.push([]); // existingDerbyname empty
  const { POST } = await importApi();
  const res = await POST(postEvent({
    name: "alpha",
    email: "a@b.co",
    type: "player",
    newClub: { name: "A" }, // ignored (< 2 chars)
  }));
  assert.equal(res.status, 200);
});

test("POST rejects newClub with XSS payload", async () => {
  installMocks();
  const { POST } = await importApi();
  const res = await POST(postEvent({
    name: "alpha",
    email: "a@b.co",
    type: "player",
    newClub: { name: "Team A", website: "<script>x</script>" },
  }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "données invalides (club)" });
});

test("POST clubOnly requires an existing derbyname confirmed for the email", async () => {
  installMocks();
  queue = [[]]; // no derbyname confirmed
  const { POST } = await importApi();
  const res = await POST(postEvent({
    email: "a@b.co",
    type: "player",
    clubOnly: true,
    club: { id: "club-1" },
  }));
  assert.equal(res.status, 400);
});

test("POST clubOnly succeeds for an existing confirmed derbyname", async () => {
  installMocks();
  queue = [
    [{ derbyname: "alpha", derbyType: "player", name: "Alice", email: "a@b.co", emailConfirmed: true, numRoster: "1", clubId: "old-club" }],
  ];
  const { POST } = await importApi();
  const res = await POST(postEvent({
    email: "a@b.co",
    type: "player",
    clubOnly: true,
    club: { id: "new-club" },
  }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.player.clubOnly, true);
  assert.equal(body.player.derbyname, "alpha");
  // a pending action for confirmation is inserted
  const action = insertCalls.find((i) => (i.values as any).actionType === "derbyname.confirm");
  assert.ok(action, "should create a confirmation action");
});

test("POST returns 400 when the requested derbyname is already taken", async () => {
  installMocks();
  // No existing for email, but the derbyname is already taken by someone else.
  queue = [[]];
  // Second call (existingDerbyname) returns an existing confirmed derbyname
  // with a different email.
  queue.push([
    {
      derbyname: "alpha",
      derbyType: "player",
      name: "Someone",
      email: "other@example.com",
      emailConfirmed: true,
      numRoster: "1",
      clubId: "c1",
    },
  ]);
  const { POST } = await importApi();
  const res = await POST(postEvent({
    name: "alpha",
    email: "a@b.co",
    type: "player",
  }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "nom déjà pris" });
});

test("POST creates a new derbyname and returns the player shape", async () => {
  installMocks();
  // existingForEmail is empty
  queue = [[]];
  // existingDerbyname lookup returns nothing
  queue.push([]);
  const { POST } = await importApi();
  const res = await POST(postEvent({
    name: "alpha",
    email: "alice@example.com",
    numRoster: "7",
    type: "player",
    club: { id: "club-1", name: "Club 1" },
  }));
  const body = await res.json();
  if (res.status !== 200 || body.player?.derbyname !== "alpha") {
    console.log("create test got:", res.status, JSON.stringify(body));
  }
  assert.equal(res.status, 200);
  assert.equal(body.player.name, "alpha");
  assert.equal(body.player.email, "alice@example.com");
  assert.equal(body.player.numRoster, "7");
  assert.deepEqual(body.player.club, { id: "club-1", name: "Club 1" });
  // derbyname row inserted + history inserted + action inserted
  const dnInsert = insertCalls.find((i) => (i.values as any).derbyname === "alpha");
  assert.ok(dnInsert, "should insert the derbyname row");
  const action = insertCalls.find((i) => (i.values as any).actionType === "derbyname.confirm");
  assert.ok(action, "should insert the confirmation action");
});

test("POST replacement: same email already has a confirmed derbyname", async () => {
  installMocks();
  // existingForEmail returns the previously confirmed derbyname
  queue = [[{
    derbyname: "old-1",
    derbyType: "player",
    name: "Alice",
    email: "alice@example.com",
    emailConfirmed: true,
    numRoster: "1",
    clubId: "c1",
  }]];
  // existingDerbyname lookup for the new name returns nothing
  queue.push([]);
  const { POST } = await importApi();
  const res = await POST(postEvent({
    name: "alpha",
    email: "alice@example.com",
    type: "player",
  }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.player.replacementOf, "old-1");
  const dnInsert = insertCalls.find((i) => (i.values as any).derbyname === "alpha");
  assert.ok(dnInsert);
});

test("POST replacement blocked when the new derbyname is already taken by another email", async () => {
  installMocks();
  queue = [[{
    derbyname: "old-1",
    derbyType: "player",
    name: "Alice",
    email: "alice@example.com",
    emailConfirmed: true,
    numRoster: "1",
    clubId: "c1",
  }]];
  queue.push([{
    derbyname: "alpha",
    derbyType: "player",
    name: "Bob",
    email: "bob@example.com",
    emailConfirmed: true,
    numRoster: "9",
    clubId: "c2",
  }]);
  const { POST } = await importApi();
  const res = await POST(postEvent({
    name: "alpha",
    email: "alice@example.com",
    type: "player",
  }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "nom déjà pris" });
});

test("POST replacement blocked when trying to keep the same name", async () => {
  installMocks();
  queue = [[{
    derbyname: "alpha",
    derbyType: "player",
    name: "Alice",
    email: "alice@example.com",
    emailConfirmed: true,
    numRoster: "1",
    clubId: "c1",
  }]];
  const { POST } = await importApi();
  const res = await POST(postEvent({
    name: "alpha",
    email: "alice@example.com",
    type: "player",
  }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "ce derby name est déjà le vôtre (déjà confirmé)" });
});

test("GET returns the derbyname list with parent club names", async () => {
  installMocks();
  // First query: derbynames with left-joined clubs.
  queue = [[
    { derbyname: "alpha", derbyType: "player", numRoster: "1", clubId: "child", clubName: "Child", parentClubId: "parent", department: "75" },
  ]];
  // Second query: parent clubs lookup.
  queue.push([{ id: "parent", name: "Parent Club" }]);
  const m = await import(`./derbynames.ts?cb=${Math.random()}`);
  const { GET } = m;
  const res = await GET({
    request: new Request("http://localhost/api/derbynames"),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.length, 1);
  assert.equal(body[0].parentClubName, "Parent Club");
});

test("GET returns 400 when type is invalid", async () => {
  installMocks();
  const m = await import(`./derbynames.ts?cb=${Math.random()}`);
  const { GET } = m;
  const res = await GET({
    request: new Request("http://localhost/api/derbynames?type=bogus"),
  });
  assert.equal(res.status, 400);
});

import assert from "node:assert/strict";
import test from "node:test";

// The Toast module uses a module-level signal store. To get a clean state
// for each test, we re-import the module freshly.
const loadToast = async () => {
  // Use a unique query to force re-import per test.
  return await import(`./Toast.ctrl.ts?cache=${Math.random()}`);
};

test("ToastCtrl exposes success/error/warning/info helpers", async () => {
  const { ToastCtrl } = await loadToast();
  const ctrl = ToastCtrl();

  const sId = ctrl.success("S", "ok");
  const eId = ctrl.error("E", "boom");
  const wId = ctrl.warning("W", "warn");
  const iId = ctrl.info("I", "info");

  assert.ok(typeof sId === "string" && sId.length > 0);
  assert.ok(typeof eId === "string" && eId.length > 0);
  assert.ok(typeof wId === "string" && wId.length > 0);
  assert.ok(typeof iId === "string" && iId.length > 0);

  const list = ctrl.toasts();
  assert.equal(list.length, 4);
  assert.equal(list[0]?.type, "success");
  assert.equal(list[0]?.title, "S");
  assert.equal(list[0]?.message, "ok");
  assert.equal(list[1]?.type, "error");
  assert.equal(list[2]?.type, "warning");
  assert.equal(list[3]?.type, "info");

  // All are closable by default
  assert.equal(list.every((t: any) => t.closable === true), true);

  ctrl.clearAll();
});

test("addToast defaults to type 'info' and a closable toast", async () => {
  const { ToastCtrl } = await loadToast();
  const ctrl = ToastCtrl();

  const id = ctrl.addToast({ title: "Hello" });
  const list = ctrl.toasts();
  assert.equal(list.length, 1);
  assert.equal(list[0]?.id, id);
  assert.equal(list[0]?.type, "info");
  assert.equal(list[0]?.closable, true);

  ctrl.clearAll();
});

test("addToast calls the auto-remove timeout handler", async () => {
  const { ToastCtrl } = await loadToast();
  const ctrl = ToastCtrl();
  const origSetTimeout = globalThis.setTimeout;
  let capturedDelay = -1;
  let capturedCb: ((...args: any[]) => void) | null = null;
  (globalThis as any).setTimeout = (cb: (...args: any[]) => void, delay: number) => {
    capturedDelay = delay;
    capturedCb = cb;
    return 0 as any;
  };
  try {
    ctrl.addToast({ title: "A", duration: 1234 });
    assert.equal(capturedDelay, 1234);
    // invoke the captured callback to ensure removeToast works
    assert.equal(typeof capturedCb, "function");
    (capturedCb as any)([]);
    assert.equal(ctrl.toasts().length, 0);
  } finally {
    (globalThis as any).setTimeout = origSetTimeout;
    ctrl.clearAll();
  }
});

test("addToast honors closable=false", async () => {
  const { ToastCtrl } = await loadToast();
  const ctrl = ToastCtrl();

  ctrl.addToast({ title: "Stay", type: "warning", closable: false });
  assert.equal(ctrl.toasts()[0]?.closable, false);

  ctrl.clearAll();
});

test("removeToast removes the targeted toast", async () => {
  const { ToastCtrl } = await loadToast();
  const ctrl = ToastCtrl();

  const id1 = ctrl.addToast({ title: "A" });
  const id2 = ctrl.addToast({ title: "B" });
  ctrl.removeToast(id1);
  const list = ctrl.toasts();
  assert.equal(list.length, 1);
  assert.equal(list[0]?.id, id2);

  ctrl.clearAll();
});

test("removeToast on unknown id is a no-op", async () => {
  const { ToastCtrl } = await loadToast();
  const ctrl = ToastCtrl();
  ctrl.addToast({ title: "A" });
  ctrl.removeToast("does-not-exist");
  assert.equal(ctrl.toasts().length, 1);
  ctrl.clearAll();
});

test("clearAll empties the toast list", async () => {
  const { ToastCtrl } = await loadToast();
  const ctrl = ToastCtrl();
  ctrl.addToast({ title: "A" });
  ctrl.addToast({ title: "B" });
  ctrl.clearAll();
  assert.equal(ctrl.toasts().length, 0);
});

test("addToast returns a unique id per call", async () => {
  const { ToastCtrl } = await loadToast();
  const ctrl = ToastCtrl();
  const ids = new Set<string>();
  for (let i = 0; i < 20; i += 1) ids.add(ctrl.addToast({ title: "x" }));
  // Probabilistic but base36 / 9 chars is extremely collision-resistant.
  assert.equal(ids.size, 20);
  ctrl.clearAll();
});

// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

mount(() => <StartClient />, document.getElementById("app")!);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.warn("Service worker registration failed", error);
    });
  });
}

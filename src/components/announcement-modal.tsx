import { marked } from "marked";
import { createSignal, onMount, Show } from "solid-js";
import announcementsMd from "~/content/announcements.md?raw";

const STORAGE_KEY = "derbynames-announce-dismissed-sha256";

/** Markdown hors blocs <!-- ... --> ; si vide après nettoyage, pas d’affichage. */
function effectiveAnnouncementMarkdown(raw: string): string {
  return raw.replace(/<!--[\s\S]*?-->/g, "").trim();
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function AnnouncementModal() {
  const [open, setOpen] = createSignal(false);
  const [html, setHtml] = createSignal("");

  onMount(async () => {
    const effective = effectiveAnnouncementMarkdown(announcementsMd);
    if (!effective) return;

    let hash: string;
    try {
      hash = await sha256Hex(effective);
    } catch {
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === hash) return;
    } catch {
      /* navigation privée, etc. */
    }

    const rendered = marked(effective, { async: false }) as string;
    setHtml(rendered);
    setOpen(true);
  });

  async function dismiss() {
    const effective = effectiveAnnouncementMarkdown(announcementsMd);
    if (effective) {
      try {
        const hash = await sha256Hex(effective);
        localStorage.setItem(STORAGE_KEY, hash);
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
  }

  return (
    <Show when={open()}>
      <div
        class="fixed inset-0 z-[1200] flex items-center justify-center bg-dn-600/45 p-3 backdrop-blur-[1px]"
        role="presentation"
      >
        <div
          class="box-border max-h-[min(85vh,640px)] w-full max-w-[min(100%,28rem)] min-w-0 overflow-hidden border border-dn-500 bg-dn-100 shadow-[0_12px_48px_rgba(6,10,13,0.18)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-modal-title"
        >
          <div class="flex max-h-[min(85vh,640px)] min-h-0 flex-col">
            <div class="shrink-0 border-b border-dn-500/40 bg-dn-100 px-3 py-2 font-display text-lg text-dn-600">
              <span id="announcement-modal-title">Nouveautés</span>
            </div>
            <div
              class="announcement-md min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-gutter:stable]"
              tabindex="0"
              innerHTML={html()}
            />
            <div class="shrink-0 border-t border-dn-500/40 bg-dn-100 p-3">
              <button type="button" class="btn w-full cursor-pointer" onClick={() => void dismiss()}>
                Compris
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}

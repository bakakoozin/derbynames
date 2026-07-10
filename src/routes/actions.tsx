import { createSignal, JSX, Show } from "solid-js";
import { CreateDerbynameForm } from "~/components/forms/CreateDerbynameForm";
import { UpdateDerbynameNameForm } from "~/components/forms/UpdateDerbynameNameForm";
import { UpdateClubForm } from "~/components/forms/UpdateClubForm";

// ── Heroicons 2 outline (MIT) ──────────────────────────────────────────────

function IconUserPlus() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 shrink-0" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
  );
}

function IconShieldCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 shrink-0" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Z" />
    </svg>
  );
}

function IconPencilSquare() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 shrink-0" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 shrink-0" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.862 4.487Z" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 shrink-0" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 shrink-0 opacity-40" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────

function ActionItem(props: {
  icon: JSX.Element;
  label: string;
  modalTitle: string;
  children: (onClose: () => void) => JSX.Element;
}) {
  const [open, setOpen] = createSignal(false);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen(true)}
        class="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-dn-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dn-500"
      >
        <span class="text-dn-500">{props.icon}</span>
        <span class="font-display text-sm font-bold uppercase tracking-wide text-dn-500">
          {props.label}
        </span>
        <IconChevronRight />
      </button>

      <Show when={open()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
          <div
            class="box-border h-[95dvh] w-full max-w-125 min-w-0 overflow-x-hidden overflow-y-auto border border-dn-500 bg-dn-100 p-3 [scrollbar-gutter:stable]"
            role="dialog"
            aria-modal="true"
          >
            <div class="mb-3 flex items-center justify-between gap-2">
              <h2 class="font-display text-sm font-bold uppercase text-dn-500">
                {props.modalTitle}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                class="btn inline-flex items-center gap-2 text-sm"
              >
                <svg viewBox="0 0 16 16" fill="none" class="size-4 shrink-0" aria-hidden="true">
                  <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" stroke-width="1.75" />
                </svg>
                Fermer
              </button>
            </div>
            {props.children(() => setOpen(false))}
          </div>
        </div>
      </Show>
    </li>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function ActionsPage() {
  return (
    <main class="mx-auto w-full max-w-lg px-3 py-8">
      <h1 class="mb-4 font-display text-xl font-bold uppercase text-dn-500">
        Que souhaitez-vous faire ?
      </h1>

      <ul class="divide-y divide-dn-500 border border-dn-500">
        <ActionItem
          icon={<IconUserPlus />}
          label="Nouveau derby name — joueur"
          modalTitle="Créer mon derby name (joueuse / joueur)"
        >
          {(onClose) => <CreateDerbynameForm type="player" onClose={onClose} />}
        </ActionItem>

        <ActionItem
          icon={<IconShieldCheck />}
          label="Nouveau derby name — arbitre"
          modalTitle="Créer mon derby name d'arbitre"
        >
          {(onClose) => <CreateDerbynameForm type="referee" onClose={onClose} />}
        </ActionItem>

        <ActionItem
          icon={<IconPencilSquare />}
          label="Changer de derby name — joueur"
          modalTitle="Modifier mon derby name + roster (joueur)"
        >
          {(onClose) => <UpdateDerbynameNameForm type="player" onClose={onClose} />}
        </ActionItem>

        <ActionItem
          icon={<IconPencil />}
          label="Changer de derby name — arbitre"
          modalTitle="Modifier mon derby name d'arbitre"
        >
          {(onClose) => <UpdateDerbynameNameForm type="referee" onClose={onClose} />}
        </ActionItem>

        <ActionItem
          icon={<IconBuilding />}
          label="Changer de club / collectif"
          modalTitle="Modifier mon club / collectif"
        >
          {(onClose) => <UpdateClubForm onClose={onClose} />}
        </ActionItem>
      </ul>
    </main>
  );
}

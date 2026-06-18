import { For, Show, createEffect, createSignal } from "solid-js";
import { toast } from "~/ui/Toast";
import { useDebounce } from "~/hooks/debounce.hook";

type Club = {
  id: string;
  name: string;
  website?: string | null;
  logoUrl?: string | null;
  department?: string | null;
};

export type ClubSelection =
  | { kind: "existing"; club: { id: string; name: string } }
  | {
      kind: "create";
      club: {
        name: string;
        website?: string;
        department?: string;
        facebookUrl?: string;
        instagramUrl?: string;
        twitterUrl?: string;
        logoUrl?: string;
      };
    };

type ClubSelectorProps = {
  defaultValue?: string;
  name?: string;
  onChange?: (sel: ClubSelection) => void;
};

const CREATE_ID = "__create__";

const AUTRE: Club = { id: "autre", name: "Autre / non listé" };
const CREATE_META: Club = {
  id: CREATE_ID,
  name: "Créer un nouveau club",
};

const RESULTS_BOX_H = "h-56";

/** Icône plus en aplats (trait plein, style du site) */
function IconPlus(props: { class?: string }) {
  return (
    <svg
      class={props.class}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.75" />
    </svg>
  );
}

export function ClubSelector({ defaultValue = "autre", name, onChange }: ClubSelectorProps) {
  const [clubs, setClubs] = createSignal<Club[]>([AUTRE]);
  const [selectedClubId, setSelectedClubId] = createSignal<string>(defaultValue);
  const [pinnedClub, setPinnedClub] = createSignal<Club | null>(null);

  const [initialFetchDone, setInitialFetchDone] = createSignal(false);
  const [blockingLoad, setBlockingLoad] = createSignal(true);
  const [refreshing, setRefreshing] = createSignal(false);
  const [clubSearch, setClubSearch] = createSignal("");
  const debouncedSearch = useDebounce(clubSearch, 350);

  const [createName, setCreateName] = createSignal("");
  const [createDept, setCreateDept] = createSignal("");
  const [createWebsite, setCreateWebsite] = createSignal("");

  let fetchGeneration = 0;

  function mergePinned(rows: Club[]): Club[] {
    const pin = pinnedClub();
    if (
      pin &&
      pin.id !== "autre" &&
      pin.id !== CREATE_ID &&
      !rows.some((c) => c.id === pin.id)
    ) {
      return [pin, ...rows];
    }
    return rows;
  }

  async function loadClubs(q: string) {
    const gen = ++fetchGeneration;

    if (!initialFetchDone()) {
      setBlockingLoad(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await fetch("/api/rpc", {
        method: "POST",
        body: JSON.stringify({
          method: "clubs.list",
          params: { q: q.trim() },
        }),
      });
      const rpc = (await response.json()) as {
        result?: Club[];
        error?: string;
      };

      if (!response.ok || !Array.isArray(rpc.result)) {
        throw new Error(rpc.error || "Erreur de chargement");
      }

      const clubsData = rpc.result;

      if (gen !== fetchGeneration) return;

      let base =
        clubsData.length === 0
          ? []
          : clubsData.filter((c) => c.id !== "autre" && c.id !== CREATE_ID);
      base = mergePinned(base);

      base.sort((a, b) => a.name.localeCompare(b.name, "fr"));
      setClubs([AUTRE, ...base]);
    } catch (error: unknown) {
      if (gen !== fetchGeneration) return;
      toast.error(
        "Erreur de chargement",
        error instanceof Error ? error.message : "Erreur de chargement",
      );
      setClubs([AUTRE]);
    } finally {
      if (gen !== fetchGeneration) return;
      setBlockingLoad(false);
      setRefreshing(false);
      setInitialFetchDone(true);
    }
  }

  createEffect(() => {
    void debouncedSearch();
    void loadClubs(debouncedSearch());
  });

  createEffect(() => {
    const id = selectedClubId();
    createName();
    createDept();
    createWebsite();

    if (!onChange) return;

    if (id === "autre") {
      onChange({ kind: "existing", club: AUTRE });
      return;
    }

    if (id === CREATE_ID) {
      const nm = createName().trim();
      onChange({
        kind: "create",
        club: {
          name: nm.length ? nm : " ",
          department: createDept().trim() || undefined,
          website: createWebsite().trim() || undefined,
        },
      });
      return;
    }

    const club = clubs().find((c) => c.id === id);
    if (club) {
      onChange({ kind: "existing", club: { id: club.id, name: club.name } });
    }
  });

  function pickClub(club: Club) {
    if (club.id === "autre" || club.id === CREATE_ID) {
      setPinnedClub(null);
    } else {
      setPinnedClub(club);
    }
    setSelectedClubId(club.id);
  }

  function startCreateFlow() {
    const q = debouncedSearch().trim();
    if (q.length >= 2) {
      setCreateName(q);
    }
    pickClub(CREATE_META);
  }

  /** Lignes clubs hors « autre » (pour message vide filtré) */
  const clubsSansAutre = (): Club[] => clubs().filter((c) => c.id !== "autre");

  const hasSearchQuery = (): boolean => debouncedSearch().trim().length >= 1;

  return (
    <div class="flex min-h-0 min-w-0 w-full max-w-full flex-col gap-2 overflow-x-hidden">
      <input type="hidden" name={name || "club"} value={selectedClubId()} />

      <div class="flex shrink-0 items-center gap-2">
        <label class="flex-1 flex flex-col gap-1 text-xs text-dn-500" for="club-search">
          <span class="flex items-center gap-2">
            Rechercher un club
            <Show when={refreshing()}>
              <span
                class="inline-block size-3 animate-pulse rounded-full bg-dn-500/60"
                title="Actualisation…"
              />
            </Show>
          </span>
          <input
            id="club-search"
            class="input w-full"
            type="search"
            placeholder="Tapez pour filtrer la liste…"
            value={clubSearch()}
            onInput={(e) => setClubSearch(e.currentTarget.value)}
            autocomplete="off"
          />
        </label>
      </div>

      <div
        class={`relative flex min-h-0 min-w-0 w-full shrink-0 flex-col overflow-hidden border border-dn-500 bg-dn-100 ${RESULTS_BOX_H}`}
      >
        <Show when={blockingLoad()}>
          <div class="flex h-full items-center justify-center px-3 text-sm text-dn-500">
            Chargement des clubs…
          </div>
        </Show>

        <Show when={!blockingLoad()}>
          <div class="flex h-full min-h-0 flex-col">
            <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
              <For each={clubs()}>
                {(club) => {
                  const selected = () => selectedClubId() === club.id;
                  return (
                  <button
                    type="button"
                    aria-pressed={selected()}
                    class={`flex w-full cursor-pointer gap-3 items-center p-2 text-left transition ${
                      selected()
                        ? "border-l-4 border-dn-500 bg-dn-500/25 shadow-[inset_0_0_0_1px_rgba(86,89,82,0.12)]"
                        : "odd:bg-[rgba(0,0,0,0.05)] hover:bg-dn-500/15"
                    }`}
                    onClick={() => pickClub(club)}
                  >
                    <Show
                      when={club.id === "autre"}
                      fallback={
                        <>
                          <div
                            class={`flex h-10 min-w-[3rem] shrink-0 items-center justify-center px-1 text-center text-xs font-display tabular-nums ${
                              selected()
                                ? "bg-dn-600 text-dn-100"
                                : "bg-dn-500 text-dn-100"
                            }`}
                          >
                            {club.department?.trim() || "—"}
                          </div>
                          <span
                            class={`min-w-0 flex-1 truncate font-display ${
                              selected() ? "font-semibold text-dn-600" : "text-dn-600"
                            }`}
                          >
                            {club.name}
                          </span>
                        </>
                      }
                    >
                      <div
                        class={`flex h-10 min-w-[3rem] shrink-0 items-center justify-center border text-xs font-display ${
                          selected()
                            ? "border-dn-600 bg-dn-600 text-dn-100"
                            : "border-dn-500 bg-dn-100 text-dn-500"
                        }`}
                      >
                        —
                      </div>
                      <span
                        class={`min-w-0 flex-1 truncate font-display ${
                          selected() ? "font-semibold text-dn-600" : "text-dn-600"
                        }`}
                      >
                        {club.name}
                      </span>
                    </Show>
                  </button>
                  );
                }}
              </For>

              <Show when={hasSearchQuery() && clubsSansAutre().length === 0}>
                <div class="break-words px-3 py-4 text-center text-sm text-dn-500">
                  Aucun club ne correspond à « {debouncedSearch().trim()} ».
                </div>
              </Show>
            </div>

            <Show when={hasSearchQuery()}>
              <div class="shrink-0 border-t border-dn-500/40 bg-dn-100 p-1.5">
                <button
                  type="button"
                  class="btn flex w-full cursor-pointer items-center justify-center gap-2 py-2 font-display text-base"
                  onClick={() => startCreateFlow()}
                >
                  <IconPlus class="size-4 shrink-0 text-dn-100" />
                  Créer ce club
                </button>
              </div>
            </Show>
          </div>
        </Show>
      </div>

      <Show when={selectedClubId() === CREATE_ID}>
        <div class="flex shrink-0 flex-col gap-2 border border-dn-500 bg-dn-100 p-3">
          <p class="font-display text-sm text-dn-600">Nouveau club</p>
          <label class="text-xs text-dn-500" for="new-club-name">
            Nom du club *
          </label>
          <input
            id="new-club-name"
            class="input"
            required
            value={createName()}
            onInput={(e) => setCreateName(e.currentTarget.value)}
          />
          <label class="text-xs text-dn-500" for="new-club-dept">
            Département (optionnel)
          </label>
          <input
            id="new-club-dept"
            class="input"
            maxLength={8}
            placeholder="ex. 75"
            value={createDept()}
            onInput={(e) => setCreateDept(e.currentTarget.value)}
          />
          <label class="text-xs text-dn-500" for="new-club-web">
            Site web (optionnel)
          </label>
          <input
            id="new-club-web"
            class="input"
            type="url"
            placeholder="https://…"
            value={createWebsite()}
            onInput={(e) => setCreateWebsite(e.currentTarget.value)}
          />
        </div>
      </Show>
    </div>
  );
}

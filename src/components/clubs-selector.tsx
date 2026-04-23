import { For, createEffect, createSignal } from "solid-js";
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

const AUTRE: Club = { id: "autre", name: "=== AUTRE ===" };
const CREATE_CHOICE: Club = {
  id: CREATE_ID,
  name: "➕ Créer un nouveau club (après validation email)",
};

export function ClubSelector({ defaultValue = "autre", name, onChange }: ClubSelectorProps) {
  const [clubs, setClubs] = createSignal<Club[]>([AUTRE, CREATE_CHOICE]);
  const [selectedClubId, setSelectedClubId] = createSignal<string>(defaultValue);
  const [loading, setLoading] = createSignal(true);
  const [clubSearch, setClubSearch] = createSignal("");
  const debouncedSearch = useDebounce(clubSearch, 350);

  const [createName, setCreateName] = createSignal("");
  const [createDept, setCreateDept] = createSignal("");
  const [createWebsite, setCreateWebsite] = createSignal("");

  async function loadClubs(q: string) {
    setLoading(true);
    try {
      const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
      const response = await fetch(`/api/clubs${qs}`);
      const clubsData = (await response.json()) as Club[];
      const base =
        clubsData.length === 0
          ? []
          : clubsData.filter((c) => c.id !== "autre" && c.id !== CREATE_ID);
      setClubs([AUTRE, ...base, CREATE_CHOICE]);
    } catch (error: unknown) {
      toast.error(
        "Erreur de chargement",
        error instanceof Error ? error.message : "Erreur de chargement",
      );
      setClubs([AUTRE, CREATE_CHOICE]);
    } finally {
      setLoading(false);
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

  function handleSelect(e: Event) {
    const target = e.target as HTMLSelectElement;
    setSelectedClubId(target.value);
  }

  return (
    <div class="flex flex-col gap-2">
      <label class="text-xs text-dn-500" for="club-search">
        Rechercher un club
      </label>
      <input
        id="club-search"
        class="input w-full"
        type="search"
        placeholder="Tapez pour filtrer…"
        value={clubSearch()}
        onInput={(e) => setClubSearch(e.currentTarget.value)}
      />

      {loading() && <div class="input opacity-70">Chargement des clubs…</div>}
      {!loading() && (
        <select
          name={name || "club"}
          id="club-select"
          value={selectedClubId()}
          onChange={handleSelect}
          class="input w-full"
        >
          <For each={clubs()}>
            {(club) => (
              <option value={club.id}>
                {club.name}
              </option>
            )}
          </For>
        </select>
      )}

      {selectedClubId() === CREATE_ID && (
        <div class="flex flex-col gap-2 p-2 border border-dn-500/30 rounded">
          <p class="text-xs italic text-dn-500">
            Le club sera créé en base uniquement après validation de votre adresse email.
          </p>
          <label class="text-xs" for="new-club-name">
            Nom du club *
          </label>
          <input
            id="new-club-name"
            class="input"
            required
            value={createName()}
            onInput={(e) => setCreateName(e.currentTarget.value)}
          />
          <label class="text-xs" for="new-club-dept">
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
          <label class="text-xs" for="new-club-web">
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
      )}
    </div>
  );
}

import { ClubSelector, type ClubSelection } from "./clubs-selector";
import { Show, createSignal, createEffect } from "solid-js";
import { Fieldset } from "../ui/fieldset";
import { useDebounce } from "../hooks/debounce.hook";
import { toast } from "~/ui/Toast";

type AddDerbyNameFormProps = {
  onClose?: () => void;
};

const initialClub: ClubSelection = {
  kind: "existing",
  club: { id: "autre", name: "Autre / non listé" },
};

export function AddDerbyNameForm({ onClose }: AddDerbyNameFormProps) {
  const [clubSel, setClubSel] = createSignal<ClubSelection>(initialClub);
  const [search, setSearch] = createSignal("");
  const [isUsed, setIsUsed] = createSignal(false);
  const [clubOnly, setClubOnly] = createSignal(false);
  const debouncedSearch = useDebounce(search, 500);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (isUsed() && !clubOnly()) return;

    const sel = clubSel();
    if (sel.kind === "create") {
      const nm = sel.club.name.trim();
      if (nm.length < 2) {
        toast.error("Club", "Indiquez un nom de club d’au moins 2 caractères.");
        return;
      }
    }

    const formData = new FormData(event.target as HTMLFormElement);

    try {
      const body: Record<string, unknown> = {
        email: formData.get("email"),
        clubOnly: clubOnly(),
      };

      if (!clubOnly()) {
        body.name = formData.get("name");
        body.numRoster = formData.get("numRoster");
      }

      if (sel.kind === "create") {
        body.newClub = sel.club;
      } else {
        body.club = sel.club;
      }

      const response = await fetch("/api/derbynames", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(err.error || response.statusText);
      }
      toast.success("Vous allez recevoir un mail pour confirmer !");
    } catch (error: unknown) {
      toast.error(
        "Erreur lors de l'envoi des données :" +
          (error instanceof Error ? error.message : error),
      );
      console.error("Erreur lors de l'envoi des données :", error);
    } finally {
      onClose?.();
    }
  }

  const handleCheck = async () => {
    try {
      const response = await fetch("api/check/" + debouncedSearch());
      if (!response.ok) throw new Error(response.statusText);
      const { count } = await response.json();
      setIsUsed(() => count > 0);
    } catch (error) {
      toast.error("Erreur lors de la vérification du nom :" + error);
    }
  };

  createEffect(() => {
    if (clubOnly()) return;
    if (debouncedSearch().length > 0) handleCheck();
  });

  return (
    <form
      onSubmit={handleSubmit}
      class="flex min-w-0 w-full max-w-full flex-col gap-3 p-2 box-border"
    >
      <label class="flex cursor-pointer items-start gap-2 text-sm leading-snug text-dn-600">
        <input
          type="checkbox"
          class="mt-0.5 size-4 shrink-0 cursor-pointer accent-dn-500"
          checked={clubOnly()}
          onChange={(e) => {
            const v = e.currentTarget.checked;
            setClubOnly(v);
            if (v) setIsUsed(false);
          }}
        />
        <span>
          Je modifie <strong>uniquement mon club</strong> (même e-mail que sur
          la fiche déjà validée — pas besoin de ressaisir derby name ni numéro).
        </span>
      </label>

      <Show when={!clubOnly()}>
        <Fieldset label="Entrez email" name="email">
          <input class="input" type="email" id="email" name="email" required />
        </Fieldset>

        <Fieldset label="Entrez votre Derby name" name="name">
          <input
            class="input"
            type="text"
            id="name"
            name="name"
            value={search()}
            onInput={(e) => {
              setSearch(e.target.value);
              setIsUsed(() => false);
            }}
            required
          />
          <div class="italic text-xs">
            {debouncedSearch() ? (
              <span
                data-valid={!isUsed}
                class="data-[valid=true]:text-valid data-[valid=false]:text-invalid"
              >
                {isUsed()
                  ? "Ce derby name est déjà utilisé"
                  : "Ce derby name est libre !"}
              </span>
            ) : (
              <span class="opacity-0">{"__"}</span>
            )}
          </div>
        </Fieldset>

        <Fieldset label="Entrez votre numéro de roster" name="numRoster">
          <input
            class="input"
            type="text"
            id="numRoster"
            name="numRoster"
            required
          />
        </Fieldset>
      </Show>

      <Fieldset label="Sélectionnez votre club" name="club">
        <ClubSelector onChange={setClubSel} name="club" />
      </Fieldset>

      <div class="flex justify-between gap-2">
        <button
          type="reset"
          onClick={onClose}
          class="btn-cancel data-[cancel=true]:visible"
          data-cancel={!!onClose}
        >
          Annuler
        </button>
        <button class="btn" type="submit" disabled={isUsed() && !clubOnly()}>
          Envoyer
        </button>
      </div>
    </form>
  );
}

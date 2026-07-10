import { Show, createEffect, createSignal } from "solid-js";
import { ClubSelector, type ClubSelection } from "~/components/clubs-selector";
import { Fieldset } from "~/ui/fieldset";
import { useDebounce } from "~/hooks/debounce.hook";
import { toast } from "~/ui/Toast";

type Props = {
  type: "player" | "referee";
  onClose?: () => void;
};

const rpcMethod = {
  player: "derbyname.createPlayer",
  referee: "derbyname.createReferee",
} as const;

const initialClub: ClubSelection = {
  kind: "existing",
  club: { id: "autre", name: "Autre / non listé" },
};

export function CreateDerbynameForm(props: Props) {
  const [clubSel, setClubSel] = createSignal<ClubSelection>(initialClub);
  const [search, setSearch] = createSignal("");
  const [isUsed, setIsUsed] = createSignal(false);
  const debouncedSearch = useDebounce(search, 500);

  const handleCheck = async () => {
    try {
      const res = await fetch("/api/rpc", {
        method: "POST",
        body: JSON.stringify({
          method: "derbyname.checkAvailability",
          params: { derbyname: debouncedSearch(), type: props.type },
        }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = (await res.json()) as { result?: { available?: boolean; count?: number } };
      setIsUsed((data.result?.count ?? 0) > 0 || data.result?.available === false);
    } catch (e) {
      toast.error("Erreur lors de la vérification du nom : " + e);
    }
  };

  createEffect(() => {
    if (debouncedSearch().length > 0) handleCheck();
    else setIsUsed(false);
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const sel = clubSel();
    if (sel.kind === "create" && sel.club.name.trim().length < 2) {
      toast.error("Club", "Indiquez un nom de club d'au moins 2 caractères.");
      return;
    }
    const fd = new FormData(e.target as HTMLFormElement);
    const body: Record<string, unknown> = {
      email: fd.get("email"),
      name: fd.get("name"),
      numRoster: fd.get("numRoster") || undefined,
    };
    if (sel.kind === "create") body.newClub = sel.club;
    else if (sel.club.id !== "autre") body.club = sel.club;

    try {
      const res = await fetch("/api/rpc", {
        method: "POST",
        body: JSON.stringify({ method: rpcMethod[props.type], params: body }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? res.statusText);
      }
      toast.success("Vous allez recevoir un mail pour confirmer !");
      props.onClose?.();
    } catch (error: unknown) {
      toast.error("Erreur : " + (error instanceof Error ? error.message : error));
    }
  }

  return (
    <form onSubmit={handleSubmit} class="flex w-full flex-col gap-3 p-2">
      <Fieldset label="Email" name="email">
        <input class="input" type="email" name="email" required />
      </Fieldset>

      <Fieldset label="Derby name" name="name">
        <input
          class="input"
          type="text"
          name="name"
          value={search()}
          onInput={(e) => { setSearch(e.target.value); setIsUsed(false); }}
          required
        />
        <Show when={debouncedSearch().length > 0}>
          <span
            class="text-xs italic"
            classList={{ "text-green-600": !isUsed(), "text-red-600": isUsed() }}
          >
            {isUsed() ? "Ce derby name est déjà utilisé" : "Ce derby name est libre !"}
          </span>
        </Show>
      </Fieldset>

      <Fieldset label="Numéro de roster (optionnel)" name="numRoster">
        <input class="input" type="text" name="numRoster" maxlength="4" />
      </Fieldset>

      <Fieldset label="Club (optionnel)">
        <ClubSelector onChange={setClubSel} />
      </Fieldset>

      <button type="submit" class="btn" disabled={isUsed()}>
        Confirmer par e-mail
      </button>
    </form>
  );
}

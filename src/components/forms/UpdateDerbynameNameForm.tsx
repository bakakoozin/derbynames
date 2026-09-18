import { Show, createSignal } from "solid-js";
import { ClubSelector, type ClubSelection } from "~/components/clubs-selector";
import { Fieldset } from "~/ui/fieldset";
import { toast } from "~/ui/Toast";

type Props = {
  type: "player" | "referee";
  onClose?: () => void;
};

const rpcMethod = {
  player: "derbyname.updatePlayerName",
  referee: "derbyname.updateRefereeName",
} as const;

const initialClub: ClubSelection = {
  kind: "existing",
  club: { id: "autre", name: "Autre / non listé" },
};

export function UpdateDerbynameNameForm(props: Props) {
  const [clubSel, setClubSel] = createSignal<ClubSelection>(initialClub);

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
      numRoster: props.type !== "referee" ? (fd.get("numRoster") || undefined) : undefined,
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
      <Fieldset label="Email (celui de votre fiche actuelle)" name="email">
        <input class="input" type="email" name="email" required />
      </Fieldset>

      <Fieldset label="Nouveau derby name" name="name">
        <input
          class="input"
          type="text"
          name="name"
          required
        />
      </Fieldset>

      <Show when={props.type !== "referee"}>
        <Fieldset label="Numéro de roster (optionnel)" name="numRoster">
          <input class="input" type="text" name="numRoster" maxlength="4" />
        </Fieldset>
      </Show>

      <Fieldset label="Club (optionnel — laisser vide pour conserver l'actuel)">
        <ClubSelector onChange={setClubSel} />
      </Fieldset>

      <button type="submit" class="btn">
        Confirmer par e-mail
      </button>
    </form>
  );
}

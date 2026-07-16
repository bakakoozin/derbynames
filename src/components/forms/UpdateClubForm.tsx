import { createSignal } from "solid-js";
import { ClubSelector, type ClubSelection } from "~/components/clubs-selector";
import { Fieldset } from "~/ui/fieldset";
import { toast } from "~/ui/Toast";
import { DERBY_TYPES, isDerbyType } from "~/utils/constants";

type Props = {
  onClose?: () => void;
};

const initialClub: ClubSelection = {
  kind: "existing",
  club: { id: "autre", name: "Autre / non listé" },
};

export function UpdateClubForm(props: Props) {
  const [clubSel, setClubSel] = createSignal<ClubSelection>(initialClub);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const sel = clubSel();
    if (sel.kind === "create" && sel.club.name.trim().length < 2) {
      toast.error("Club", "Indiquez un nom de club d'au moins 2 caractères.");
      return;
    }
    const fd = new FormData(e.target as HTMLFormElement);
    const derbyTypeRaw = fd.get("derbyType") as string;
    if (!isDerbyType(derbyTypeRaw)) {
      toast.error("Type invalide.");
      return;
    }
    const body: Record<string, unknown> = {
      email: fd.get("email"),
      derbyType: derbyTypeRaw,
    };
    if (sel.kind === "create") body.newClub = sel.club;
    else body.club = sel.club;

    try {
      const res = await fetch("/api/rpc", {
        method: "POST",
        body: JSON.stringify({ method: "derbyname.updateClub", params: body }),
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

  const typeLabels: Record<string, string> = {
    player: "Joueuse / Joueur",
    referee: "Arbitre",
    coach: "Coach",
  };

  return (
    <form onSubmit={handleSubmit} class="flex w-full flex-col gap-3 p-2">
      <Fieldset label="Email (celui de votre fiche actuelle)" name="email">
        <input class="input" type="email" name="email" required />
      </Fieldset>

      <Fieldset label="Type de derby name" name="derbyType">
        <select class="input" name="derbyType" required>
          {DERBY_TYPES.map((t) => (
            <option value={t}>{typeLabels[t] ?? t}</option>
          ))}
        </select>
      </Fieldset>

      <Fieldset label="Nouveau club / collectif">
        <ClubSelector onChange={setClubSel} />
      </Fieldset>

      <button type="submit" class="btn">
        Confirmer par e-mail
      </button>
    </form>
  );
}

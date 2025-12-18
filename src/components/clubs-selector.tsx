import { For, createEffect, createSignal } from "solid-js";
import { toast } from "~/ui/Toast";

type Club = {
  id: string;
  name: string;
};

type ClubSelectorProps = {
  defaultValue?: string;
  name?: string;
  onChange?: (club: { name: string; id: string }) => void;
};

export function ClubSelector({ defaultValue = 'autre', name, onChange }: ClubSelectorProps) {
  const defaultChoice: Club = { id: 'autre', name: '=== AUTRE ===' };
  const [clubs, setClubs] = createSignal<Club[]>([defaultChoice]);
  const [selectedClubId, setSelectedClubId] = createSignal<string>(defaultValue);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  async function getClubs() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/clubs');
      const clubsData: Club[] = await response.json();
      setClubs(clubsData.length === 0 ? [defaultChoice] : clubsData);
    } catch (error: any) {
      toast.error('Erreur de chargement', error.message || 'Erreur de chargement');
      setClubs([defaultChoice]);
    } finally {
      setLoading(false);
    }
  }

  createEffect(() => {
    getClubs();
  });

  function handleSelect(e: Event) {
    const target = e.target as HTMLSelectElement;
    const clubId = target.value;
    setSelectedClubId(clubId);

    if (onChange) {
      const club = clubs().find(c => c.id === clubId);
      if (club) {
        onChange({
          name: club.name,
          id: club.id
        });
      }
    }
  }

  return (
    <>
      {loading() && (
        <div class='input'>Chargement des clubs...</div>
      )}
      {error() && (
        <div class='text-invalid text-xs italic mb-1'>{error()}</div>
      )}
      <select
        name={name || 'club'}
        value={selectedClubId()}
        onChange={handleSelect}
        class='input w-full'
        disabled={loading()}
      >
        <For each={clubs()}>
          {(club) => (
            <option value={club.id}>
              {club.name}
            </option>
          )}
        </For>
      </select>
    </>
  );
}
import { ClubSelector } from './clubs-selector';
import { createSignal, createEffect } from 'solid-js';
import { Fieldset } from '../ui/fieldset';
import { useDebounce } from '../hooks/debounce.hook';
import { toast } from '~/ui/Toast';

type AddDerbyNameFormProps = {
  onClose?: () => void
}

export function AddDerbyNameForm({ onClose }: AddDerbyNameFormProps) {
  const [club, setClub] = createSignal<{ id: string, name: string } | undefined>(undefined)
  const [search, setSearch] = createSignal('')
  const [isUsed, setIsUsed] = createSignal(false)
  const debouncedSearch = useDebounce(search, 500)

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (isUsed()) return
    const formData = new FormData(event.target as HTMLFormElement);

    try {
      const response = await fetch('/api/derbynames', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          numRoster: formData.get('numRoster'),
          email: formData.get('email'),
          club
        }),
      });

      if (!response.ok) throw new Error(response.statusText);
      toast.success('Vous allez recevoir un mail pour confirmer !')
    } catch (error) {
      toast.error('Erreur lors de l\'envoi des données :' + error)
      console.error('Erreur lors de l\'envoi des données :', error);
    } finally {
      onClose?.()
    }
  }

  const handleCheck = async () => {
    try {
      const params = new URLSearchParams()
      params.set('derbyName', debouncedSearch().toString())
      const response = await fetch('api/check/' + debouncedSearch())
      if (!response.ok) throw new Error(response.statusText)
      const { count } = await response.json()
      setIsUsed(() => count > 0)
    } catch (error) {
      toast.error('Erreur lors de la vérification du nom :' + error)
    }
  }

  createEffect(() => {
    if (debouncedSearch().length > 0) handleCheck()
  })

  return (
    <form onSubmit={handleSubmit} class="flex flex-col gap-3 p-2">
      <Fieldset label='Entrez votre Derby name' name='name'>
        <input
          class="input"
          type="text"
          id="name"
          name="name"
          value={search()}
          onInput={(e) => {
            setSearch(e.target.value)
            setIsUsed(() => false)
          }}
          required
        />
        <div class='italic text-xs'>
          {debouncedSearch() ? <span
            data-valid={!isUsed}
            class="data-[valid=true]:text-valid data-[valid=false]:text-invalid">
            {isUsed() ? "Ce derby name est déjà utilisé" : "Ce derby name est libre !"}
          </span> : <span class='opacity-0'>{"__"}</span>}
        </div>
      </Fieldset>

      <Fieldset label='Entrez votre numéro de joueureuse' name="numRoster">
        <input
          class="input"
          type="text"
          id="numRoster"
          name="numRoster"
          required
        />
      </Fieldset>

      <Fieldset label='Entrez email' name="email">
        <input
          class="input"
          type="email"
          id="email"
          name="email"
          required
        />
      </Fieldset>

      <Fieldset label='Sélectionnez votre club' name="club">
        <ClubSelector onChange={setClub} name="club" />
      </Fieldset>

      <div class="flex justify-between gap-2">
        <button type="reset" onClick={onClose} class='btn-cancel data-[cancel=true]:visible' data-cancel={!!onClose}>Annuler</button>
        <button class="btn" type="submit" disabled={isUsed()}>Envoyer</button>
      </div>
    </form >
  );
}



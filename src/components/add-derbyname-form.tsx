import { dc } from '../utils/dynamic-classes';
import { toast } from 'react-toastify';
import { ClubSelector } from './clubs-selector';
import { useState, useEffect } from 'react';
import { Fieldset } from '../ui/fieldset';
import { useDebounce } from '../hooks/debounce.hook';

type AddDerbynameFormProps = {
    onClose?: () => void
}

export function AddDerbynameForm({ onClose }: AddDerbynameFormProps) {
    const [club, setClub] = useState<{ id: string, name: string } | undefined>(undefined)
    const [search, setSearch] = useState('')
    const [isUsed, setIsUsed] = useState(false)
    const debouncedSearch = useDebounce(search, 500)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement> ) {
        event.preventDefault();
        if(isUsed) return
        const formData = new FormData(event.target as HTMLFormElement);

        try {
            const response = await fetch(import.meta.env.VITE_BASE_URL_API + '/derbynames', {
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
        if (!debouncedSearch) return
        
        try {
            // envoi de la requête
            const params = new URLSearchParams({ derbyName: debouncedSearch })
            const url = import.meta.env.VITE_BASE_URL_API + '/check_used?' + params
            const response = await fetch(url)
            if (!response.ok) throw new Error(response.statusText)

            //récupère le count
            const {count} = await response.json()
            // met à jour le state
            setIsUsed(count > 0)
        
        } catch (error) {
            console.error('Erreur lors de la vérification du nom :', error)
            toast.error('Erreur lors de la vérification du nom :' + error)
        }
    }

    useEffect(() => {
        if (debouncedSearch) handleCheck()
    }, [debouncedSearch])

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-2">

            <Fieldset label='Entrez votre Derby name' name='name'>
                <input
                    className="input"
                    type="text"
                    id="name"
                    name="name"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setIsUsed(false)
                    }}
                    required
                />
                <div className='italic text-xs'>
                    {debouncedSearch ?  <span 
                        data-valid={!isUsed}
                        className="data-[valid=true]:text-valid data-[valid=false]:text-invalid">
                            {isUsed ? "Ce derby name est déjà utilisé" :"Ce derby name est libre !"}
                        </span> : <span className='opacity-0'>{"__"}</span>}
                </div>
            </Fieldset>

            <Fieldset label='Entrez votre numéro de joueureuse' name="numRoster">
                <input
                    className="input"
                    type="text"
                    id="numRoster"
                    name="numRoster"
                    required
                />
            </Fieldset>

            <Fieldset label='Entrez email' name="email">
                <input
                    className="input"
                    type="email"
                    id="email"
                    name="email"
                    required
                />
            </Fieldset>

            <Fieldset label='Selectionnez votre club' name="club">
                <ClubSelector onChange={setClub} name="club" />
            </Fieldset>

            <div className="flex justify-between gap-2">
                <button type="reset" onClick={onClose} className={dc('btn-cancel', [!onClose, 'hidden'])}>Annuler</button>
                <button className="btn" type="submit" disabled={isUsed}>Envoyer</button>
            </div>
        </form>
    );
}



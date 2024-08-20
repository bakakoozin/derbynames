import { dc } from '../utils/dynamic-classes';
import { toast } from 'react-toastify';
import { ClubSelector } from './clubs-selector';
import { useState } from 'react';
import { Fieldset } from '../ui/fieldset';

type AddDerbynameFormProps = {
    onClose?: ()=> void
}

export function AddDerbynameForm({onClose}: AddDerbynameFormProps) {
    const [club, setClub] = useState<{id:string, name: string}|undefined>(undefined)

    async function handleSubmit(event: any) {
        event.preventDefault();

        const formData = new FormData(event.target)

        try {
            const response = await fetch(import.meta.env.VITE_BASE_URL_API + '/derbynames', {
                method: 'POST',
                body: JSON.stringify({ 
                    name: formData.get('name'),
                    numRoster:formData.get('numRoster'), 
                    email:formData.get('email'),
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

    return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-2">

        <Fieldset label='Entrez votre Derby name' name='name'>
            <input
                className="input"
                type="text" 
                id="name"
                name="name"
                required
            />
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
            <button type="reset" onClick={onClose} className={dc('btn-cancel', [!onClose,'hidden'])}>Annuler</button>
            <button className="btn" type="submit">Envoyer</button>
        </div>
    </form>
    );
}



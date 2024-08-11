import { dc } from '../utils/dynamic-classes';

type AddDerbynameFormProps = {
    onClose?: ()=> void
}

export function AddDerbynameForm({onClose}: AddDerbynameFormProps) {

    async function handleSubmit(event: any) {
        event.preventDefault();
        const formData = new FormData(event.target)
        try {
            const response = await fetch(import.meta.env.VITE_BASE_URL_API + '/derbynames', {
                method: 'POST',
                body: JSON.stringify({ name: formData.get('name'), numRoster:formData.get('numRoster'), email:formData.get('email') }),
            });

            if (response.ok) {
                console.log('Données envoyées avec succès !');
                // Réinitialiser le formulaire après l'envoi des données
            } 
            
            else {
                console.error('Échec de l\'envoi des données.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi des données :', error);
        } finally {
            onClose?.()
        }
    }

    return (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-2">
                <fieldset className="flex flex-col gap-2">
                    <label htmlFor="derby-name-post">Entrez votre Derby name :</label>
                    <input
                        className="input"
                        type="text" 
                        id="name"
                        name="name"
                        required
                    />
                </fieldset>
                <fieldset className="flex flex-col gap-2">
                    <label htmlFor="numRoster">Entrez votre numéro de joueureuse :</label>
                    <input
                        className="input"
                        type="text"
                        id="numRoster"
                        name="numRoster"
                        required
                    />
                </fieldset>
                <fieldset className="flex flex-col gap-2">
                    <label htmlFor="email">Entrez email:</label>
                    <input
                        className="input"
                        type="email"
                        id="email"
                        name="email"
                        required
                    />
                </fieldset>

                <div className="flex justify-between gap-2">
                    <button type="reset" onClick={onClose} className={dc('btn-cancel', [!onClose,'hidden'])}>Annuler</button>
                    <button className="btn" type="submit">Envoyer</button>
                </div>
            </form>
    );
}



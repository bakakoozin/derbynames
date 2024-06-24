
type ApiTestProps = {
    onClose: ()=> void
}

export function ApiTest({onClose}: ApiTestProps) {


    async function handleSubmit(event: any) {
        event.preventDefault();
        const formData = new FormData(event.target)
        try {
            const response = await fetch(import.meta.env.VITE_BASE_URL_API + '/derbynames', {
                method: 'POST',
                body: JSON.stringify({ name: formData.get('name'), numRoster:formData.get('numRoster') })
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
            onClose()
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
                    />
                </fieldset>
                <fieldset className="flex flex-col gap-2">
                    <label htmlFor="numRoster">Entrez votre numéro de joueureuse :</label>
                    <input
                        className="input"
                        type="text"
                        id="numRoster"
                        name="numRoster"
                    />
                </fieldset>

                <div className="flex justify-between gap-2">
                    <button type="reset" onClick={onClose} className="btn-cancel">Annuler</button>
                    <button className="btn" type="submit">Envoyer</button>
                </div>
            </form>
    );

    /*async function handleFetch() {
        const response = await fetch(import.meta.env.VITE_BASE_URL_API + '/derbynames')
        const data = await response.json()
        console.log(data)
    }

    useEffect(() => { handleFetch() }, [])

    return (
        <div>
            <p className="text-600">{'voilà'}</p>
        </div>)*/

}



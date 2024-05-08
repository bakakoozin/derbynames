import { useState } from "react"

export function ApiTest() {
    const [formData, setFormData] = useState({
        name: "",
        number: ""
    });

    function handleChange(event: { target: { name: string; value: string; }; }) {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    }

    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        try {
            const response = await fetch(import.meta.env.VITE_BASE_URL_API + '/derbynames', {
                method: 'POST',
                body: JSON.stringify({ name: formData.name, numRoster: formData.number })
            });
            if (response.ok) {
                console.log('Données envoyées avec succès !');
                // Réinitialiser le formulaire après l'envoi des données
                setFormData({
                    name: "",
                    number: ""
                });
            } else {
                console.error('Échec de l\'envoi des données.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi des données :', error);
        }
    }

    return (
        <div style={{ backgroundColor: 'rgba(174, 181, 191, 0.4)' }}>
            <div className="flex flex-col shadow-md text-100 p-10 rounded-xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-4 flex flex-row space-x-2">
                        <label htmlFor="derby-name-post">Entrez votre Derby name :</label>
                        <input
                            className="border-solid border-2 border-100 rounded-lg bg-200 text-600 p-1.5"
                            type="text" id="name"
                            name="name"
                            value={formData.name} onChange={handleChange}
                        />
                    </div>
                    <div className="p-4 flex flex-row space-x-2">
                        <label htmlFor="number">Entrez votre numéro de joueureuse :</label>
                        <input
                            className="border-solid border-2 border-100 rounded-lg bg-200 text-600 p-1.5 max-w-24"
                            type="text"
                            id="number"
                            name="number"
                            value={formData.number} onChange={handleChange}
                        />
                    </div>
                    <div className="p-4"><p>Votre club</p></div>
                    <div className="p-4"><p>Votre adresse mail</p></div>
                    <div className="pt-10 flex flex-col items-center">
                        <button className="bg-300 p-1 hover:bg-500 hover:text-200 hover:border-200" type="submit">Envoyer</button>
                    </div>
                </form>
            </div>
        </div>
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



//import { useEffect } from "react"

import { useState } from "react"

export function ApiTest() {
    const [formData, setFormData] = useState({
        derbyNamePost: "",
        number: ""
    });

    function handleChange(event: { target: { name: string; value: string; }; }) {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    }

    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        try {
            const response = await fetch(import.meta.env.VITE_BASE_URL_API + '/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                console.log('Données envoyées avec succès !');
                // Réinitialiser le formulaire après l'envoi des données
                setFormData({
                    derbyNamePost: "",
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
        <div className="flex flex-col  items-center py-28">
            <div className="flex flex-col shadow-md shadow-400 text-100 bg-400 p-10 rounded-xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-4 flex flex-row space-x-2">
                        <label htmlFor="derby-name-post">Entrez votre Derby name :</label>
                        <input
                            className="border-solid border-2 border-100 rounded-lg bg-200 text-600 p-1.5"
                            type="text" id="derby-name-post"
                            name="derby-name-ajout"
                            value={formData.derbyNamePost} onChange={handleChange}
                        />
                    </div>
                    <div className="p-4 flex flex-row space-x-2">
                        <label htmlFor="number-post">Entrez votre numéro de joueureuse :</label>
                        <input
                            className="border-solid border-2 border-100 rounded-lg bg-200 text-600 p-1.5 max-w-24"
                            type="text"
                            id="number-post"
                            name="number-post"
                            value={formData.number} onChange={handleChange}
                        />
                    </div>
                    <div className="pt-10 flex flex-col items-center">
                        <button className="bg-300 p-1 hover:bg-500 hover:text-200 hover:border-200" type="submit">Envoyer</button>
                    </div>
                </form>
            </div>
        </div>
    );

    /*async function handleFetch() {
        const response = await fetch(import.meta.env.VITE_BASE_URL_API + '/todos')
        const data = await response.json()
        console.log(data)
    }

    useEffect(() => { handleFetch() }, [])

    return (
        <div>
            <p className="text-600">{'voilà'}</p>
        </div>)*/

}



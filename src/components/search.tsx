import { useState } from "react";

interface SearchResult {
    name: string;
    // Ajoutez d'autres propriétés au besoin
}

export function Search() {
    const [searchQuery, setSearchQuery] = useState(""); // État pour stocker la requête de recherche
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [error, setError] = useState(null);

    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL_API}/derbynames?name=${encodeURIComponent(searchQuery)}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResult(data);
                setError(null); // Réinitialiser l'état de l'erreur s'il y avait eu une erreur précédente
            } else {
                setSearchResult(null); // Réinitialiser les résultats de recherche
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données :', error);
            setSearchResult(null); // Réinitialiser les résultats de recherche
        }
    }

    function handleChange(event: { target: { name: string; value: string; }; }) {
        setSearchQuery(event.target.value);
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-row space-x-2">
                    <input
                        className="border-solid border-2 border-100 rounded-lg bg-200 text-600 p-1.5"
                        type="search" id="derby-name-search"
                        value={searchQuery} onChange={handleChange} />
                    <button className="p-1 hover:bg-500 hover:text-200 hover:border-200">Recherche</button>
                </div>
            </form>
            {error && <div className="text-red-500">{error}</div>}
            {searchResult && (
                <div className="pt-4">
                    <h2>Résultat de la recherche :</h2>
                    <p>Nom : {searchResult.name}</p>
                    {/* Affichez d'autres propriétés de searchResult selon vos besoins*/}
                </div>
            )}
        </div>
    )
}

/*
try {
            if (method === 'GET') {
                if (todoID) {
                    // GET /api/todos?id=XXX
                    return utils.reply(
                        await collection.findOne({
                            _id: new ObjectId(todoID)
                        })
                    );
                }

                // GET /api/todos
                return utils.reply(
                    await collection.find()
                )
*/
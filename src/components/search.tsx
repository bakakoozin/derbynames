import { useState } from "react";

interface SearchResult {
    name: string;
}

export function Search() {
    const [searchQuery, setSearchQuery] = useState(""); 
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [error, setError] = useState(null);

    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL_API}/derbynames?name=${encodeURIComponent(searchQuery)}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResult(data);
                setError(null); 
            } else {
                setSearchResult(null); 
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données :', error);
            setSearchResult(null); 
        }
    }

    function handleChange(event: { target: { name: string; value: string; }; }) {
        setSearchQuery(event.target.value);
    }

    return (
<>
    <form onSubmit={handleSubmit}>
        <div className="flex flex-row space-x-2">
            <label className="hidden">Recherche</label>
            <input
                name="derby-name-search"
                className="input"
                type="search" 
                id="derby-name-search"
                autoFocus
                value={searchQuery} onChange={handleChange} />
            <button className="btn" type="submit">Recherche</button>
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
</>
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
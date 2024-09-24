import { useSearchParams } from "react-router-dom";

export function Search() {


    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search") || "";


    async function handleSearch(value: string) {
        setSearchParams({ search: value });
    }

    return (

        <div className="flex flex-row space-x-2">
            <label className="hidden">Recherche</label>
            <input
                name="derby-name-search"
                className="input"
                type="search" 
                id="derby-name-search"
                placeholder="Recherche"
                autoFocus
                defaultValue={search}
               onChange={(e) => handleSearch(e.target.value)} />
        </div>

    )
}

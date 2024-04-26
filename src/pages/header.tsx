import { Link } from "react-router-dom";

export function Header() {
    return (
        <div className="w-screen flex flex-row p-4 place-items-center place-content-between">
            <Link to=""><img className="size-28 rounded-full border-solid border-2 border-100" src="/derbynames_logo_test.png"></img></Link>
            <div>
                <label htmlFor="derby-name-search">Recherchez un Derby Name</label>
                <div className="flex flex-row space-x-2">
                    <input className="border-solid border-2 border-100 rounded-lg bg-200" type="search" id="derby-name-search" />
                    <button className="p-1 bg-900">Recherche</button>
                </div>
            </div>
            <div className="flex flex-row p-10 space-x-8 place-self-auto">
                <p>Contact</p>
                <Link to=""><p>Home</p></Link>
            </div>
        </div>
    )
}
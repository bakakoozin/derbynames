import { Link } from "react-router-dom";

export function Header() {
    return (
        <div className="w-screen flex flex-row p-4 place-items-center place-content-between">
            <Link to=""><img className="size-28 rounded-full border-solid border-2 border-100" src="/derbynames_logo_test.png"></img></Link>
            <div className="flex flex-row p-10 space-x-8 place-self-auto">
                <p>GIT</p>
                <p>Contact</p>
                <p>Home</p>
            </div>
        </div>
    )
}
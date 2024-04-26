import { Link } from "react-router-dom";

export function Footer() {
    return (
        <div className="w-screen flex flex-row p-4 place-items-center place-content-between">
            <Link to=""><button>Retour</button></Link>
            <div><p>blabla et autres divers</p></div>
            <div><p>GIT</p></div>
        </div>
    )
}
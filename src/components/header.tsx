import { Link } from "react-router-dom"
import { Logo } from '../components/logo'

export function Header() {
    return (
        <header className="flex p-2 place-items-center place-content-between ">
            <Link to="">
                <Logo />
            </Link>
        </header>
    )
}
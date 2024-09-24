import { Link } from "react-router-dom"
import { Logo } from '../components/logo'

export function Header() {
    return (
        <header className="flex py-2 pr-2 pl-12 md:pl-2  place-items-center place-content-between ">
            <Link to="">
                <Logo />
            </Link>
        </header>
    )
}
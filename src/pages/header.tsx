import { Link } from "react-router-dom";
import { Logo } from '../components/logo'
import { Search } from "../components/search";

export function Header() {
    return (
        <div style={{ backgroundColor: 'rgba(174, 181, 191, 0.4)' }}>
            <div className="w-screen flex flex-row p-4 place-items-center place-content-between text-100">
                <Link to="">
                    <Logo />
                </Link>
                <div>
                    <Search />
                </div>
                <div className="flex flex-row p-10 space-x-8 place-self-auto">
                    <p>Contact</p>
                    <Link to=""><p className="hover:text-500">Home</p></Link>
                </div>
            </div>
        </div>
    )
}
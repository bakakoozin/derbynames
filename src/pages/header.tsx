import { Link } from "react-router-dom"
import { Logo } from '../components/logo'

export function Header() {
    return (
        <header className="flex p-2 place-items-center place-content-between ">
            <Link to="">
                <Logo />
            </Link>
            
            <div className="flex p-2 space-x-8 place-self-auto">
                <p className="font-oswald">Contact</p>
                <Link to=""><p className="font-oswald hover:text-300">Accueil</p></Link>
            </div>
        </header>
  
    )
}
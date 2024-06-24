import { Link } from "react-router-dom"
import { Logo } from '../components/logo'

export function Header() {
    return (
        <header className="flex p-2 place-items-center place-content-between ">
            <Link to="">
                <Logo />
            </Link>
            
            <div className="flex p-2 space-x-8 place-self-auto">
                <p>Contact</p>
                <Link to=""><p className="hover:text-500">Home</p></Link>
            </div>
        </header>
  
    )
}
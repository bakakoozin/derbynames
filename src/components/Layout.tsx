import { Outlet } from "react-router-dom"
import { Header } from "../pages/header"
import { Footer } from "../pages/footer"
import { Menu } from "../pages/menu"

export function Layout() {
    return <div id="page" className='bg-b1 bg-cover'>
        <header>
            <Header />
        </header>
        <main id="content" className="flex flex-row items-center">
            <div>
                <Menu />
            </div>
            <div>
                <Outlet />
            </div>
        </main>
        <footer>
            <Footer />
        </footer>
    </div>
}
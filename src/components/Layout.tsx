import { Outlet } from "react-router-dom"
import { Header } from "../pages/header"
import { Footer } from "../pages/footer"
import { Menu } from "../pages/menu"

export function Layout() {
    return <div id="page" className='bg-b1 bg-cover'>
        <header className="shadow-md">
            <Header />
        </header>
        <main id="content" className="flex flex-row">
            <div className='w-80'>
                <Menu />
            </div>
            <div className="w-full">
                <Outlet />
            </div>
        </main>
        <footer>
            <Footer />
        </footer>
    </div>
}
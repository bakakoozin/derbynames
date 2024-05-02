import { Outlet } from "react-router-dom";
import { Header } from "../pages/header";
import { Footer } from "../pages/footer";

export function Layout() {
    return <div id="page" className='bg-b1 bg-cover'>
        <header>
            <Header />
        </header>
        <main id="content">
            <Outlet />
        </main>
        <footer>
            <Footer />
        </footer>
    </div>
}
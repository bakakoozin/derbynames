import { Outlet } from "react-router-dom";
import { Header } from "../pages/header";
import { Footer } from "../pages/footer";

export function Layout() {
    return <div>
        <header className="bg-300">
            <Header />
        </header>
        <main>
            <Outlet />
        </main>
        <footer>
            <Footer />
        </footer>
    </div>
}
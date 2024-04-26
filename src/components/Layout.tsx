import { Outlet } from "react-router-dom";
import { Header } from "../pages/header";
import { Footer } from "../pages/footer";

export function Layout() {
    return <div>
        <header className="bg-400">
            <Header />
        </header>
        <main>
            <Outlet />
        </main>
        <footer className="bg-400">
            <Footer />
        </footer>
    </div>
}
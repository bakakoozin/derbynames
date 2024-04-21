import { Outlet } from "react-router-dom";
import { Header } from "../pages/header";

export function Layout() {
    return <div>
        <header className="bg-400">
            <Header />
        </header>
        <main>
            <Outlet />
        </main>
        <footer className="mt-10">footer</footer>
    </div>
}
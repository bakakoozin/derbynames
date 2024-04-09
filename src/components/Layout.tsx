import { Outlet } from "react-router-dom";
import { Header } from "../pages/header";

export function Layout() {
    return <div>
        <header>
            <Header />
        </header>
        <main>
            <Outlet />
        </main>
        <footer>footer</footer>
    </div>
}
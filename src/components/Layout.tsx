import { Outlet } from "react-router-dom";

export function Layout() {
    return <div>
        <header>header</header>
        <main>
            <Outlet />
        </main>
        <footer>footer</footer>
    </div>
}
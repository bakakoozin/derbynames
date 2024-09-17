import { Outlet } from "react-router-dom"
import { Header } from "./header"
import { Menu } from "./menu"

export function Layout() {
    return <div className='bg-100 text-600 w-full h-[100dvh] grid grid-rows-[auto_1fr]'>
            <Header />
        <main className="grid grid-cols-[minmax(200px,15vw)_1fr]">
                <Menu />
            <div className="relative h-full w-full">
                <div className="absolute inset-0 overflow-y-auto z-10">
                    <Outlet />
                </div>
            </div>
        </main>
    </div>
}
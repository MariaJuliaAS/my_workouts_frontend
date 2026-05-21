import { Outlet } from "react-router-dom";
import { Nav } from "../components/nav";

export function MainLayout() {
    return (
        <div className="w-full bg-black h-screen flex flex-col items-center">
            <main className="max-w-2xl bg-amber-100 w-full flex-1">
                <Outlet />
            </main>

            <Nav />
        </div>
    )
}

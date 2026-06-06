import { Outlet } from "react-router-dom";
import { Nav } from "../components/nav";
import { Header } from "../components/header";
import { useLocation } from "react-router-dom";

export function MainLayout() {
    const { pathname } = useLocation();
    const isNewWorkoutPage = pathname === "/treino/novo";

    return (
        <div className="w-full bg-black h-screen flex flex-col items-center">
            {isNewWorkoutPage ? null : <Header />}

            <main className="max-w-2xl w-full flex-1">
                <Outlet />
            </main>

            {isNewWorkoutPage ? null : <Nav />}
        </div>
    )
}

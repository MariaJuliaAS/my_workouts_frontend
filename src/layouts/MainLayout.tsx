import { Outlet } from "react-router-dom";
import { Nav } from "../components/nav";
import { Header } from "../components/header";
import { useLocation } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

export function MainLayout() {
    const { pathname } = useLocation();
    const isNewWorkoutPage = pathname === "/treino/novo";
    const isWorkoutDetailPage = pathname.startsWith("/treino/") && pathname !== "/treino/novo" && pathname !== "/treino/editar";
    const isHistoryDetailPage = pathname.startsWith("/historico/") && pathname !== "/historico";

    function renderHeader() {
        if (isNewWorkoutPage || isWorkoutDetailPage || isHistoryDetailPage) {
            return null;
        }

        if (pathname === "/historico") {
            return <Header title="Histórico" subtitle="Veja seus últimos treinos" />;
        }

        if (pathname === "/corrida") {
            return <Header title="Corrida" subtitle="Registre suas corridas" />;
        }

        if (pathname === "/prs") {
            return <Header title="PRs" subtitle="Acompanhe seus recordes pessoais" />;
        }

        return (
            <Header
                title="Treinos"
                subtitle="Gerencie seus treinos"
                action={{
                    to: "/treino/novo",
                    label: "Novo treino",
                    icon: <FaPlus className="sm:text-xl text-lg" />,
                }}
            />
        );
    }

    return (
        <div className="w-full bg-black min-h-screen flex flex-col items-center">
            {renderHeader()}

            <main className="max-w-2xl w-full flex-1">
                <Outlet />
            </main>

            {isNewWorkoutPage || isWorkoutDetailPage || isHistoryDetailPage ? null : <Nav />}
        </div>
    )
}

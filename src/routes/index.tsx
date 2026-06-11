import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Home } from "../pages/home";
import { Workout } from "../pages/workout";
import { PRs } from "../pages/pr";
import { NewWorkout } from "../pages/new_workout";
import { Login } from "../pages/login";
import { Register } from "../pages/register";
import { PrivateRoutes } from "./privateRoutes";


export const router = createBrowserRouter([
    {
        element: <Login />,
        path: "/login"
    },
    {
        element: <Register />,
        path: "/cadastro"
    },
    {
        element: <MainLayout />,
        children: [
            {
                path: "/", element:
                    <PrivateRoutes>
                        <Home />
                    </PrivateRoutes>
            },
            {
                path: "treinos", element:
                    <PrivateRoutes>
                        <Workout />
                    </PrivateRoutes>
            },
            {
                path: "prs", element:
                    <PrivateRoutes>
                        <PRs />
                    </PrivateRoutes>
            },
            {
                path: "treino/novo", element:

                    <PrivateRoutes>
                        <NewWorkout />
                    </PrivateRoutes>
            },
            { path: "*", element: <div className="p-4 text-white flex items-center justify-center font-bold text-xl">Página não encontrada</div> }
        ]
    },
])
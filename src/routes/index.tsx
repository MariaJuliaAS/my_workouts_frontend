import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Home } from "../pages/home";
import { WorkoutDetail } from "../pages/workout_detail";
import { PRs } from "../pages/pr";
import { NewWorkout } from "../pages/new_workout";
import { EditWorkout } from "../pages/edit_workout";
import { Login } from "../pages/login";
import { Register } from "../pages/register";
import { PrivateRoutes } from "./privateRoutes";
import { Run } from "../pages/run";
import { History } from "../pages/history";


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
                path: "/historico", element:
                    <PrivateRoutes>
                        <History />
                    </PrivateRoutes>
            },
            {
                path: "corrida", element:
                    <PrivateRoutes>
                        <Run />
                    </PrivateRoutes>
            },
            {
                path: "treino/:id", element:
                    <PrivateRoutes>
                        <WorkoutDetail />
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
            {
                path: "treino/editar/:id", element:

                    <PrivateRoutes>
                        <EditWorkout />
                    </PrivateRoutes>
            },
            { path: "*", element: <div className="p-4 text-white flex items-center justify-center font-bold text-xl">Página não encontrada</div> }
        ]
    },
])
import { createBrowserRouter } from "react-router-dom";
import { Workout } from "../pages/workout";
import { WorkoutDetail } from "../pages/workout_detail";
import { PRs } from "../pages/pr";
import { NewWorkout } from "../pages/new_workout";
import { EditWorkout } from "../pages/edit_workout";
import { Login } from "../pages/login";
import { Register } from "../pages/register";
import { PrivateRoutes } from "./privateRoutes";
import { Run } from "../pages/run";
import { History } from "../pages/history";
import { WorkoutStart } from "../pages/workout_start";
import { HistoryDetail } from "../pages/history_detail/HistoryDetail";
import { MainLayout } from "../layouts/MainLayout";
import { Home } from "../pages/home";
import { WeeklyPlanner } from "../pages/weekly_planner";


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
                path: "/",
                element:
                    <PrivateRoutes>
                        <Home />
                    </PrivateRoutes>
            },
            {
                path: "/planejar-semana",
                element:
                    <PrivateRoutes>
                        <WeeklyPlanner />
                    </PrivateRoutes>
            },
            {
                path: "/treinos", element:
                    <PrivateRoutes>
                        <Workout />
                    </PrivateRoutes>
            },
            {
                path: "/historico", element:
                    <PrivateRoutes>
                        <History />
                    </PrivateRoutes>
            },
            {
                path: "/historico/:workout_log_id",
                element:
                    <PrivateRoutes>
                        <HistoryDetail />
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
            {
                path: "treino/iniciar/:id",
                element:
                    <PrivateRoutes>
                        <WorkoutStart />
                    </PrivateRoutes>
            },
            { path: "*", element: <div className="p-4 text-white flex items-center justify-center font-bold text-xl">Página não encontrada</div> }
        ]
    },
])
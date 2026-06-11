import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Home } from "../pages/home";
import { Workout } from "../pages/workout";
import { PRs } from "../pages/pr";
import { NewWorkout } from "../pages/new_workout";
import { Login } from "../pages/login";
import { Register } from "../pages/register";


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
            { index: true, element: <Home /> },
            { path: "treinos", element: <Workout /> },
            { path: "prs", element: <PRs /> },
            { path: "treino/novo", element: <NewWorkout /> },
            { path: "*", element: <div className="p-4">Página não encontrada</div> }
        ]
    },
])
import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Home } from "../pages/home";
import { Workout } from "../pages/workout";
import { PRs } from "../pages/pr";


export const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "treinos", element: <Workout /> },
            { path: "prs", element: <PRs /> },
            { path: "*", element: <div className="p-4">Página não encontrada</div> }
        ]
    }
])
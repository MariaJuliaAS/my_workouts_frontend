import { useEffect, useState } from "react";
import { LuDumbbell, LuPencil, LuTrash } from "react-icons/lu";
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { IoPlayOutline } from "react-icons/io5";

export interface WorkoutProps {
    id: string;
    name: string;
    user_id: string;
    exercises?: Exercise[];
}

interface Exercise {
    id: number
    name: string
    sets: string
    reps: string
    notes: string
}

export function Home() {
    const [workoutList, setWorkoutList] = useState<WorkoutProps[]>([])
    const navigate = useNavigate()

    async function fetchWorkouts() {
        try {
            const res = await api.get("/workout")
            setWorkoutList(res.data);
        } catch (err: any) {
            console.error(err.response?.data)
        }
    }

    useEffect(() => {
        fetchWorkouts();
    }, [])

    async function handleDeleteWorkout(workoutId: string) {
        console.log("Deleting workout with ID:", workoutId);
        try {
            await api.delete(`/workout/${workoutId}`);
            setWorkoutList(prevWorkouts => prevWorkouts.filter(workout => workout.id !== workoutId));
            alert("Treino deletado com sucesso!");
        } catch (err: any) {
            console.error(err.response?.data)
            alert("Erro ao deletar treino. Por favor, tente novamente.");
        }
    }

    return (
        <div className="h-full w-full  sm:px-0 px-10 py-5">
            {workoutList.length > 0 && (
                <header className="text-white flex flex-row justify-between mb-8">
                    <p className="font-medium text-lg sm:text-xl">Meus treinos</p>
                    <span className="text-gray-400">{workoutList.length} treino(s)</span>
                </header>
            )}

            <main className="w-full text-white flex justify-center h-full">
                {workoutList.length === 0 ? (
                    <div className="flex items-center justify-center flex-col py-10">
                        <LuDumbbell size={58} className="text-gray-400 mb-4" />
                        <p className="font-medium text-lg sm:text-xl">Nenhum treino ainda</p>
                        <p className="text-gray-400 max-w-68 text-center sm:text-base text-sm">Crie seu primeiro treino e comece a acompanhar seu progresso</p>
                        <NavLink to="/treino/novo"
                            className="sm:text-base text-sm bg-amber-600 px-4 h-10 rounded-lg flex items-center text-black cursor-pointer font-semibold mt-6 transition-all duration-200 shadow-lg shadow-amber-600/40 hover:bg-amber-500 hover:scale-105">
                            Crie seu primeiro treino
                        </NavLink>
                    </div>
                ) : (
                    <div className="flex items-center flex-col w-full overflow-y-auto gap-4">
                        {workoutList.map((workout) => (
                            <div
                                key={workout.id}
                                onClick={() => navigate(`/treino/${workout.id}`)}
                                className="w-full bg-neutral-950/70 border hover:border-amber-600/40 border-gray-800/60 cursor-pointer rounded-xl flex items-center justify-between px-4 py-3 group"
                            >
                                <div className="flex items-center justify-center gap-4">
                                    <div className="text-amber-600 bg-amber-600/30 flex items-center justify-center h-12 w-12 rounded-xl">
                                        <LuDumbbell size={24} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-lg">{workout.name}</p>
                                        <span className="text-gray-400">{workout.exercises?.length || 0} Exercícios</span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="items-center gap-2">
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                navigate(`/treino/iniciar/${workout.id}`)
                                            }}
                                            className="cursor-pointer transition-all duration-200 hover:scale-105 p-2">
                                            <IoPlayOutline size={24} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                navigate(`/treino/editar/${workout.id}`)
                                            }}
                                            className="cursor-pointer transition-all duration-200 hover:scale-105 p-2">
                                            <LuPencil size={20} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleDeleteWorkout(workout.id)
                                            }}
                                            className="cursor-pointer transition-all duration-200 hover:scale-105 p-2">
                                            <LuTrash size={20} className="text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
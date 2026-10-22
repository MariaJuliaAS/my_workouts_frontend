import { useEffect, useState } from "react";
import { LuDumbbell, LuPencil, LuTrash } from "react-icons/lu";
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { IoPlayOutline } from "react-icons/io5";
import { BiExport } from "react-icons/bi";
import { workoutToText, downloadTextFile } from "../../util/workoutToText";

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

export function Workout() {
    const [workoutList, setWorkoutList] = useState<WorkoutProps[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    async function fetchWorkouts() {
        try {
            const res = await api.get("/workout")
            setWorkoutList(res.data);
        } catch (err: any) {
            console.error(err.response?.data)
        } finally {
            setLoading(false)
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

    async function handleExportWorkout(workout: WorkoutProps) {
        try {
            let fullWorkout = workout;
            if (!workout.exercises) {
                const res = await api.get(`/workout/${workout.id}`);
                fullWorkout = res.data;
            }

            const text = workoutToText(fullWorkout);
            const safeName = fullWorkout.name.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_");
            const filename = `${safeName || "treino"}.txt`;

            if (navigator.share) {
                await navigator.share({ title: fullWorkout.name, text });
            } else {
                downloadTextFile(text, filename);
            }
        } catch (err: any) {
            // Usuário fechou a janela de compartilhamento: não é erro
            if (err?.name === "AbortError") return;

            console.error(err.response?.data ?? err);
            alert("Erro ao exportar treino. Por favor, tente novamente.");
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
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <p className="text-gray-400 text-sm">Carregando...</p>
                    </div>
                ) : workoutList.length === 0 ? (
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
                                className="w-full bg-neutral-950/70 border hover:border-amber-600/40 border-gray-800/60 cursor-pointer rounded-xl flex flex-col gap-2 px-4 py-3 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-row w-full justify-between">
                                        <div className="text-amber-600 bg-amber-600/30 flex items-center justify-center h-12 w-12 rounded-xl">
                                            <LuDumbbell className="text-2xl" />
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleExportWorkout(workout);
                                                }}
                                                className="cursor-pointer transition-all duration-200 hover:scale-105">
                                                <BiExport className="text-orange-200 sm:text-2xl text-lg" />
                                            </button>
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    navigate(`/treino/editar/${workout.id}`)
                                                }}
                                                className="cursor-pointer transition-all duration-200 hover:scale-105">
                                                <LuPencil className="text-orange-200 sm:text-2xl text-lg" />
                                            </button>
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleDeleteWorkout(workout.id)
                                                }}
                                                className="cursor-pointer transition-all duration-200 hover:scale-105">
                                                <LuTrash className="text-orange-200 sm:text-2xl text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-medium sm:text-lg text-base">{workout.name}</p>
                                    <span className="text-gray-400 sm:text-base text-sm">{workout.exercises?.length || 0} Exercícios</span>
                                </div>

                                <div className="flex items-center">
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            navigate(`/treino/iniciar/${workout.id}`)
                                        }}
                                        className="cursor-pointer transition-all duration-200 hover:scale-102 p-2 bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/40 text-black flex items-center justify-center w-full rounded-lg font-me">
                                        <IoPlayOutline className="sm:text-2xl text-xl" />
                                        Iniciar Treino
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

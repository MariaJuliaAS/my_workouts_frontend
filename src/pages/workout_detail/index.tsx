import { useEffect, useState } from "react"
import { FaArrowLeftLong } from "react-icons/fa6"
import { Link, useNavigate, useParams } from "react-router-dom"
import { api } from "../../api/api"

interface Exercise {
    id: string
    name: string
    sets: number
    reps: number
    notes?: string | null
}

interface WorkoutDetail {
    id: string
    name: string
    exercises: Exercise[]
}

export function WorkoutDetail() {
    const { id } = useParams<{ id: string }>()
    const [workout, setWorkout] = useState<WorkoutDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        loadWorkout()
    }, [id])

    async function loadWorkout() {
        if (!id) return

        try {
            setLoading(true)
            const res = await api.get(`/workout/${id}`)
            setWorkout(res.data)
        } catch (err: any) {
            console.error(err.response?.data)
            alert("Erro ao carregar treino")
            navigate("/")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center text-white">
                <p>Carregando treino...</p>
            </div>
        )
    }

    if (!workout) {
        return (
            <div className="h-full w-full flex items-center justify-center text-white">
                <p>Treino não encontrado</p>
            </div>
        )
    }

    return (
        <>
            <header className="w-full h-22 border-b border-gray-800/60 bg-black/50 text-white max-w-2xl mx-auto flex items-center gap-4 sm:px-0 px-10">
                <Link to="/treinos" className="transition-all duration-200 hover:scale-110">
                    <FaArrowLeftLong size={22} className="text-gray-500 mt-1" />
                </Link>
                <div>
                    <p className="font-bold text-2xl">{workout.name}</p>
                    <span className="text-gray-400 text-sm">{workout.exercises.length} exercício(s)</span>
                </div>
            </header>

            <div className="h-full w-full sm:px-0 px-10 py-5">
                <main className="w-full text-white flex justify-center h-full">
                    <div className="w-full flex flex-col gap-4">
                        {workout.exercises.length === 0 ? (
                            <div className="border border-dashed border-gray-700 rounded-xl py-8 text-center text-gray-500 text-sm">
                                Nenhum exercício cadastrado neste treino
                            </div>
                        ) : (
                            workout.exercises.map((exercise, index) => (
                                <div
                                    key={exercise.id}
                                    className="bg-neutral-950/70 border border-gray-800/60 rounded-xl p-4 flex flex-col gap-3"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-400 text-sm bg-gray-600/20 w-6 h-6 text-center flex items-center justify-center rounded-full">{index + 1}</span>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-lg truncate">{exercise.name}</p>
                                            <span className="text-gray-400 text-sm">
                                                {exercise.sets} Séries | {exercise.reps} Repetições
                                            </span>
                                            {exercise.notes ? (
                                                <p className="text-sm text-gray-400">{exercise.notes}</p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </>
    )
}

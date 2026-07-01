import { useEffect, useState } from "react"
import { FaArrowLeftLong } from "react-icons/fa6"
import { FiPlus, FiTrash2 } from "react-icons/fi"
import { Link, useNavigate, useParams } from "react-router-dom"
import { api } from "../../api/api"

interface Exercise {
    id: string | number
    name: string
    sets: string
    reps: string
    notes: string
}

interface WorkoutData {
    id: string
    name: string
    exercises: Exercise[]
}

export function EditWorkout() {
    const { id } = useParams<{ id: string }>()
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [workoutName, setWorkoutName] = useState("")
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        loadWorkout()
    }, [])

    async function loadWorkout() {
        if (!id) return

        try {
            setLoadingData(true)
            const res = await api.get(`/workout/${id}`)
            const workout: WorkoutData = res.data

            setWorkoutName(workout.name)
            setExercises(
                workout.exercises.map(ex => ({
                    id: ex.id,
                    name: ex.name,
                    sets: String(ex.sets),
                    reps: String(ex.reps),
                    notes: ex.notes || ""
                }))
            )
        } catch (err: any) {
            alert("Erro ao carregar treino")
            console.error(err.response?.data)
            navigate("/")
        } finally {
            setLoadingData(false)
        }
    }

    function addExercise() {
        setExercises(prev => [
            ...prev,
            { id: Date.now(), name: "", sets: "3", reps: "10", notes: "" }
        ])
    }

    async function removeExercise(exId: string | number) {
        if (typeof exId === "number") {
            setExercises(prev => prev.filter(ex => ex.id !== exId))
            return
        }

        try {
            await api.delete(`/workout/exercise/${exId}`)
            setExercises(prev => prev.filter(ex => ex.id !== exId))
        } catch (err: any) {
            alert("Erro ao remover exercício")
            console.error(err.response?.data)
        }
    }

    function updateExercise(exId: string | number, field: keyof Exercise, value: string) {
        setExercises(prev =>
            prev.map(ex => ex.id === exId ? { ...ex, [field]: value } : ex)
        )
    }

    async function handleSave() {
        if (!workoutName.trim()) {
            alert("Informe o nome do treino")
            return
        }

        try {
            setLoading(true)
            await api.put(`/workout/${id}`, {
                name: workoutName,
                exercises: exercises.map(ex => {
                    const exercise: any = {
                        name: ex.name,
                        sets: Number(ex.sets),
                        reps: Number(ex.reps),
                        notes: ex.notes || ""
                    }
                    // Only include id if it's a string (existing exercise from DB)
                    if (typeof ex.id === 'string') {
                        exercise.id = ex.id
                    }
                    return exercise
                })
            },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token_my_workouts")}`
                    }
                })
            alert("Treino atualizado com sucesso!")
            navigate("/")
        } catch (err: any) {
            alert("Erro ao atualizar treino")
            console.error(err.response?.data)
        } finally {
            setLoading(false)
        }
    }

    if (loadingData) {
        return (
            <div className="h-full w-full flex items-center justify-center text-white">
                <p>Carregando treino...</p>
            </div>
        )
    }

    return (
        <>
            <header className="w-full h-22 border-b border-gray-800/60 bg-black/50 text-white max-w-2xl mx-auto flex items-center gap-4 sm:px-0 px-10">
                <Link to="/" className="transition-all duration-200 hover:scale-110">
                    <FaArrowLeftLong size={22} className="text-gray-500 mt-1" />
                </Link>
                <p className="font-bold text-2xl">Editar Treino</p>
            </header>

            <div className="h-full w-full sm:px-0 px-10 py-5">
                <main className="w-full text-white flex justify-center h-full">
                    <div className="w-full flex flex-col gap-6">

                        <div>
                            <label className="font-medium">Nome do Treino</label>
                            <input
                                type="text"
                                value={workoutName}
                                onChange={e => setWorkoutName(e.target.value)}
                                className="mt-2 w-full bg-neutral-950/70 border border-gray-800/60 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                                placeholder="Ex: Upper 1, Push, Perna A..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="font-bold text-lg">Exercícios</p>
                                <button
                                    type="button"
                                    onClick={addExercise}
                                    className="cursor-pointer flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 transition-colors duration-200 rounded-full px-4 py-2 text-sm font-medium"
                                >
                                    <FiPlus size={14} />
                                    Adicionar
                                </button>
                            </div>

                            {exercises.length === 0 ? (
                                <div className="border border-dashed border-gray-700 rounded-xl py-8 text-center text-gray-500 text-sm">
                                    Nenhum exercício adicionado
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {exercises.map((ex, index) => (
                                        <div
                                            key={ex.id}
                                            className="bg-neutral-950/70 border border-gray-800/50 rounded-xl p-3 flex flex-col gap-3"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600 text-xl cursor-grab select-none">⠿</span>
                                                <input
                                                    type="text"
                                                    value={ex.name}
                                                    onChange={e => updateExercise(ex.id, "name", e.target.value)}
                                                    placeholder={`Exercício ${index + 1}`}
                                                    className="w-full bg-neutral-950/70 border border-gray-800/50 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:border-gray-600"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExercise(ex.id)}
                                                    className="cursor-pointer text-gray-600 hover:text-red-500 transition-colors duration-200 p-1"
                                                >
                                                    <FiTrash2 size={22} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 px-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Séries</span>
                                                    <input
                                                        type="number"
                                                        value={ex.sets}
                                                        onChange={e => updateExercise(ex.id, "sets", e.target.value)}
                                                        className="bg-neutral-950/70 border border-gray-800/50 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:border-gray-600"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Repetições</span>
                                                    <input
                                                        type="number"
                                                        value={ex.reps}
                                                        onChange={e => updateExercise(ex.id, "reps", e.target.value)}
                                                        className="bg-neutral-950/70 border border-gray-800/50 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:border-gray-600"
                                                    />
                                                </div>
                                            </div>

                                            <div className="px-6">
                                                <input
                                                    type="text"
                                                    value={ex.notes}
                                                    onChange={e => updateExercise(ex.id, "notes", e.target.value)}
                                                    placeholder="Observações (opcional)"
                                                    className="w-full bg-neutral-950/70 border border-gray-800/50 rounded-lg px-3 py-2 text-xs text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-600 focus:text-white"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full bg-amber-600 transition-all duration-200 shadow-lg shadow-amber-600/40 hover:bg-amber-500 hover:scale-105 text-black font-bold text-lg rounded-2xl py-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? "Atualizando..." : "Atualizar Treino"}
                        </button>

                    </div>
                </main>
            </div>
        </>
    )
}

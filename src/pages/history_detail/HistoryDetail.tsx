import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { api } from "../../api/api"
import { FaArrowLeftLong } from "react-icons/fa6"
import { LuClock4, LuDumbbell } from "react-icons/lu"
import { FiCheck } from "react-icons/fi"

// ---------- tipos ----------
interface ExerciseLog {
    id: string
    set_number: number
    weight: number
    reps: number
    completed: boolean
    exercise: {
        id: string
        name: string
    }
}

interface WorkoutLogDetail {
    id: string
    started_at: string
    completed_at: string | null
    workouts: {
        id: string
        name: string
    }
    exercises_logs: ExerciseLog[]
}

// ---------- tipos agrupados ----------
interface GroupedExercise {
    exerciseId: string
    exerciseName: string
    sets: ExerciseLog[]
}

// ---------- helpers ----------
function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

function formatDuration(started: string, completed: string): string {
    const diff = new Date(completed).getTime() - new Date(started).getTime()
    const totalMinutes = Math.floor(diff / 1000 / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0) return `${hours}h ${minutes}min`
    return `${minutes}min`
}

function groupByExercise(logs: ExerciseLog[]): GroupedExercise[] {
    const map = new Map<string, GroupedExercise>()
    for (const log of logs) {
        const key = log.exercise.id
        if (!map.has(key)) {
            map.set(key, { exerciseId: key, exerciseName: log.exercise.name, sets: [] })
        }
        map.get(key)!.sets.push(log)
    }
    return Array.from(map.values())
}

// ---------- componente ----------
export function HistoryDetail() {
    const { workout_log_id } = useParams<{ workout_log_id: string }>()
    const [log, setLog] = useState<WorkoutLogDetail | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDetail()
    }, [workout_log_id])

    async function fetchDetail() {
        if (!workout_log_id) return
        try {
            const res = await api.get<WorkoutLogDetail>(`/workout_log/${workout_log_id}`)
            setLog(res.data)
        } catch (err: any) {
            console.error(err.response?.data)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center text-white">
                <p className="text-gray-400 text-sm">Carregando...</p>
            </div>
        )
    }

    if (!log) {
        return (
            <div className="h-full w-full flex items-center justify-center text-white">
                <p className="text-gray-400 text-sm">Treino não encontrado</p>
            </div>
        )
    }

    const grouped = groupByExercise(log.exercises_logs)
    const totalSets = log.exercises_logs.length
    const doneSets = log.exercises_logs.filter((l) => l.completed).length

    return (
        <>
            {/* Header */}
            <header className="w-full h-22 border-b border-gray-800/60 bg-black/50 text-white max-w-2xl mx-auto flex items-center gap-4 sm:px-0 px-10">
                <Link to="/historico" className="transition-all duration-200 hover:scale-110">
                    <FaArrowLeftLong size={22} className="text-gray-500 mt-1" />
                </Link>
                <div>
                    <p className="font-bold text-2xl">{log.workouts.name}</p>
                    <span className="text-gray-400 text-sm capitalize">
                        {formatDate(log.started_at)}
                    </span>
                </div>
            </header>

            {/* Conteúdo */}
            <div className="h-full w-full sm:px-0 px-10 py-5">
                <main className="w-full text-white flex justify-center h-full">
                    <div className="w-full flex flex-col gap-4">

                        {/* Resumo */}
                        <div className="bg-neutral-950/70 border border-gray-800/60 rounded-xl px-4 py-3 flex items-center gap-6">
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <LuClock4 size={15} />
                                <span>
                                    {log.completed_at
                                        ? formatDuration(log.started_at, log.completed_at)
                                        : <span className="text-amber-500">Em andamento</span>
                                    }
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <LuDumbbell size={15} />
                                <span>{doneSets}/{totalSets} séries</span>
                            </div>
                        </div>

                        {/* Exercícios */}
                        {grouped.length === 0 ? (
                            <div className="border border-dashed border-gray-700 rounded-xl py-8 text-center text-gray-500 text-sm">
                                Nenhuma série registrada
                            </div>
                        ) : (
                            grouped.map((group) => (
                                <div
                                    key={group.exerciseId}
                                    className="bg-neutral-950/70 border border-gray-800/60 rounded-xl p-4 flex flex-col gap-4"
                                >
                                    {/* Cabeçalho do exercício */}
                                    <header className="flex items-center gap-3">
                                        <div className="text-amber-500 bg-amber-600/10 flex items-center justify-center w-10 h-10 rounded-full shrink-0">
                                            <LuDumbbell size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-base">{group.exerciseName}</p>
                                            <p className="text-gray-500 text-xs">{group.sets.length} séries</p>
                                        </div>
                                    </header>

                                    {/* Cabeçalho da tabela */}
                                    <div className="grid grid-cols-[32px_1fr_1fr_44px] gap-2 px-1">
                                        <span className="text-xs text-gray-600 uppercase tracking-wider text-center">Série</span>
                                        <span className="text-xs text-gray-600 uppercase tracking-wider text-center">Carga</span>
                                        <span className="text-xs text-gray-600 uppercase tracking-wider text-center">Reps</span>
                                        <span className="text-xs text-gray-600 uppercase tracking-wider text-center">Feito</span>
                                    </div>

                                    {/* Linhas — somente leitura */}
                                    <div className="flex flex-col gap-2">
                                        {group.sets.map((set) => (
                                            <div
                                                key={set.id}
                                                className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 items-center opacity-80"
                                            >
                                                <span className="text-center font-bold text-base text-white">
                                                    {set.set_number}
                                                </span>

                                                <div className="bg-neutral-900 border border-gray-800/60 rounded-xl px-3 py-2 text-sm text-center text-gray-300">
                                                    {set.weight} kg
                                                </div>

                                                <div className="bg-neutral-900 border border-gray-800/60 rounded-xl px-3 py-2 text-sm text-center text-gray-300">
                                                    {set.reps}
                                                </div>

                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                                    ${set.completed
                                                        ? "bg-amber-600/20 border border-amber-600/40 text-amber-500"
                                                        : "bg-neutral-900 border border-gray-800/60 text-gray-600"
                                                    }`}
                                                >
                                                    <FiCheck size={18} strokeWidth={set.completed ? 3 : 1.5} />
                                                </div>
                                            </div>
                                        ))}
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

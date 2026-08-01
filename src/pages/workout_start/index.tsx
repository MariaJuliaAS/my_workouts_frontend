import { useEffect, useState } from "react"
import { FaArrowLeftLong } from "react-icons/fa6"
import { Link, useNavigate, useParams } from "react-router-dom"
import { api } from "../../api/api"
import { LuClock4 } from "react-icons/lu"
import { FiCheck, FiAlertTriangle } from "react-icons/fi"

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

interface SetRow {
    set_number: number
    weight: string
    reps: string
    completed: boolean
}

interface ExerciseState {
    exercise: Exercise
    rows: SetRow[]
}

interface ExerciseLog {
    id: string
    exercise_id: string
    set_number: number
    weight: number
    reps: number
    completed: boolean
}

interface WorkoutLog {
    id: string
    started_at: string
    completed_at: string | null
    workouts_id: string
}

function buildRows(sets: number): SetRow[] {
    return Array.from({ length: sets }, (_, i) => ({
        set_number: i + 1,
        weight: "",
        reps: "",
        completed: false,
    }))
}

function buildRowsFromLogs(sets: number, logs: ExerciseLog[], exerciseId: string): SetRow[] {
    return Array.from({ length: sets }, (_, i) => {
        const savedLog = logs.find(
            (l) => l.exercise_id === exerciseId && l.set_number === i + 1
        )
        return {
            set_number: i + 1,
            weight: savedLog ? String(savedLog.weight) : "",
            reps: savedLog ? String(savedLog.reps) : "",
            completed: savedLog?.completed ?? false,
        }
    })
}

interface PendingModalProps {
    onResume: () => void
    onRestart: () => void
}

function PendingModal({ onResume, onRestart }: PendingModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-8 sm:pb-0">
            <div className="w-full max-w-sm bg-neutral-900 border border-gray-800/60 rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-amber-600/10 border border-amber-600/30 flex items-center justify-center">
                        <FiAlertTriangle size={26} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="font-bold text-lg text-white">Treino não finalizado</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Você tem um treino em andamento. Deseja continuar de onde parou?
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={onResume}
                        className="w-full bg-amber-600 hover:bg-amber-500 active:scale-[0.98] transition-all duration-200 text-black font-bold text-base rounded-xl py-3 cursor-pointer"
                    >
                        Continuar treino
                    </button>
                    <button
                        onClick={onRestart}
                        className="w-full bg-transparent hover:bg-gray-800/60 active:scale-[0.98] transition-all duration-200 text-gray-400 font-medium text-base rounded-xl py-3 border border-gray-800/60 cursor-pointer"
                    >
                        Começar do zero
                    </button>
                </div>
            </div>
        </div>
    )
}

export function WorkoutStart() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [workout, setWorkout] = useState<WorkoutDetail | null>(null)
    const [workoutLogId, setWorkoutLogId] = useState<string | null>(null)
    const [exerciseStates, setExerciseStates] = useState<ExerciseState[]>([])
    const [loading, setLoading] = useState(true)
    const [finishing, setFinishing] = useState(false)

    const [pendingLog, setPendingLog] = useState<WorkoutLog | null>(null)
    const [, setPendingLogs] = useState<ExerciseLog[]>([])
    const [showPendingModal, setShowPendingModal] = useState(false)

    useEffect(() => {
        init()
    }, [id])

    async function init() {
        if (!id) return
        try {
            setLoading(true)

            const [workoutRes, pendingRes] = await Promise.all([
                api.get<WorkoutDetail>(`/workout/${id}`),
                api.get<WorkoutLog | null>(`/workout_log/pending/${id}`),
            ])

            setWorkout(workoutRes.data)

            if (pendingRes.data) {
                const logsRes = await api.get<ExerciseLog[]>(`/exercise_log/${pendingRes.data.id}`)
                setPendingLog(pendingRes.data)
                setPendingLogs(logsRes.data)
                setShowPendingModal(true)

                setExerciseStates(
                    workoutRes.data.exercises.map((ex) => ({
                        exercise: ex,
                        rows: buildRowsFromLogs(ex.sets, logsRes.data, ex.id),
                    }))
                )

            } else {
                await startFreshLog(id, workoutRes.data)
            }
        } catch (err: any) {
            console.error(err.response?.data)
            alert("Erro ao carregar treino")
            navigate("/")
        } finally {
            setLoading(false)
        }
    }

    async function startFreshLog(workout_id: string, workoutData: WorkoutDetail) {
        const logRes = await api.post<{ id: string }>(`/workout_log/start/${workout_id}`)
        setWorkoutLogId(logRes.data.id)
        setExerciseStates(
            workoutData.exercises.map((ex) => ({
                exercise: ex,
                rows: buildRows(ex.sets),
            }))
        )
    }

    function handleResume() {
        if (!pendingLog) return
        setWorkoutLogId(pendingLog.id)
        setShowPendingModal(false)
    }

    async function handleRestart() {
        if (!id || !workout) return
        setShowPendingModal(false)
        try {
            await startFreshLog(id, workout)
        } catch (err: any) {
            console.error(err.response?.data)
            alert("Erro ao iniciar novo treino")
        }
    }

    function updateRow(exIdx: number, rowIdx: number, field: "weight" | "reps", value: string) {
        setExerciseStates((prev) =>
            prev.map((es, i) =>
                i !== exIdx
                    ? es
                    : {
                        ...es,
                        rows: es.rows.map((r, j) =>
                            j !== rowIdx ? r : { ...r, [field]: value }
                        ),
                    }
            )
        )
    }

    async function completeSet(exIdx: number, rowIdx: number) {
        if (!workoutLogId) return

        const { exercise, rows } = exerciseStates[exIdx]
        const row = rows[rowIdx]

        if (!row.weight || !row.reps) {
            alert("Preencha o peso e as repetições antes de marcar como feito.")
            return
        }

        try {
            await api.post("/exercise_log", {
                workout_logs_id: workoutLogId,
                exercise_id: exercise.id,
                set_number: row.set_number,
                weight: parseFloat(row.weight),
                reps: parseInt(row.reps),
            })

            setExerciseStates((prev) =>
                prev.map((es, i) =>
                    i !== exIdx
                        ? es
                        : {
                            ...es,
                            rows: es.rows.map((r, j) =>
                                j !== rowIdx ? r : { ...r, completed: true }
                            ),
                        }
                )
            )
        } catch (err: any) {
            console.error(err.response?.data)
            alert("Erro ao salvar a série.")
        }
    }

    async function finishWorkout() {
        if (!workoutLogId) return
        setFinishing(true)
        try {
            await api.put(`/workout_log/completed/${workoutLogId}`)
            navigate("/")
        } catch (err: any) {
            console.error(err.response?.data)
            alert("Erro ao finalizar o treino.")
        } finally {
            setFinishing(false)
        }
    }

    const totalSets = exerciseStates.reduce((acc, es) => acc + es.rows.length, 0)
    const doneSets = exerciseStates.reduce(
        (acc, es) => acc + es.rows.filter((r) => r.completed).length,
        0
    )
    const progressPct = totalSets === 0 ? 0 : Math.round((doneSets / totalSets) * 100)

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
            {showPendingModal && (
                <PendingModal onResume={handleResume} onRestart={handleRestart} />
            )}

            <header className="w-full h-22 border-b border-gray-800/60 bg-black/50 text-white max-w-2xl mx-auto flex items-center justify-between gap-4 sm:px-0 px-10">
                <div className="flex items-center gap-4">
                    <Link to="/" className="transition-all duration-200 hover:scale-110">
                        <FaArrowLeftLong size={22} className="text-gray-500 mt-1" />
                    </Link>
                    <div>
                        <p className="font-bold text-2xl">{workout.name}</p>
                        <span className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                            <LuClock4 />
                            {doneSets}/{totalSets} séries
                        </span>
                    </div>
                </div>
                <span className={`font-bold text-lg ${progressPct === 100 ? "text-green-400" : "text-amber-500"}`}>
                    {progressPct}%
                </span>
            </header>

            <div className="h-full w-full sm:px-0 px-10 py-5">
                <main className="w-full text-white flex justify-center h-full">
                    <div className="w-full flex flex-col gap-4">
                        {workout.exercises.length === 0 ? (
                            <div className="border border-dashed border-gray-700 rounded-xl py-8 text-center text-gray-500 text-sm">
                                Nenhum exercício cadastrado neste treino
                            </div>
                        ) : (
                            exerciseStates.map((es, exIdx) => {
                                const exDone = es.rows.filter((r) => r.completed).length

                                return (
                                    <div
                                        key={es.exercise.id}
                                        className="bg-neutral-950/70 border border-gray-800/60 rounded-xl p-4 flex flex-col gap-4"
                                    >
                                        <header className="flex items-center gap-3">
                                            <p className="text-amber-500 text-sm bg-gray-600/20 w-10 h-10 font-bold text-center flex items-center justify-center rounded-full">
                                                {exDone}/{es.exercise.sets}
                                            </p>
                                            <div>
                                                <p className="font-semibold text-lg">{es.exercise.name}</p>
                                                <p className="text-gray-500 text-xs">{es.exercise.sets} séries · {es.exercise.reps} reps</p>
                                            </div>
                                        </header>

                                        <div className="grid grid-cols-[32px_1fr_1fr_44px] gap-2 px-1">
                                            <span className="text-xs text-gray-600 uppercase tracking-wider text-center">Série</span>
                                            <span className="text-xs text-gray-600 uppercase tracking-wider text-center">Carga</span>
                                            <span className="text-xs text-gray-600 uppercase tracking-wider text-center">Reps</span>
                                            <span className="text-xs text-gray-600 uppercase tracking-wider text-center">Feito</span>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {es.rows.map((row, rowIdx) => (
                                                <div
                                                    key={rowIdx}
                                                    className={`grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 items-center transition-opacity duration-200 ${row.completed ? "opacity-40" : ""}`}
                                                >
                                                    <span className="text-center font-bold text-base">
                                                        {row.set_number}
                                                    </span>

                                                    <input
                                                        type="number"
                                                        inputMode="decimal"
                                                        placeholder="kg"
                                                        value={row.weight}
                                                        disabled={row.completed}
                                                        onChange={(e) => updateRow(exIdx, rowIdx, "weight", e.target.value)}
                                                        className="bg-neutral-950/70 border border-gray-800/60 rounded-xl px-3 py-2 text-sm text-center text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-transparent disabled:cursor-not-allowed"
                                                    />

                                                    <input
                                                        type="number"
                                                        inputMode="numeric"
                                                        placeholder="reps"
                                                        value={row.reps}
                                                        disabled={row.completed}
                                                        onChange={(e) => updateRow(exIdx, rowIdx, "reps", e.target.value)}
                                                        className="bg-neutral-950/70 border border-gray-800/60 rounded-xl px-3 py-2 text-sm text-center text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-transparent disabled:cursor-not-allowed"
                                                    />

                                                    <button
                                                        onClick={() => completeSet(exIdx, rowIdx)}
                                                        disabled={row.completed}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer
                                                            ${row.completed
                                                                ? "bg-amber-600/20 border border-amber-600/40 text-amber-500"
                                                                : "bg-neutral-950/70 border border-gray-800/60 text-gray-500 hover:border-amber-600/60 hover:text-amber-500"
                                                            }`}
                                                    >
                                                        <FiCheck size={18} strokeWidth={row.completed ? 3 : 2} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })
                        )}

                        <div className="bg-linear-to-t from-black via-black/95 to-transparent">
                            <button
                                onClick={finishWorkout}
                                disabled={finishing || showPendingModal}
                                className="w-full bg-amber-600 hover:bg-amber-500 active:scale-105 disabled:opacity-60 transition-all duration-200 shadow-lg shadow-amber-600/30 text-black font-bold text-lg rounded-2xl py-2 cursor-pointer"
                            >
                                {finishing ? "Finalizando..." : "Finalizar Treino"}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}

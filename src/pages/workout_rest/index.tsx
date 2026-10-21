import { useEffect, useRef, useState } from "react"
import { LuMinus, LuPlus, LuX } from "react-icons/lu"
import { useLocation, useNavigate, useParams } from "react-router-dom"

interface RestLocationState {
    nextExercise?: string
    nextSet?: number
    nextTotalSets?: number
    nextWeight?: string
    nextReps?: string
}

const DEFAULT_REST_SECONDS = 90

export function WorkoutRest() {
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams<{ id: string }>()
    const restState = (location.state as RestLocationState | null) ?? {}
    const [totalSeconds, setTotalSeconds] = useState(DEFAULT_REST_SECONDS)
    const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_REST_SECONDS)
    const endsAt = useRef(Date.now() + DEFAULT_REST_SECONDS * 1000)

    useEffect(() => {
        function updateRemainingTime() {
            const nextRemainingSeconds = Math.max(
                Math.ceil((endsAt.current - Date.now()) / 1000),
                0
            )

            setRemainingSeconds(nextRemainingSeconds)

            if (nextRemainingSeconds === 0) {
                returnToWorkout()
            }
        }

        updateRemainingTime()
        const timer = window.setInterval(updateRemainingTime, 1000)

        return () => window.clearInterval(timer)
    }, [navigate])

    function returnToWorkout() {
        if (!id) {
            navigate("/")
            return
        }

        navigate(`/treino/iniciar/${id}`, {
            replace: true,
            state: { resumeWorkout: true },
        })
    }

    function adjustTime(amount: number) {
        const nextEndTime = Math.max(endsAt.current + amount * 1000, Date.now())
        const nextValue = Math.ceil((nextEndTime - Date.now()) / 1000)

        endsAt.current = nextEndTime
        setRemainingSeconds(nextValue)
        setTotalSeconds((currentTotal) => Math.max(currentTotal, nextValue))

        if (nextValue === 0) {
            returnToWorkout()
        }
    }

    function formatTime(seconds: number) {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, "0")
        const rest = (seconds % 60).toString().padStart(2, "0")
        return `${minutes}:${rest}`
    }

    const progress = totalSeconds === 0 ? 0 : remainingSeconds / totalSeconds
    const progressAngle = `${Math.round(progress * 360)}deg`

    return (
        <div className="h-dvh w-full overflow-hidden bg-black text-white flex items-center justify-center px-4 py-4">
            <main className="w-full max-w-sm h-full min-h-0 flex flex-col px-4 py-4">
                <header className="flex items-center justify-between">
                    <button
                        onClick={returnToWorkout}
                        aria-label="Fechar descanso"
                        className="text-gray-300 hover:text-white cursor-pointer"
                    >
                        <LuX size={20} />
                    </button>
                    <span className="text-sm font-semibold">REST</span>
                    <span className="w-5" />
                </header>

                <section className="flex flex-1 flex-col items-center justify-center gap-8">
                    <div
                        className="w-52 h-52 rounded-full flex items-center justify-center"
                        style={{
                            background: `conic-gradient(#ff7800 ${progressAngle}, #292929 0deg)`,
                        }}
                    >
                        <div className="w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full bg-black flex flex-col items-center justify-center">
                            <span className="text-2xl font-semibold">REST</span>
                            <span className="text-5xl text-orange-500 font-medium tracking-tight">
                                {formatTime(remainingSeconds)}
                            </span>
                        </div>
                    </div>

                    <div className="w-full bg-neutral-900 border border-gray-800/60 rounded-lg p-4 text-center">
                        <p className="text-[10px] uppercase text-gray-400 mb-2">Up next</p>
                        <p className="font-bold text-lg">
                            {restState.nextExercise ?? "Próxima série"}
                        </p>
                        {restState.nextSet && restState.nextTotalSets ? (
                            <p className="text-sm text-orange-300 mt-1">
                                Série {restState.nextSet} de {restState.nextTotalSets}
                                {restState.nextWeight && restState.nextReps
                                    ? ` · ${restState.nextWeight} kg x ${restState.nextReps} reps`
                                    : ""}
                            </p>
                        ) : null}
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2">
                        <button
                            onClick={() => adjustTime(-15)}
                            className="h-9 border border-gray-800/60 rounded-md text-sm font-semibold hover:border-gray-600 cursor-pointer"
                        >
                            <LuMinus size={14} className="inline mr-2" />15s
                        </button>
                        <button
                            onClick={() => adjustTime(15)}
                            className="h-9 border border-gray-800/60 rounded-md text-sm font-semibold hover:border-gray-600 cursor-pointer"
                        >
                            <LuPlus size={14} className="inline mr-2" />15s
                        </button>
                    </div>
                </section>

                <button
                    onClick={returnToWorkout}
                    className="w-full bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-md py-3 cursor-pointer"
                >
                    Pular Descanso
                </button>
            </main>
        </div>
    )
}

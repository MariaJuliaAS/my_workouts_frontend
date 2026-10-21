import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/api"
import { LuDumbbell, LuTrash } from "react-icons/lu"
import { RiArrowRightSLine } from "react-icons/ri"

interface WorkoutLog {
    id: string
    started_at: string
    completed_at: string | null
    workouts: {
        id: string
        name: string
    }
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

function formatDuration(started: string, completed: string): string {
    const diff =
        new Date(completed).getTime() -
        new Date(started).getTime()

    const totalMinutes = Math.floor(diff / 1000 / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours > 0) return `${hours}h ${minutes}min`
    return `${minutes}min`
}

type TabType = "em_andamento" | "concluidos"

function getStartOfWeek(date: Date): Date {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)

    const day = result.getDay()
    const daysSinceMonday = day === 0 ? 6 : day - 1

    result.setDate(result.getDate() - daysSinceMonday)

    return result
}

function getWeeksAgo(date: Date, currentWeekStart: Date): number {
    const dateWeekStart = getStartOfWeek(date)

    return Math.round(
        (currentWeekStart.getTime() - dateWeekStart.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    )
}

function getWeekLabel(weeksAgo: number): string {
    if (weeksAgo === 0) return "ESTA SEMANA"
    if (weeksAgo === 1) return "SEMANA PASSADA"

    return `${weeksAgo} SEMANAS ATRÁS`
}

export function History() {
    const navigate = useNavigate()

    const [logs, setLogs] = useState<WorkoutLog[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] =
        useState<TabType>("concluidos")
    const [weeksToShow, setWeeksToShow] = useState(2)

    useEffect(() => {
        fetchLogs()
    }, [])

    async function fetchLogs() {
        try {
            const res = await api.get<WorkoutLog[]>("/workout_log")
            setLogs(res.data)
        } catch (err: any) {
            console.error(err.response?.data)
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteWorkoutLog(workoutLogId: string) {
        try {
            await api.delete(`/workout_log/${workoutLogId}`)

            setLogs((prevLogs) =>
                prevLogs.filter((log) => log.id !== workoutLogId)
            )

            alert("Log do treino deletado com sucesso!")
        } catch (err: any) {
            console.error(err.response?.data)
            alert(
                "Erro ao deletar log do treino. Por favor, tente novamente."
            )
        }
    }

    const concluidos = logs.filter(
        (log) => log.completed_at !== null
    )

    const emAndamento = logs.filter(
        (log) => log.completed_at === null
    )

    const filtered =
        activeTab === "concluidos" ? concluidos : emAndamento

    const currentWeekStart = getStartOfWeek(new Date())

    const visibleLogs = concluidos
        .filter((log) => {
            const weeksAgo = getWeeksAgo(
                new Date(log.started_at),
                currentWeekStart
            )

            return weeksAgo >= 0 && weeksAgo < weeksToShow
        })
        .sort(
            (a, b) =>
                new Date(b.started_at).getTime() -
                new Date(a.started_at).getTime()
        )

    const groupedLogs = visibleLogs.reduce<
        { weeksAgo: number; label: string; logs: WorkoutLog[] }[]
    >((groups, log) => {
        const weeksAgo = getWeeksAgo(
            new Date(log.started_at),
            currentWeekStart
        )

        let group = groups.find(
            (item) => item.weeksAgo === weeksAgo
        )

        if (!group) {
            group = {
                weeksAgo,
                label: getWeekLabel(weeksAgo),
                logs: [],
            }

            groups.push(group)
        }

        group.logs.push(log)

        return groups
    }, [])

    const hasMoreWeeks = concluidos.some((log) => {
        const weeksAgo = getWeeksAgo(
            new Date(log.started_at),
            currentWeekStart
        )

        return weeksAgo >= weeksToShow
    })

    return (
        <div className="h-full w-full sm:px-0 px-10 py-5">
            <div className="flex bg-neutral-950/70 border border-gray-800/60 rounded-xl p-1 mb-6">
                <button
                    onClick={() => setActiveTab("concluidos")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer
                        ${activeTab === "concluidos"
                            ? "bg-amber-600 text-black shadow-sm"
                            : "text-gray-400 hover:text-white"
                        }`}
                >
                    Concluídos

                    {concluidos.length > 0 && (
                        <span
                            className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold
                                ${activeTab === "concluidos"
                                    ? "bg-black/20 text-black"
                                    : "bg-gray-800 text-gray-400"
                                }`}
                        >
                            {concluidos.length}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("em_andamento")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer
                        ${activeTab === "em_andamento"
                            ? "bg-amber-600 text-black shadow-sm"
                            : "text-gray-400 hover:text-white"
                        }`}
                >
                    Em andamento

                    {emAndamento.length > 0 && (
                        <span
                            className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold
                                ${activeTab === "em_andamento"
                                    ? "bg-black/20 text-black"
                                    : "bg-gray-800 text-gray-400"
                                }`}
                        >
                            {emAndamento.length}
                        </span>
                    )}
                </button>
            </div>

            <main className="w-full text-white flex justify-center h-full">
                {loading ? (
                    <div className="flex items-center justify-center py-16 w-full">
                        <p className="text-gray-400 text-sm">
                            Carregando...
                        </p>
                    </div>
                ) : activeTab === "concluidos" &&
                    visibleLogs.length === 0 ? (
                    <div className="flex items-center justify-center flex-col py-10 w-full">
                        <LuDumbbell
                            size={48}
                            className="text-gray-600 mb-4"
                        />

                        <p className="font-medium text-base text-gray-400">
                            Nenhum treino concluído nas semanas exibidas
                        </p>

                        {hasMoreWeeks && (
                            <button
                                onClick={() =>
                                    setWeeksToShow((prev) => prev + 1)
                                }
                                className="mt-4 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                                Carregar mais
                            </button>
                        )}
                    </div>
                ) : activeTab === "em_andamento" &&
                    filtered.length === 0 ? (
                    <div className="flex items-center justify-center flex-col py-10 w-full">
                        <LuDumbbell
                            size={48}
                            className="text-gray-600 mb-4"
                        />

                        <p className="font-medium text-base text-gray-400">
                            Nenhum treino em andamento
                        </p>
                    </div>
                ) : activeTab === "concluidos" ? (
                    <div className="flex flex-col w-full gap-6">
                        {groupedLogs.map((group) => (
                            <section
                                key={group.weeksAgo}
                                className="flex flex-col gap-3"
                            >
                                <h3 className="text-[10px] font-semibold text-gray-400">
                                    {group.label}
                                </h3>

                                <div className="flex flex-col w-full gap-3">
                                    {group.logs.map((log) => (
                                        <div
                                            key={log.id}
                                            onClick={() =>
                                                navigate(
                                                    `/historico/${log.id}`
                                                )
                                            }
                                            className="w-full bg-neutral-950/70 border border-gray-800/60 hover:border-amber-600/40 cursor-pointer rounded-xl flex items-center justify-between px-4 py-3 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-amber-600 bg-amber-600/20 flex items-center justify-center h-12 w-12 rounded-xl shrink-0">
                                                    <LuDumbbell size={22} />
                                                </div>

                                                <div>
                                                    <p className="font-medium text-base">
                                                        {log.workouts.name}
                                                    </p>

                                                    <p className="text-gray-500 text-xs mt-0.5">
                                                        {formatDate(
                                                            log.started_at
                                                        )}
                                                    </p>

                                                    <p className="text-gray-500 text-xs mt-0.5">
                                                        {`Duração: ${formatDuration(
                                                            log.started_at,
                                                            log.completed_at!
                                                        )}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation()
                                                        handleDeleteWorkoutLog(
                                                            log.id
                                                        )
                                                    }}
                                                    className="cursor-pointer transition-all duration-200 hover:scale-105"
                                                >
                                                    <LuTrash className="text-gray-400 sm:text-xl text-lg" />
                                                </button>

                                                <RiArrowRightSLine
                                                    size={22}
                                                    className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}

                        {hasMoreWeeks && (
                            <button
                                onClick={() =>
                                    setWeeksToShow((prev) => prev + 1)
                                }
                                className="w-full py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                                Carregar mais
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col w-full gap-3">
                        {emAndamento.map((log) => (
                            <div
                                key={log.id}
                                onClick={() =>
                                    navigate(`/historico/${log.id}`)
                                }
                                className="w-full bg-neutral-950/70 border border-gray-800/60 hover:border-amber-600/40 cursor-pointer rounded-xl flex items-center justify-between px-4 py-3 transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-amber-600 bg-amber-600/20 flex items-center justify-center h-12 w-12 rounded-xl shrink-0">
                                        <LuDumbbell size={22} />
                                    </div>

                                    <div>
                                        <p className="font-medium text-base">
                                            {log.workouts.name}
                                        </p>

                                        <p className="text-gray-500 text-xs mt-0.5">
                                            {formatDate(log.started_at)}
                                        </p>

                                        <p className="text-gray-500 text-xs mt-0.5">
                                            <span className="text-amber-500/80">
                                                Em andamento
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            handleDeleteWorkoutLog(log.id)
                                        }}
                                        className="cursor-pointer transition-all duration-200 hover:scale-105"
                                    >
                                        <LuTrash className="text-gray-400 sm:text-xl text-lg" />
                                    </button>

                                    <RiArrowRightSLine
                                        size={22}
                                        className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

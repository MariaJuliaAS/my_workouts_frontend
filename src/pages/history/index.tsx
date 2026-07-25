import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/api"
import { LuDumbbell } from "react-icons/lu"
import { RiArrowRightSLine } from "react-icons/ri"

// ---------- tipos ----------
interface WorkoutLog {
    id: string
    started_at: string
    completed_at: string | null
    workouts: {
        id: string
        name: string
    }
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

type TabType = "em_andamento" | "concluidos"

// ---------- componente ----------
export function History() {
    const navigate = useNavigate()
    const [logs, setLogs] = useState<WorkoutLog[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<TabType>("concluidos")

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

    const concluidos = logs.filter((l) => l.completed_at !== null)
    const emAndamento = logs.filter((l) => l.completed_at === null)
    const filtered = activeTab === "concluidos" ? concluidos : emAndamento

    return (
        <div className="h-full w-full sm:px-0 px-10 py-5">

            {/* Toggle tabs */}
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
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold
                            ${activeTab === "concluidos" ? "bg-black/20 text-black" : "bg-gray-800 text-gray-400"}`}>
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
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold
                            ${activeTab === "em_andamento" ? "bg-black/20 text-black" : "bg-gray-800 text-gray-400"}`}>
                            {emAndamento.length}
                        </span>
                    )}
                </button>
            </div>

            <main className="w-full text-white flex justify-center h-full">
                {loading ? (
                    <div className="flex items-center justify-center py-16 w-full">
                        <p className="text-gray-400 text-sm">Carregando...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex items-center justify-center flex-col py-10 w-full">
                        <LuDumbbell size={48} className="text-gray-600 mb-4" />
                        <p className="font-medium text-base text-gray-400">
                            {activeTab === "concluidos"
                                ? "Nenhum treino concluído ainda"
                                : "Nenhum treino em andamento"}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col w-full gap-3">
                        {filtered.map((log) => (
                            <div
                                key={log.id}
                                onClick={() => navigate(`/historico/${log.id}`)}
                                className="w-full bg-neutral-950/70 border border-gray-800/60 hover:border-amber-600/40 cursor-pointer rounded-xl flex items-center justify-between px-4 py-3 transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-amber-600 bg-amber-600/20 flex items-center justify-center h-12 w-12 rounded-xl shrink-0">
                                        <LuDumbbell size={22} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-base">{log.workouts.name}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">
                                            {formatDate(log.started_at)}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-0.5">
                                            {log.completed_at
                                                ? `Duração: ${formatDuration(log.started_at, log.completed_at)}`
                                                : <span className="text-amber-500/80">Em andamento</span>
                                            }
                                        </p>
                                    </div>
                                </div>
                                <RiArrowRightSLine size={22} className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

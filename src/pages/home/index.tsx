import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/api"
import { FiChevronRight } from "react-icons/fi"
import { GoTrophy } from "react-icons/go"
import { LuFlame, LuClock4 } from "react-icons/lu"
import { IoMdCheckmarkCircleOutline } from "react-icons/io"

interface HomeStats {
    streak: number
    weekHours: number
    lastPr: { exercise_name: string; weight: number; reps: number } | null
}

interface WeeklyPlan {
    id: string
    day_of_week: number
    note: string | null
    workout_id: string | null
    workout: { id: string; name: string } | null
    type: "REST" | "CARDIO" | "WORKOUT"
}

interface WorkoutLog {
    id: string
    started_at: string
    completed_at: string | null
    workouts_id: string
}

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function getWeekDates(): Date[] {
    const now = new Date()
    const dow = now.getDay()
    const diffToMonday = dow === 0 ? -6 : 1 - dow
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMonday)
    monday.setHours(0, 0, 0, 0)
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        return d
    })
}

function toDateStr(date: Date) {
    return date.toISOString().slice(0, 10)
}

function getDayItems(plans: WeeklyPlan[]) {
    if (plans.length === 0) {
        return [
            {
                title: "Sem planejamento",
                subtitle: null,
                isRest: true,
            },
        ]
    }

    return plans.map(plan => {
        if (plan.type === "REST") {
            return {
                title: "Descanso",
                subtitle: plan.note,
                isRest: true,
            }
        }

        if (plan.type === "CARDIO") {
            return {
                title: "Cardio",
                subtitle: plan.note,
                isRest: false,
            }
        }

        return {
            title: plan.workout?.name ?? "Treino",
            subtitle: plan.note,
            isRest: false,
        }
    })
}

export function Home() {
    const navigate = useNavigate()

    const [stats, setStats] = useState<HomeStats | null>(null)
    const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([])
    const [weekLogs, setWeekLogs] = useState<WorkoutLog[]>([])
    const [loading, setLoading] = useState(true)

    const weekDates = getWeekDates()
    const todayStr = toDateStr(new Date())

    useEffect(() => {
        fetchAll()
    }, [])

    async function fetchAll() {
        try {
            const [statsRes, plansRes, logsRes] = await Promise.all([
                api.get<HomeStats>("/home/stats"),
                api.get<WeeklyPlan[]>("/weekly_plan"),
                api.get<WorkoutLog[]>("/workout_log"),
            ])
            setStats(statsRes.data)
            setWeeklyPlans(plansRes.data)
            setWeekLogs(logsRes.data)
        } catch (err: any) {
            console.error(err.response?.data)
        } finally {
            setLoading(false)
        }
    }

    function getPlansForDate(date: Date): WeeklyPlan[] {
        return weeklyPlans.filter(p => p.day_of_week === date.getDay())
    }

    function isCompleted(workoutId: string, date: Date): boolean {
        const dateStr = toDateStr(date)
        return weekLogs.some(log =>
            log.workouts_id === workoutId &&
            log.completed_at !== null &&
            log.completed_at.slice(0, 10) === dateStr
        )
    }

    const isToday = (date: Date) => toDateStr(date) === todayStr

    return (
        <div className="h-full w-full sm:px-0 px-6 py-5 flex flex-col gap-5">

            {loading ? (
                <div className="grid grid-cols-2 gap-3">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="bg-neutral-950/70 border border-gray-800/60 rounded-xl p-4 h-20 animate-pulse" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-neutral-950/70 border border-gray-800/60 rounded-xl p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-amber-500">
                                <LuFlame size={16} />
                                <span className="text-xs text-gray-400">dias seguidos</span>
                            </div>
                            <p className="text-white font-bold text-2xl">{stats?.streak ?? 0}</p>
                            <p className="text-gray-500 text-xs">sequência atual</p>
                        </div>

                        <div className="bg-neutral-950/70 border border-gray-800/60 rounded-xl p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-amber-500">
                                <LuClock4 size={16} />
                                <span className="text-xs text-gray-400">esta semana</span>
                            </div>
                            <p className="text-white font-bold text-2xl">{stats?.weekHours ?? 0}h</p>
                            <p className="text-gray-500 text-xs">treinadas</p>
                        </div>
                    </div>

                    {stats?.lastPr && (
                        <div
                            onClick={() => navigate("/prs")}
                            className="bg-amber-600/10 border border-amber-600/30 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-amber-600/60 transition-all duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <GoTrophy size={20} className="text-amber-500 shrink-0" />
                                <div>
                                    <p className="text-xs text-amber-500/80 font-medium uppercase tracking-wider">Novo PR</p>
                                    <p className="text-white font-semibold text-sm">
                                        {stats.lastPr.exercise_name}: {stats.lastPr.weight}kg × {stats.lastPr.reps} reps
                                    </p>
                                </div>
                            </div>
                            <FiChevronRight size={18} className="text-amber-600/60" />
                        </div>
                    )}
                </>
            )}

            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-semibold text-base">Visão Semanal</p>
                    <span className="text-gray-500 text-xs">
                        {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    {weekDates.map((date, idx) => {
                        const plans = getPlansForDate(date)
                        const today = isToday(date)
                        const dow = date.getDay()
                        const items = getDayItems(plans)

                        const workoutPlans = plans.filter(p => p.workout_id !== null)
                        const hasWorkouts = workoutPlans.length > 0
                        const allDone = hasWorkouts && workoutPlans.every(p =>
                            isCompleted(p.workout_id!, date)
                        )
                        const noPlans = plans.length === 0

                        return (
                            <div
                                key={idx}
                                onClick={() => navigate("/planejar-semana")}
                                className={`w-full rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all duration-200 border
                                    ${today
                                        ? "bg-amber-600/10 border-amber-600/40"
                                        : "bg-neutral-950/70 border-gray-800/60 hover:border-gray-700"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex flex-col items-center w-9 shrink-0 ${today ? "text-amber-500" : "text-gray-500"}`}>
                                        <span className="text-xs font-medium">{DAY_LABELS[dow]}</span>
                                        <span className="text-base font-bold leading-tight">{date.getDate()}</span>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {items.map((item, index) => (
                                            <div key={index} className="flex flex-col">
                                                <p
                                                    className={`text-sm font-medium ${noPlans
                                                        ? "text-gray-600"
                                                        : "text-white"
                                                        }`}
                                                >
                                                    {item.title}
                                                </p>

                                                {item.subtitle && (
                                                    <p className="text-gray-500 text-xs">
                                                        {item.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    {hasWorkouts && allDone ? (
                                        <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                                            <IoMdCheckmarkCircleOutline size={20} />
                                            Concluído
                                        </span>
                                    ) : today && hasWorkouts ? (
                                        <span className="text-xs text-amber-500 font-medium flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                                            Pendente
                                        </span>
                                    ) : (
                                        <FiChevronRight size={16} className="text-gray-700" />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

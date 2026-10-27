import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/api"
import { FiChevronRight, FiPlay } from "react-icons/fi"
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

const DAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"]
const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const DAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"]

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

// Usa a data LOCAL (toISOString converte para UTC e pode virar o dia à noite no Brasil)
function toDateStr(date: Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

function getDayItems(plans: WeeklyPlan[]) {
    if (plans.length === 0) {
        return [{ title: "Sem planejamento", subtitle: null as string | null, isRest: true }]
    }

    return plans.map(plan => {
        if (plan.type === "REST") {
            return { title: "Descanso", subtitle: plan.note, isRest: true }
        }
        if (plan.type === "CARDIO") {
            return { title: "Cardio", subtitle: plan.note, isRest: false }
        }
        return { title: plan.workout?.name ?? "Treino", subtitle: plan.note, isRest: false }
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

    // dia selecionado na faixa da semana (começa em hoje)
    const [selectedStr, setSelectedStr] = useState(todayStr)

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
            toDateStr(new Date(log.completed_at)) === dateStr
        )
    }

    function getDayStatus(date: Date) {
        const plans = getPlansForDate(date)
        const workoutPlans = plans.filter(p => p.workout_id !== null)
        const hasWorkouts = workoutPlans.length > 0
        const allDone = hasWorkouts && workoutPlans.every(p => isCompleted(p.workout_id!, date))
        return { plans, workoutPlans, hasWorkouts, allDone }
    }

    const isToday = (date: Date) => toDateStr(date) === todayStr

    // ---- Card principal: dia selecionado ----
    const selectedDate = weekDates.find(d => toDateStr(d) === selectedStr) ?? weekDates[0]
    const selectedIsToday = isToday(selectedDate)
    const isFuture = toDateStr(selectedDate) > todayStr
    const selected = getDayStatus(selectedDate)
    const selectedItems = getDayItems(selected.plans)
    const heroItem = selectedItems[0]
    const heroExtras = selectedItems.slice(1)
    const heroIsRest = selectedItems.every(i => i.isRest)

    // primeiro treino do dia que ainda não foi concluído (é o que o play inicia)
    const pendingPlan = selected.workoutPlans.find(p => !isCompleted(p.workout_id!, selectedDate))
    const canStart = selectedIsToday && !!pendingPlan

    const heroLabel = selectedIsToday ? "Treino de hoje" : `Treino de ${DAY_NAMES[selectedDate.getDay()]}`

    const heroBadge = selected.allDone
        ? "Concluído"
        : selectedIsToday
            ? "Pendente"
            : isFuture
                ? "Planejado"
                : "Não realizado"

    const heroFooter = heroIsRest
        ? selected.plans.length === 0
            ? "Nada planejado para este dia"
            : "Aproveite para recuperar"
        : selected.allDone
            ? "Treino finalizado"
            : selectedIsToday
                ? "Seu plano está pronto para começar"
                : isFuture
                    ? "Treino planejado para este dia"
                    : "Você não registrou este treino"

    function handleStart(e: React.MouseEvent) {
        e.stopPropagation()
        if (pendingPlan?.workout_id) {
            navigate(`/treino/iniciar/${pendingPlan.workout_id}`)
        }
    }

    return (
        <div className="h-full w-full sm:px-0 px-5 py-5 flex flex-col gap-6">
            {/* Faixa da semana */}
            <div className="bg-neutral-900/60 border border-white/5 rounded-2xl px-2 py-3 grid grid-cols-7 gap-1">
                {weekDates.map((date, idx) => {
                    const active = toDateStr(date) === selectedStr
                    const today = isToday(date)
                    const { hasWorkouts, allDone } = getDayStatus(date)

                    return (
                        <button
                            key={idx}
                            onClick={() => setSelectedStr(toDateStr(date))}
                            className={`flex flex-col items-center gap-1 py-1 rounded-full transition-all duration-200
                                ${active
                                    ? "bg-linear-to-b from-amber-600 to-amber-500 text-neutral-900 shadow-lg shadow-orange-500/20"
                                    : "text-gray-500 hover:bg-white/5"
                                }`}
                        >
                            <span className="text-[10px] font-medium uppercase">{DAY_INITIALS[date.getDay()]}</span>
                            <span
                                className={`text-sm font-bold
                                    ${active ? "" : today ? "text-amber-500" : "text-gray-300"}`}
                            >
                                {date.getDate()}
                            </span>
                            <span
                                className={`w-1 h-1 rounded-full
                                    ${allDone
                                        ? "bg-green-400"
                                        : hasWorkouts
                                            ? active ? "bg-neutral-900/70" : "bg-orange-400/70"
                                            : "bg-transparent"
                                    }`}
                            />
                        </button>
                    )
                })}
            </div>

            {/* Card do dia selecionado */}
            {loading ? (
                <div className="h-44 rounded-3xl bg-neutral-900/70 animate-pulse" />
            ) : (
                <div
                    onClick={() => navigate("/planejar-semana")}
                    className="relative overflow-hidden rounded-3xl p-5 cursor-pointer
                               bg-linear-to-br from-orange-300 via-orange-300 to-amber-200
                               shadow-xl shadow-orange-500/10 active:scale-[0.99] transition-transform"
                >
                    <div className="pointer-events-none absolute -right-16 -bottom-16 w-56 h-56 rounded-full border border-white/30" />
                    <div className="pointer-events-none absolute -right-8 -bottom-8 w-40 h-40 rounded-full border border-white/30" />
                    <div className="pointer-events-none absolute right-2 bottom-2 w-24 h-24 rounded-full border border-white/30" />

                    <div className="relative flex items-center justify-between">
                        <span className="text-[10px] tracking-[0.18em] font-semibold text-neutral-800/70 uppercase">
                            {heroLabel}
                        </span>
                        {selected.hasWorkouts && (
                            <span className="text-[10px] font-semibold text-neutral-800/80 bg-white/40 backdrop-blur px-2.5 py-1 rounded-full">
                                {heroBadge}
                            </span>
                        )}
                    </div>

                    <div className="relative mt-5">
                        <h2 className="text-neutral-900 font-bold text-3xl leading-tight">{heroItem.title}</h2>
                        {heroItem.subtitle && (
                            <p className="text-neutral-800/70 text-xs mt-1">{heroItem.subtitle}</p>
                        )}
                        {heroExtras.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {heroExtras.map((item, i) => (
                                    <span
                                        key={i}
                                        className="text-[11px] font-medium text-neutral-800 bg-white/40 px-2.5 py-1 rounded-full"
                                    >
                                        {item.title}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative mt-6 flex items-end justify-between">
                        <p className="text-neutral-800/70 text-xs">{heroFooter}</p>

                        {canStart && (
                            <button
                                onClick={handleStart}
                                aria-label="Iniciar treino"
                                className="w-11 h-11 rounded-full bg-neutral-900 text-orange-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                            >
                                <FiPlay size={18} className="ml-0.5" />
                            </button>
                        )}
                        {selected.allDone && (
                            <IoMdCheckmarkCircleOutline size={28} className="text-neutral-900" />
                        )}
                    </div>
                </div>
            )}

            {!loading && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-orange-300">
                            <LuFlame size={16} />
                            <span className="text-xs text-gray-400">dias seguidos</span>
                        </div>
                        <p className="text-white font-bold text-2xl">{stats?.streak ?? 0}</p>
                        <p className="text-gray-500 text-xs">sequência atual</p>
                    </div>

                    <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-orange-300">
                            <LuClock4 size={16} />
                            <span className="text-xs text-gray-400">esta semana</span>
                        </div>
                        <p className="text-white font-bold text-2xl">{stats?.weekHours ?? 0}h</p>
                        <p className="text-gray-500 text-xs">treinadas</p>
                    </div>
                </div>
            )}

            {!loading && stats?.lastPr && (
                <div
                    onClick={() => navigate("/prs")}
                    className="bg-orange-300/10 border border-orange-300/25 rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-orange-300/50 transition-all duration-200"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-300/15 flex items-center justify-center shrink-0">
                            <GoTrophy size={18} className="text-orange-300" />
                        </div>
                        <div>
                            <p className="text-[10px] text-orange-300/80 font-semibold uppercase tracking-[0.15em]">Novo PR</p>
                            <p className="text-white font-semibold text-sm">
                                {stats.lastPr.exercise_name}: {stats.lastPr.weight}kg × {stats.lastPr.reps} reps
                            </p>
                        </div>
                    </div>
                    <FiChevronRight size={18} className="text-orange-300/60" />
                </div>
            )}

            <section>
                <div className="flex items-end justify-between mb-3">
                    <div>
                        <p className="text-[10px] tracking-[0.18em] font-semibold text-orange-400 uppercase">Plano da semana</p>
                        <p className="text-white font-bold text-xl">Visão semanal</p>
                    </div>
                    <span className="text-gray-500 text-xs capitalize">
                        {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </span>
                </div>

                <div className="relative flex flex-col gap-2.5">
                    {weekDates.map((date, idx) => {
                        const { plans, hasWorkouts, allDone } = getDayStatus(date)
                        const active = isToday(date)
                        const dow = date.getDay()
                        const items = getDayItems(plans)
                        const noPlans = plans.length === 0

                        return (
                            <div
                                key={idx}
                                onClick={() => navigate("/planejar-semana")}
                                className={`relative w-full rounded-2xl px-3 py-3 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 border
                                    ${active
                                        ? "bg-orange-300/10 border-orange-300/30"
                                        : "bg-neutral-900/60 border-white/5 hover:border-white/15"
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className={`relative z-10 w-9 h-9 rounded-full shrink-0 flex flex-col items-center justify-center leading-none
                                            ${allDone
                                                ? "bg-green-500/15 text-green-400"
                                                : active
                                                    ? "bg-linear-to-b from-orange-300 to-orange-400 text-neutral-900"
                                                    : "bg-neutral-800 text-gray-400"
                                            }`}
                                    >
                                        <span className="text-[9px] font-semibold uppercase">{DAY_LABELS[dow]}</span>
                                        <span className="text-xs font-bold">{date.getDate()}</span>
                                    </div>

                                    <div className="flex flex-col gap-1.5 min-w-0">
                                        {items.map((item, index) => (
                                            <div key={index} className="flex flex-col min-w-0">
                                                <p className={`text-sm font-semibold truncate ${noPlans ? "text-gray-600" : "text-white"}`}>
                                                    {item.title}
                                                </p>
                                                {item.subtitle && (
                                                    <p className="text-gray-500 text-xs truncate">{item.subtitle}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    {hasWorkouts && allDone ? (
                                        <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                                            <IoMdCheckmarkCircleOutline size={18} />
                                            Concluído
                                        </span>
                                    ) : active && hasWorkouts ? (
                                        <span className="text-xs text-orange-300 font-medium flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-300 inline-block animate-pulse" />
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
            </section>
        </div>
    )
}

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../../api/api"
import { FiPlus, FiTrash2 } from "react-icons/fi"
import { LuDumbbell } from "react-icons/lu"
import { FaArrowLeftLong } from "react-icons/fa6"

interface Workout {
    id: string
    name: string
}

interface WeeklyPlan {
    id: string
    day_of_week: number
    note: string | null
    type: "REST" | "CARDIO" | "WORKOUT"
    workout_id: string | null
    workout: { id: string; name: string } | null
}

interface DayState {
    dow: number
    label: string
    plans: WeeklyPlan[]
}

const DAY_LABELS_FULL = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]
const CARDIO_VALUE = "cardio"

function planToSelectValue(plan: WeeklyPlan): string {
    switch (plan.type) {
        case "REST":
            return ""
        case "CARDIO":
            return CARDIO_VALUE
        case "WORKOUT":
            return plan.workout_id ?? ""
    }
}

export function WeeklyPlanner() {
    const navigate = useNavigate()

    const [workouts, setWorkouts] = useState<Workout[]>([])
    const [days, setDays] = useState<DayState[]>(
        WEEK_ORDER.map(dow => ({ dow, label: DAY_LABELS_FULL[dow], plans: [] }))
    )
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAll()
    }, [])

    async function fetchAll() {
        try {
            const [workoutsRes, plansRes] = await Promise.all([
                api.get<Workout[]>("/workout"),
                api.get<WeeklyPlan[]>("/weekly_plan"),
            ])
            setWorkouts(workoutsRes.data)
            setDays(WEEK_ORDER.map(dow => ({
                dow,
                label: DAY_LABELS_FULL[dow],
                plans: plansRes.data.filter(p => p.day_of_week === dow)
            })))
        } catch (err: any) {
            console.error(err.response?.data)
        } finally {
            setLoading(false)
        }
    }

    function addSlot(dowIdx: number) {
        setDays(prev =>
            prev.map((day, i) =>
                i !== dowIdx
                    ? day
                    : {
                        ...day,
                        plans: [
                            ...day.plans,
                            {
                                id: `new_${Date.now()}_${Math.random()}`,
                                day_of_week: day.dow,
                                note: null,
                                type: "REST",
                                workout_id: null,
                                workout: null,
                            }
                        ]
                    }
            )
        )
    }

    function updatePlanWorkout(
        dowIdx: number,
        planIdx: number,
        value: string
    ) {
        const workoutObj = workouts.find(w => w.id === value) ?? null

        setDays(prev =>
            prev.map((day, i) =>
                i !== dowIdx
                    ? day
                    : {
                        ...day,
                        plans: day.plans.map((p, j) => {

                            if (j !== planIdx) return p

                            if (value === "") {
                                return {
                                    ...p,
                                    type: "REST",
                                    workout_id: null,
                                    workout: null,
                                }
                            }

                            if (value === CARDIO_VALUE) {
                                return {
                                    ...p,
                                    type: "CARDIO",
                                    workout_id: null,
                                    workout: null,
                                }
                            }

                            return {
                                ...p,
                                type: "WORKOUT",
                                workout_id: value,
                                workout: workoutObj,
                            }
                        })
                    }
            )
        )
    }

    function updatePlanNote(dowIdx: number, planIdx: number, note: string) {
        setDays(prev => prev.map((day, i) =>
            i !== dowIdx ? day : {
                ...day,
                plans: day.plans.map((p, j) =>
                    j !== planIdx ? p : { ...p, note: note || null }
                )
            }
        ))
    }

    async function removeSlot(dowIdx: number, planIdx: number) {
        const plan = days[dowIdx].plans[planIdx]

        if (!plan.id.startsWith("new_")) {
            try {
                await api.delete(`/weekly_plan/${plan.id}`)
            } catch (err: any) {
                console.error(err.response?.data)
                alert("Erro ao remover.")
                return
            }
        }

        setDays(prev => prev.map((day, i) =>
            i !== dowIdx ? day : {
                ...day,
                plans: day.plans.filter((_, j) => j !== planIdx)
            }
        ))
    }

    async function handleSave() {
        setSaving(true)
        try {
            const promises: Promise<any>[] = []

            for (const day of days) {
                for (const plan of day.plans) {
                    const isNew = plan.id.startsWith("new_")
                    const body = {
                        day_of_week: day.dow,
                        type: plan.type,
                        workout_id: plan.workout_id,
                        note: plan.note,
                    }

                    if (isNew) {
                        promises.push(api.post("/weekly_plan", body))
                    } else {
                        promises.push(api.put(`/weekly_plan/${plan.id}`, {
                            type: plan.type,
                            workout_id: plan.workout_id,
                            note: plan.note,
                        }))
                    }
                }
            }

            await Promise.all(promises)
            navigate("/")
        } catch (err: any) {
            console.error(err.response?.data)
            alert("Erro ao salvar planejamento.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <header className="w-full h-22 border-b border-gray-800/60 bg-black/50 text-white max-w-2xl mx-auto flex items-center gap-4 sm:px-0 px-10">
                <Link to="/" className="transition-all duration-200 hover:scale-110">
                    <FaArrowLeftLong size={22} className="text-gray-500 mt-1" />
                </Link>
                <p className="font-bold text-2xl">Planejar Semana</p>
            </header>

            <div className="h-full w-full sm:px-0 px-6 py-5 flex flex-col gap-4">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <p className="text-gray-400 text-sm">Carregando...</p>
                    </div>
                ) : (
                    days.map((day, dowIdx) => (
                        <div
                            key={day.dow}
                            className="bg-neutral-950/70 border border-gray-800/60 rounded-xl p-4 flex flex-col gap-3"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-white font-semibold text-sm uppercase tracking-wider">
                                    {day.label}
                                </p>
                                <button
                                    onClick={() => addSlot(dowIdx)}
                                    className="flex items-center gap-1 text-amber-500 hover:text-amber-400 transition-colors text-xs font-medium cursor-pointer"
                                >
                                    <FiPlus size={14} />
                                    Adicionar
                                </button>
                            </div>

                            {day.plans.length === 0 ? (
                                <p className="text-gray-600 text-sm text-center py-1">
                                    Nenhum treino — clique em Adicionar
                                </p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {day.plans.map((plan, planIdx) => (
                                        <div key={plan.id} className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 relative">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600 pointer-events-none">
                                                        <LuDumbbell size={15} />
                                                    </div>
                                                    <select
                                                        value={planToSelectValue(plan)}
                                                        onChange={(e) => updatePlanWorkout(dowIdx, planIdx, e.target.value)}
                                                        className="w-full bg-neutral-950/70 border border-gray-800/60 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-transparent cursor-pointer appearance-none"
                                                    >
                                                        <option value="">Descanso</option>
                                                        <option value={CARDIO_VALUE}>Cardio</option>
                                                        {workouts.map(w => (
                                                            <option key={w.id} value={w.id}>{w.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => removeSlot(dowIdx, planIdx)}
                                                    className="text-gray-600 hover:text-red-500 transition-colors cursor-pointer p-2 shrink-0"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Adicionar foco ou observação..."
                                                value={plan.note ?? ""}
                                                onChange={(e) => updatePlanNote(dowIdx, planIdx, e.target.value)}
                                                className="w-full bg-neutral-950/70 border border-gray-800/60 rounded-xl px-4 py-2 text-xs text-gray-400 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-transparent focus:text-white"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}

                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="w-full bg-amber-600 transition-all duration-200 shadow-lg shadow-amber-600/40 hover:bg-amber-500 hover:scale-105 text-black font-bold text-lg rounded-2xl py-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {saving ? "Salvando..." : "Salvar Planejamento"}
                </button>
            </div>


        </>
    )
}

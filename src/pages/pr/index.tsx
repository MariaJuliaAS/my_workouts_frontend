import { useEffect, useState } from "react"
import { GoTrophy } from "react-icons/go"
import { LuTrash } from "react-icons/lu"
import { FiPlus, FiX } from "react-icons/fi"
import { api } from "../../api/api"

interface PR {
    id: string
    exercise_name: string
    weight: number
    reps: number
    note?: string | null
    date: string
}

interface CreatePrForm {
    exercise_name: string
    weight: string
    reps: string
    note: string
}

const emptyForm: CreatePrForm = {
    exercise_name: "",
    weight: "",
    reps: "",
    note: "",
}

interface AddPrModalProps {
    onClose: () => void
    onSave: (form: CreatePrForm) => Promise<void>
    saving: boolean
}

function AddPrModal({ onClose, onSave, saving }: AddPrModalProps) {
    const [form, setForm] = useState<CreatePrForm>(emptyForm)

    function update(field: keyof CreatePrForm, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    async function handleSubmit() {
        if (!form.exercise_name || !form.weight || !form.reps) {
            alert("Preencha nome, peso e repetições.")
            return
        }
        await onSave(form)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-8 sm:pb-0">
            <div className="w-full max-w-sm bg-neutral-900 border border-gray-800/60 rounded-2xl p-6 flex flex-col gap-5">

                <div className="flex items-center justify-between">
                    <p className="font-bold text-lg text-white">Novo PR</p>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer p-1"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">Exercício</label>
                        <input
                            type="text"
                            placeholder="Ex: Supino reto, Agachamento..."
                            value={form.exercise_name}
                            onChange={(e) => update("exercise_name", e.target.value)}
                            className="w-full bg-neutral-950/70 border border-gray-800/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-300">Peso (kg)</label>
                            <input
                                type="number"
                                inputMode="decimal"
                                placeholder="0"
                                value={form.weight}
                                onChange={(e) => update("weight", e.target.value)}
                                className="w-full bg-neutral-950/70 border border-gray-800/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-center"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-300">Repetições</label>
                            <input
                                type="number"
                                inputMode="numeric"
                                placeholder="0"
                                value={form.reps}
                                onChange={(e) => update("reps", e.target.value)}
                                className="w-full bg-neutral-950/70 border border-gray-800/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-center"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">
                            Observação <span className="text-gray-600 font-normal">(opcional)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Com pausa, raw..."
                            value={form.note}
                            onChange={(e) => update("note", e.target.value)}
                            className="w-full bg-neutral-950/70 border border-gray-800/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full bg-amber-600 hover:bg-amber-500 active:scale-[0.98] disabled:opacity-60 transition-all duration-200 shadow-lg shadow-amber-600/30 text-black font-bold text-base rounded-xl py-3 cursor-pointer"
                    >
                        {saving ? "Salvando..." : "Salvar PR"}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="w-full bg-transparent hover:bg-gray-800/60 transition-all duration-200 text-gray-400 font-medium text-base rounded-xl py-3 border border-gray-800/60 cursor-pointer"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}

export function PRs() {
    const [prs, setPrs] = useState<PR[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchPrs()
    }, [])

    async function fetchPrs() {
        try {
            const res = await api.get<PR[]>("/personal_record")
            setPrs(res.data)
        } catch (err: any) {
            console.error(err.response?.data)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave(form: CreatePrForm) {
        setSaving(true)
        try {
            const res = await api.post<PR>("/personal_record", {
                exercise_name: form.exercise_name,
                weight: parseFloat(form.weight),
                reps: parseInt(form.reps),
                note: form.note || undefined,
            })
            setPrs((prev) => [res.data, ...prev])
            setShowModal(false)
        } catch (err: any) {
            console.error(err.response?.data)
            alert("Erro ao salvar PR.")
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(pr_id: string) {
        if (!confirm("Deletar este PR?")) return
        try {
            await api.delete(`/personal_record/${pr_id}`)
            setPrs((prev) => prev.filter((p) => p.id !== pr_id))
        } catch (err: any) {
            console.error(err.response?.data)
            alert("Erro ao deletar PR.")
        }
    }

    return (
        <>
            {showModal && (
                <AddPrModal
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    saving={saving}
                />
            )}

            <div className="h-full w-full sm:px-0 px-10 py-5">

                {prs.length > 0 && (
                    <header className="text-white flex flex-row justify-between mb-6">
                        <div>
                            <p className="font-medium text-lg sm:text-xl">Meus PRs</p>
                            <p className="text-gray-400 text-sm">{prs.length} registro{prs.length !== 1 ? "s" : ""}</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 active:scale-95 transition-all duration-200 shadow-lg shadow-amber-600/30 text-black font-semibold text-sm px-4 h-10 rounded-xl cursor-pointer"
                        >
                            <FiPlus size={16} />
                            Adicionar
                        </button>
                    </header>
                )}

                <main className="w-full text-white flex justify-center h-full">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <p className="text-gray-400 text-sm">Carregando...</p>
                        </div>
                    ) : prs.length === 0 ? (
                        /* Estado vazio */
                        <div className="flex items-center justify-center flex-col py-10">
                            <GoTrophy size={58} className="text-gray-400 mb-4" />
                            <p className="font-medium text-base sm:text-xl">Nenhum PR ainda</p>
                            <p className="text-gray-400 max-w-68 text-center sm:text-base text-sm">
                                Adicione seu primeiro PR e comece a acompanhar seu progresso
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="sm:text-base text-sm bg-amber-600 px-4 h-10 rounded-lg flex items-center text-black cursor-pointer font-semibold mt-6 transition-all duration-200 shadow-lg shadow-amber-600/40 hover:bg-amber-500 hover:scale-105"
                            >
                                Adicione seu primeiro PR
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col w-full gap-3">
                            {prs.map((pr) => (
                                <div
                                    key={pr.id}
                                    className="w-full bg-neutral-950/70 border border-gray-800/60 hover:border-amber-600/40 rounded-xl flex items-center justify-between px-4 py-3 transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-amber-600 bg-amber-600/20 flex items-center justify-center h-12 w-12 rounded-xl shrink-0">
                                            <GoTrophy size={22} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-base">{pr.exercise_name}</p>
                                            <p className="text-amber-500 text-sm font-semibold mt-0.5">
                                                {pr.weight} kg × {pr.reps} reps
                                            </p>
                                            {pr.note && (
                                                <p className="text-gray-500 text-xs mt-0.5">{pr.note}</p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(pr.id)}
                                        className="text-gray-600 hover:text-red-500 transition-colors duration-200 p-2 cursor-pointer"
                                    >
                                        <LuTrash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    )
}

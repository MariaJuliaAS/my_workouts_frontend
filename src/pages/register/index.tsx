import { useState } from "react";
import { LuDumbbell } from "react-icons/lu";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { api } from "../../api/api";

export function Register() {
    const [form, setForm] = useState({ name: "", username: "", password: "" });
    const navigate = useNavigate();

    const token = localStorage.getItem("token_my_workouts");
    if (token) {
        return <Navigate to="/" />
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (!form.name || !form.username || !form.password) {
                alert("Preencha todos os campos")
                return;
            }

            await api.post("/user", form)
            alert("Conta criada com sucesso!")
            navigate("/login");
        } catch (err: any) {
            alert("Erro ao criar conta")
            console.error(err);
        }
    }

    return (
        <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center px-10">
            <div className="w-full max-w-sm flex flex-col gap-8">

                <div className="flex flex-col items-center gap-3">
                    <div className="text-amber-600 bg-amber-600/20 flex items-center justify-center h-16 w-16 rounded-2xl">
                        <LuDumbbell size={32} />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-bold text-2xl">Criar conta</p>
                        <span className="text-gray-400 text-sm">Comece a acompanhar seus treinos</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-gray-400 text-sm font-medium">Nome</label>
                        <input
                            type="text"
                            placeholder="Seu nome"
                            value={form.name}
                            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-neutral-950/70 border border-gray-800/60 focus:border-amber-600/60 text-white rounded-lg px-4 h-11 outline-none transition-colors duration-200 placeholder:text-gray-600"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-gray-400 text-sm font-medium">Username</label>
                        <input
                            type="text"
                            placeholder="seu_usuario"
                            value={form.username}
                            onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
                            className="bg-neutral-950/70 border border-gray-800/60 focus:border-amber-600/60 text-white rounded-lg px-4 h-11 outline-none transition-colors duration-200 placeholder:text-gray-600"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-gray-400 text-sm font-medium">Senha</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                            className="bg-neutral-950/70 border border-gray-800/60 focus:border-amber-600/60 text-white rounded-lg px-4 h-11 outline-none transition-colors duration-200 placeholder:text-gray-600"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-amber-600 h-11 rounded-lg text-black font-semibold mt-2 transition-all duration-200 shadow-lg shadow-amber-600/40 hover:bg-amber-500 hover:scale-[1.02] cursor-pointer"
                    >
                        Criar conta
                    </button>
                </form>

                <p className="text-gray-400 text-sm text-center">
                    Já tem uma conta?{" "}
                    <NavLink to="/login" className="text-amber-600 hover:text-amber-500 font-medium transition-colors duration-150">
                        Entrar
                    </NavLink>
                </p>
            </div>
        </div>
    );
}
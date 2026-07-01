import { GoTrophy } from "react-icons/go"
import { NavLink } from "react-router-dom"




export function PRs() {
    const pr: { nome: string; tam: number }[] = [];

    return (
        <div className="h-full w-full  sm:px-0 px-10 py-5">
            <main className="w-full text-white flex justify-center h-full">
                {pr.length === 0 ? (
                    <div className="flex items-center justify-center flex-col py-10">
                        <GoTrophy size={58} className="text-gray-400 mb-4" />
                        <p className="font-medium text-base sm:text-xl">Nenhum PR ainda</p>
                        <p className="text-gray-400 max-w-68 text-center sm:text-base text-sm">Adicione seu primeiro PR e comece a acompanhar seu progresso</p>
                        <NavLink to="/pr/novo"
                            className="sm:text-base text-sm bg-amber-600 px-4 h-10 rounded-lg flex items-center text-black cursor-pointer font-semibold mt-6 transition-all duration-200 shadow-lg shadow-amber-600/40 hover:bg-amber-500 hover:scale-105">
                            Adicione seu primeiro PR
                        </NavLink>
                    </div>
                ) : (
                    <div className="flex items-center flex-col w-full overflow-y-auto gap-4">
                        {pr.map((p) => (
                            <div className="w-full bg-neutral-950/70 border hover:border-amber-600/40 border-gray-800/60 cursor-pointer rounded-lg flex items-center justify-between px-4 py-3 group">
                                <p>seus prs aparecerão aqui</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
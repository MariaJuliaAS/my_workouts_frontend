import { LuDumbbell, LuPencil, LuTrash } from "react-icons/lu";
import { RiArrowRightSLine } from "react-icons/ri";
import { NavLink } from "react-router-dom";


export function Home() {
    const treino: { nome: string; tam: number }[] = [];

    return (
        <div className="h-full w-full  sm:px-0 px-10 py-5">
            {treino.length > 0 && (
                <header className="text-white flex flex-row justify-between mb-8">
                    <p className="font-medium text-lg sm:text-xl">Meus treinos</p>
                    <span className="text-gray-400">{treino.length} treinos</span>
                </header>
            )}

            <main className="w-full text-white flex justify-center h-full">
                {treino.length === 0 ? (
                    <div className="flex items-center justify-center flex-col">
                        <LuDumbbell size={58} className="text-gray-400 mb-4" />
                        <p className="font-medium text-lg sm:text-xl">Nenhum treino ainda</p>
                        <p className="text-gray-400 max-w-68 text-center">Crie seu primeiro treino e comece a acompanhar seu progresso</p>
                        <NavLink to="/treino/novo"
                            className="bg-amber-600 px-4 h-10 rounded-lg flex items-center text-black cursor-pointer font-semibold mt-6 transition-all duration-200 shadow-lg shadow-amber-600/40 hover:bg-amber-500 hover:scale-105">
                            Crie seu primeiro treino
                        </NavLink>
                    </div>
                ) : (
                    <div className="flex items-center flex-col w-full overflow-y-auto gap-4">
                        {treino.map((t) => (
                            <div className="w-full bg-neutral-950/70 border hover:border-amber-600/40 border-gray-800/60 cursor-pointer rounded-lg flex items-center justify-between px-4 py-3 group">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="text-amber-600 bg-amber-600/30 flex items-center justify-center h-12 w-12 rounded-xl">
                                        <LuDumbbell size={24} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-lg">{t.nome}</p>
                                        <span className="text-gray-400">{t.tam} Exercícios</span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <button className="text-gray-400 transition-all duration-150 group-hover:hidden p-2">
                                        <RiArrowRightSLine size={24} />
                                    </button>
                                    <div className="hidden items-center gap-2 group-hover:flex">
                                        <button className="cursor-pointer transition-all duration-200 hover:scale-105 p-2">
                                            <LuPencil size={20} className="text-gray-400" />
                                        </button>
                                        <button className="cursor-pointer transition-all duration-200 hover:scale-105 p-2">
                                            <LuTrash size={20} className="text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
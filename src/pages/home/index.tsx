import { LuDumbbell } from "react-icons/lu";


export function Home() {
    return (
        <div className="h-full w-full sm:px-0 px-10 py-5">
            <header className="text-white flex flex-row justify-between">
                <p className="font-medium text-lg sm:text-xl">Meus treinos</p>
                <span className="text-gray-400">x treinos</span>
            </header>

            <main className="w-full text-white flex items-center justify-center h-full">
                <div className="flex items-center flex-col">
                    <LuDumbbell size={58} className="text-gray-400 mb-4" />
                    <p className="font-medium text-lg sm:text-xl">Nenhum treino ainda</p>
                    <p className="text-gray-400 max-w-68 text-center">Crie seu primeiro treino e comece a acompanhar seu progresso</p>
                    <button className="bg-amber-600 px-4 h-10 rounded-lg text-black cursor-pointer font-semibold mt-6 transition-all duration-200 shadow-lg shadow-amber-600/40 hover:bg-amber-500 hover:scale-105">
                        Crie seu primeiro treino
                    </button>
                </div>
            </main>
        </div>
    )
}
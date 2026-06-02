import { FaPlus } from "react-icons/fa";

export function Header() {
    return (
        <div className="w-full h-22 border-b border-gray-800/60">
            <nav className="w-full h-22 bg-black/50 text-white max-w-2xl mx-auto flex items-center justify-between sm:px-0 px-10" >
                <div>
                    <p className="font-bold text-2xl">Treinos</p>
                    <span className="text-gray-400">Gerencie seus treinos</span>
                </div>
                <button className="bg-amber-600 sm:h-12 sm:w-12 h-10 w-10 flex justify-center items-center rounded-full text-black cursor-pointer font-semibold transition-all duration-200 shadow-lg shadow-amber-600/40 hover:bg-amber-500 hover:scale-105">
                    <FaPlus className="sm:text-xl text-lg" />
                </button>
            </nav>
        </div>
    )
}
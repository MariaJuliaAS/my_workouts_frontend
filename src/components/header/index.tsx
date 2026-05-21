import { FaPlus } from "react-icons/fa";

export function Header() {
    return (
        <div className="w-full h-22 border-b border-gray-800/60">
            <nav className="w-full h-22 bg-black/50 text-white max-w-2xl mx-auto flex items-center justify-between sm:px-0 px-10" >
                <div>
                    <p className="font-bold text-2xl">Treinos</p>
                    <span className="text-gray-400">Gerencie seus treinos</span>
                </div>
                <button>
                    <FaPlus size={18} />
                </button>
            </nav>
        </div>
    )
}
import { useState } from "react";
import { GoTrophy } from "react-icons/go";
import { LuClipboardList } from "react-icons/lu";
import { LuDumbbell } from "react-icons/lu";

export function Nav() {
    const [active, setActive] = useState<String>("treinos");

    return (
        <nav className="w-full h-22 bg-black/50 text-white max-w-2xl mx-auto flex items-center justify-between px-10" >
            <button
                onClick={() => setActive("treinos")}
                className={active === "treinos" ? "text-amber-600 bg-amber-600/30 h-18 w-20 gap-2 rounded-xl flex items-center justify-center flex-col cursor-pointer transition-colors duration-200" : "text-gray-400 hover:text-amber-600 hover:bg-amber-600/30 h-18 w-20 gap-2 rounded-xl flex items-center justify-center flex-col cursor-pointer transition-colors duration-200"}>
                <LuDumbbell size={24} className="" />
                <p className="text-sm font-medium">Treinos</p>
            </button>
            <button
                onClick={() => setActive("treinar")}
                className={active === "treinar" ? "text-amber-600 bg-amber-600/30 h-18 w-20 gap-2 rounded-xl flex items-center justify-center flex-col cursor-pointer transition-colors duration-200" : "text-gray-400 hover:text-amber-600 hover:bg-amber-600/30 h-18 w-20 gap-2 rounded-xl flex items-center justify-center flex-col cursor-pointer transition-colors duration-200"}>
                <LuClipboardList size={24} className="" />
                <p className="text-sm font-medium">Treinar</p>
            </button>
            <button
                onClick={() => setActive("prs")}
                className={active === "prs" ? "text-amber-600 bg-amber-600/30 h-18 w-20 gap-2 rounded-xl flex items-center justify-center flex-col cursor-pointer transition-colors duration-200" : "text-gray-400 hover:text-amber-600 hover:bg-amber-600/30 h-18 w-20 gap-2 rounded-xl flex items-center justify-center flex-col cursor-pointer transition-colors duration-200"}>
                <GoTrophy size={24} className="" />
                <p className="text-sm font-medium">PRs</p>
            </button>
        </nav>
    )
}
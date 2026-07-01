import { BiRun } from "react-icons/bi";
import { GoTrophy } from "react-icons/go";
import { LuDumbbell, LuHistory } from "react-icons/lu";
import { NavLink } from "react-router-dom";

function itemClass(isActive: boolean) {
    return isActive ? "text-amber-600 bg-amber-600/30 h-18 w-20 gap-2 rounded-xl flex items-center justify-center flex-col cursor-pointer transition-colors duration-200" : "text-gray-400 hover:text-amber-600 hover:bg-amber-600/30 h-18 w-20 gap-2 rounded-xl flex items-center justify-center flex-col cursor-pointer transition-colors duration-200"
}

export function Nav() {
    return (
        <div className="w-full h-22 border-t border-gray-800/60">
            <nav className="w-full h-22  text-white max-w-2xl mx-auto flex items-center justify-between sm:px-0 px-5" >
                <NavLink to="/" className={({ isActive }) => itemClass(isActive)}>
                    <LuDumbbell size={24} className="" />
                    <p className="text-sm font-medium">Treinos</p>
                </NavLink>
                <NavLink to="/historico" className={({ isActive }) => itemClass(isActive)}>
                    <LuHistory size={24} className="" />
                    <p className="text-sm font-medium">Histórico</p>
                </NavLink>
                <NavLink to="/corrida" className={({ isActive }) => itemClass(isActive)}>
                    <BiRun size={24} className="" />
                    <p className="text-sm font-medium">Corrida</p>
                </NavLink>
                <NavLink to="/prs" className={({ isActive }) => itemClass(isActive)}>
                    <GoTrophy size={24} className="" />
                    <p className="text-sm font-medium">PRs</p>
                </NavLink>
            </nav>
        </div>
    )
}
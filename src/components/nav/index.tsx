import { GoTrophy } from "react-icons/go";
import { LuDumbbell, LuHistory } from "react-icons/lu";
import { MdDashboard } from "react-icons/md";
import { NavLink } from "react-router-dom";

function itemClass(isActive: boolean) {
    return `flex items-center justify-center cursor-pointer rounded-full px-5 py-2 transition-all duration-300 ${isActive
        ? "bg-amber-600/10 text-amber-500 shadow-inner shadow-white/5"
        : "text-gray-400 hover:text-amber-500"
        }`;
}

export function Nav() {
    return (
        <div className="fixed inset-x-0 bottom-0 z-50 m-auto mb-6 w-full max-w-11/12 overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-lg shadow-black/30 backdrop-blur-xl md:max-w-2xl">
            <nav className="relative mx-auto flex h-14 w-full max-w-11/12 items-center justify-between px-5 text-white sm:px-0">
                <NavLink to="/" className={({ isActive }) => itemClass(isActive)}>
                    <MdDashboard size={24} />
                </NavLink>
                <NavLink to="/treinos" className={({ isActive }) => itemClass(isActive)}>
                    <LuDumbbell size={24} />
                </NavLink>
                <NavLink to="/historico" className={({ isActive }) => itemClass(isActive)}>
                    <LuHistory size={24} />
                </NavLink>
                <NavLink to="/prs" className={({ isActive }) => itemClass(isActive)}>
                    <GoTrophy size={24} />
                </NavLink>
            </nav>
        </div>
    );
}
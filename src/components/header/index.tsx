import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { FiUser } from "react-icons/fi";
import { IoLogOutOutline } from "react-icons/io5";
import { getUser } from "../../util/getUser";

interface HeaderAction {
    to: string;
    label: string;
    icon: ReactNode;
}

interface HeaderProps {
    title: string;
    subtitle: string;
    action?: HeaderAction;
}

export function Header({ title, subtitle, action }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const user = getUser();
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleLogout() {
        localStorage.removeItem("token_my_workouts");
        setMenuOpen(false);
        navigate("/login");
    }

    return (
        <div className="w-full h-22 border-b border-gray-800/60">
            <nav className="w-full h-22 text-white max-w-2xl mx-auto flex items-center justify-between sm:px-0 px-10">
                <div>
                    <p className="font-bold sm:text-2xl text-xl">{title}</p>
                    <span className="text-gray-400 sm:text-base text-sm">{subtitle}</span>
                </div>

                <div className="flex flex-row gap-4">
                    {action ? (
                        <Link
                            to={action.to}
                            aria-label={action.label}
                            title={action.label}
                            className="bg-amber-600 sm:h-12 sm:w-12 h-10 w-10 flex justify-center items-center rounded-full text-black cursor-pointer font-semibold transition-all duration-200 shadow-lg shadow-amber-600/40 hover:bg-amber-500 hover:scale-105"
                        >
                            {action.icon}
                        </Link>
                    ) : null}

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(prev => !prev)}
                            className="bg-amber-600/30 sm:h-12 sm:w-12 h-10 w-10 flex justify-center items-center rounded-full cursor-pointer font-semibold transition-all duration-200 text-lg text-amber-400 hover:bg-amber-600/50"
                        >
                            {user?.name.charAt(0)}
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-14 w-56 bg-gray-950 border border-gray-700/60 rounded-2xl shadow-xl shadow-black/40 p-3 z-50 flex flex-col gap-1">
                                <div className="flex items-center gap-3 px-2 py-2">
                                    <div className="bg-amber-600/20 h-9 w-9 flex items-center justify-center rounded-full text-amber-400 shrink-0">
                                        <FiUser size={18} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-white font-semibold text-sm truncate">
                                            {user?.name}
                                        </span>
                                        <span className="text-gray-400 text-xs truncate">
                                            {user?.username}
                                        </span>
                                    </div>
                                </div>

                                <hr className="border-gray-700/60 my-1" />

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-2 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors duration-150 cursor-pointer w-full text-left"
                                >
                                    <IoLogOutOutline size={18} />
                                    <span className="text-sm font-medium">Sair</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}
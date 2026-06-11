import { NavLink } from "react-router-dom";




export function Workout() {
    const treinos: { nome: string; tam: number }[] = [];

    return (
        <div className="h-full w-full  sm:px-0 px-10 py-5">
            <main className="w-full text-white flex justify-center h-full">
                {treinos.length === 0 ? (
                    <div className=" mt-16 flex items-center justify-center flex-col gap-4 border border-dashed border-gray-700 rounded-xl w-full max-w-md py-10 max-h-52">
                        <span className="text-gray-400">Nenhum treino cadastrado ainda</span>
                        <NavLink to="/treino/novo"
                            className="bg-amber-600 px-4 h-10 rounded-lg flex items-center text-black cursor-pointer font-semibold transition-all duration-200 shadow-lg shadow-amber-600/40 hover:bg-amber-500 hover:scale-105">
                            Crie seu primeiro treino
                        </NavLink>
                    </div>
                ) : (
                    <div className="flex items-center flex-col w-full overflow-y-auto gap-4">
                        {treinos.map((t) => (
                            <div className="w-full bg-neutral-950/70 border hover:border-amber-600/40 border-gray-800/60 cursor-pointer rounded-lg flex items-center justify-between px-4 py-3 group">
                                <p>seus treinos aparecerão aqui</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
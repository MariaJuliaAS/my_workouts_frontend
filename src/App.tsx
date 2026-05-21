import { Nav } from "./components/nav"

function App() {

  return (
    <div className="w-full bg-black h-screen flex items-center flex-col">
      <main className="max-w-2xl bg-amber-100 w-full h-full">
        <h1>ok</h1>
      </main>
      <div className="w-full h-22 border-t border-gray-800/60">
        <Nav />
      </div>
    </div>
  )
}

export default App

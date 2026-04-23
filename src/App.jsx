import { useEffect, useMemo, useState } from "react"
import Board from "./components/Board"
import { initialAppState } from "./data/initialState"
import { createBoardForUser, getUserBoards, loginOrCreateUser, setActiveBoard } from "./utils/boardState"
import { loadAppState, saveAppState } from "./utils/storage"

function App() {
  const [appState, setAppState] = useState(() => loadAppState() ?? initialAppState)
  const [nameInput, setNameInput] = useState("")
  const [newBoardTitle, setNewBoardTitle] = useState("")

  const currentUser = appState.session.currentUserId
    ? appState.users[appState.session.currentUserId]
    : null

  useEffect(() => {
    saveAppState(appState)
  }, [appState])

  const userBoards = useMemo(() => {
    if (!currentUser) return []
    return getUserBoards(appState, currentUser.id)
  }, [appState, currentUser])

  const activeBoard = appState.session.activeBoardId ? appState.boards[appState.session.activeBoardId] : null

  const handleLogin = (event) => {
    event.preventDefault()
    setAppState((current) => loginOrCreateUser(current, nameInput))
    setNameInput("")
  }

  const handleCreateBoard = (event) => {
    event.preventDefault()
    if (!currentUser) return
    setAppState((current) => createBoardForUser(current, currentUser.id, newBoardTitle))
    setNewBoardTitle("")
  }

  const handleBoardChange = (updater) => {
    if (!activeBoard) return
    setAppState((current) => ({
      ...current,
      boards: {
        ...current.boards,
        [activeBoard.id]: updater(current.boards[activeBoard.id]),
      },
    }))
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-xl font-bold text-slate-800">Kullanici Girisi</h1>
          <p className="mt-1 text-sm text-slate-600">
            Kullanici adini gir. Kayit varsa devam eder, yoksa otomatik olusturulur.
          </p>
          <input
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="Ornek: Melik"
            required
          />
          <button
            type="submit"
            className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Giris Yap
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Kanban / Trello Clone</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Hos geldin, {currentUser.name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Veri modeli: User -&gt; Board -&gt; Column -&gt; Card, order_index tabanli sira.
          </p>

          <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
            <select
              value={appState.session.activeBoardId ?? ""}
              onChange={(event) =>
                setAppState((current) => setActiveBoard(current, event.target.value))
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              {userBoards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.title}
                </option>
              ))}
            </select>

            <form onSubmit={handleCreateBoard} className="flex gap-2">
              <input
                value={newBoardTitle}
                onChange={(event) => setNewBoardTitle(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                placeholder="Yeni board adi"
                required
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-black"
              >
                Board Olustur
              </button>
            </form>
          </div>
        </div>

        {activeBoard ? (
          <Board board={activeBoard} onBoardChange={handleBoardChange} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
            Bu kullanici icin board bulunamadi. Yeni bir board olustur.
          </div>
        )}
      </div>
    </main>
  )
}

export default App

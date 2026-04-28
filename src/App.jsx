import { useEffect, useMemo, useState } from "react"
import Board from "./components/Board"
import { initialAppState } from "./data/initialState"
import {
  canManageBoard,
  createBoardForUser,
  deleteBoardForUser,
  getVisibleBoards,
  loginUser,
  logoutUser,
  renameBoardForUser,
  setActiveBoard,
} from "./utils/boardState"
import { loadAppState, loadAuthUsers, saveAppState, saveAuthUsers } from "./utils/storage"

function App() {
  const [appState, setAppState] = useState(() => loadAppState() ?? initialAppState)
  const [authUsers, setAuthUsers] = useState(() => loadAuthUsers())
  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [loginError, setLoginError] = useState("")
  const [authMode, setAuthMode] = useState("login")
  const [newBoardTitle, setNewBoardTitle] = useState("")
  const [newBoardVisibility, setNewBoardVisibility] = useState("private")
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false)
  const [renameBoardTitle, setRenameBoardTitle] = useState("")

  const currentUser = appState.session.currentUserId
    ? appState.users[appState.session.currentUserId]
    : null

  useEffect(() => {
    saveAppState(appState)
  }, [appState])

  useEffect(() => {
    saveAuthUsers(authUsers)
  }, [authUsers])

  const visibleBoards = useMemo(() => {
    if (!currentUser) return []
    return getVisibleBoards(appState, currentUser.id)
  }, [appState, currentUser])

  const activeBoard = appState.session.activeBoardId ? appState.boards[appState.session.activeBoardId] : null

  const handleLogin = (event) => {
    event.preventDefault()
    const user = authUsers.find(
      (item) =>
        item.email.toLowerCase() === emailInput.trim().toLowerCase() &&
        item.password === passwordInput,
    )

    if (!user) {
      setLoginError("Email or password is incorrect.")
      return
    }

    setAppState((current) => loginUser(current, user))
    setEmailInput("")
    setPasswordInput("")
    setLoginError("")
  }

  const handleSignUp = (event) => {
    event.preventDefault()
    const normalizedEmail = emailInput.trim().toLowerCase()
    if (!nameInput.trim() || !normalizedEmail || !passwordInput) {
      setLoginError("Please fill in all required fields.")
      return
    }
    if (authUsers.some((item) => item.email.toLowerCase() === normalizedEmail)) {
      setLoginError("This email is already registered.")
      return
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: nameInput.trim(),
      email: normalizedEmail,
      password: passwordInput,
    }
    setAuthUsers((current) => [...current, newUser])
    setAppState((current) => loginUser(current, newUser))
    setNameInput("")
    setEmailInput("")
    setPasswordInput("")
    setLoginError("")
    setAuthMode("login")
  }

  const handleCreateBoard = (event) => {
    event.preventDefault()
    if (!currentUser) return
    setAppState((current) =>
      createBoardForUser(current, currentUser.id, newBoardTitle, newBoardVisibility === "public"),
    )
    setNewBoardTitle("")
    setNewBoardVisibility("private")
    setIsCreateBoardModalOpen(false)
  }

  const handleRenameBoard = (event) => {
    event.preventDefault()
    if (!currentUser || !activeBoard) return
    setAppState((current) =>
      renameBoardForUser(current, currentUser.id, activeBoard.id, renameBoardTitle),
    )
    setRenameBoardTitle("")
  }

  const handleDeleteBoard = () => {
    if (!currentUser || !activeBoard) return
    setAppState((current) => deleteBoardForUser(current, currentUser.id, activeBoard.id))
  }

  const handleLogout = () => {
    setAppState((current) => logoutUser(current))
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

  const canManageActiveBoard = canManageBoard(activeBoard, currentUser?.id)

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <form
          onSubmit={authMode === "login" ? handleLogin : handleSignUp}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-xl font-bold text-slate-800">
            {authMode === "login" ? "Login" : "Sign Up"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">Use email and password authentication.</p>
          <p className="mt-2 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
            Demo: "melikealara@gmail.com" / 123456
          </p>
          {authMode === "signup" ? (
            <input
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F9423A]"
              placeholder="Full name"
              required
            />
          ) : null}
          <input
            type="email"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F9423A]"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F9423A]"
            placeholder="Password"
            required
          />
          {loginError ? <p className="mt-2 text-xs text-[#F9423A]">{loginError}</p> : null}
          <button
            type="submit"
            className="mt-3 w-full rounded-lg bg-[#F9423A] px-3 py-2 text-sm font-medium text-white hover:brightness-95"
          >
            {authMode === "login" ? "Login" : "Create Account"}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode((current) => (current === "login" ? "signup" : "login"))
              setLoginError("")
            }}
            className="mt-2 w-full rounded-lg border border-[#999999] px-3 py-2 text-sm font-medium text-[#999999] hover:bg-slate-50"
          >
            {authMode === "login" ? "Need an account? Sign Up" : "Already have an account? Login"}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#999999]">Kanban / Trello Clone</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-800">Welcome, {currentUser.name}</h1>
              <p className="mt-1 text-sm text-slate-600">
                Data model: User -&gt; Board -&gt; Column -&gt; Card with stable order_index sorting.
              </p>
              {!canManageActiveBoard ? (
                <span className="mt-2 inline-flex rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                  View Only
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-[#999999] px-3 py-2 text-sm font-medium text-[#999999] hover:bg-slate-50"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 p-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-semibold text-[#999999]">Workspace</p>
              <div className="flex gap-2">
                <select
                  value={appState.session.activeBoardId ?? ""}
                  onChange={(event) =>
                    setAppState((current) => setActiveBoard(current, event.target.value))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#F9423A]"
                >
                  {visibleBoards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.title} {board.isPublic ? "(Public)" : "(Private)"}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCreateBoardModalOpen(true)}
                  className="rounded-lg bg-[#F9423A] px-3 py-2 text-sm font-medium text-white hover:brightness-95"
                  aria-label="Create new board"
                >
                  +
                </button>
              </div>
            </div>

            <div className="lg:min-w-[340px]">
              <p className="mb-2 text-xs font-semibold text-[#999999]">Board Settings</p>
              <div className="flex flex-wrap items-center gap-2">
                <form onSubmit={handleRenameBoard} className="flex gap-2">
                  <input
                    value={renameBoardTitle}
                    onChange={(event) => setRenameBoardTitle(event.target.value)}
                    className="w-44 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F9423A] disabled:bg-slate-100"
                    placeholder="Rename board"
                    required
                    disabled={!canManageActiveBoard}
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-[#999999] px-3 py-2 text-sm font-medium text-[#999999] hover:bg-slate-50 disabled:opacity-50"
                    disabled={!canManageActiveBoard}
                  >
                    Rename
                  </button>
                </form>
                <button
                  type="button"
                  onClick={handleDeleteBoard}
                  className="rounded-lg border border-[#F9423A] px-3 py-2 text-sm font-medium text-[#F9423A] hover:bg-red-50 disabled:opacity-50"
                  disabled={!canManageActiveBoard}
                >
                  Delete Board
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeBoard ? (
          <Board
            board={activeBoard}
            onBoardChange={handleBoardChange}
            currentUserName={currentUser.name}
            canEdit={canManageActiveBoard}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
            No board found for this user. Create a new board.
          </div>
        )}
      </div>

      {isCreateBoardModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreateBoard}
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-slate-800">Create New Board</h3>
            <div className="mt-4 space-y-3">
              <input
                value={newBoardTitle}
                onChange={(event) => setNewBoardTitle(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F9423A]"
                placeholder="Board title"
                required
              />
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500">Visibility</p>
                <select
                  value={newBoardVisibility}
                  onChange={(event) => setNewBoardVisibility(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F9423A]"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateBoardModalOpen(false)}
                className="rounded-lg border border-[#999999] px-3 py-2 text-sm font-medium text-[#999999]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#F9423A] px-3 py-2 text-sm font-medium text-white hover:brightness-95"
              >
                Create Board
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  )
}

export default App

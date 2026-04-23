const STORAGE_KEY = "kanban-app-state-v2"
const USERS_KEY = "kanban-auth-users-v1"

const defaultAuthUsers = [
  {
    id: "user-melike",
    name: "Melike Alara",
    email: "melike@kocsistem.com",
    password: "123456",
  },
]

export function loadAppState() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch (error) {
    console.error("Uygulama verisi okunamadi:", error)
    return null
  }
}

export function saveAppState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadAuthUsers() {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) return defaultAuthUsers

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultAuthUsers
    return parsed
  } catch (error) {
    console.error("Failed to read user list:", error)
    return defaultAuthUsers
  }
}

export function saveAuthUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

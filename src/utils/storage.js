const STORAGE_KEY = "kanban-app-state-v2"

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


const STORAGE_KEY = 'oe-report-history'
const MAX_ENTRIES = 30

export function loadHistory() {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}


export function saveToHistory(entry) {
  const list = [entry, ...loadHistory().filter((e) => e.id !== entry.id)].slice(0, MAX_ENTRIES)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    return list
  }
  return list
}

export function deleteFromHistory(id) {
  const list = loadHistory().filter((e) => e.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    return list
  }
  return list
}

export function newAnalysisId() {
  return crypto.randomUUID?.() ?? String(Date.now())
}

const STORAGE_KEY = 'dry-night-tracker-events'

export function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveEvent(event) {
  const events = loadEvents()
  events.push(event)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  return events
}

export function deleteEvent(id) {
  const events = loadEvents().filter(e => e.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  return events
}

export function exportCSV(events) {
  const header = ['Date', 'Day', 'Time', 'Wet/Dry', 'Woke Up By', 'Went to Toilet', 'Asked for Daddy']
  const rows = events.map(e => [
    e.date,
    e.dayName,
    e.time,
    e.wetDry,
    e.wokeUpBy,
    e.wentToToilet,
    e.askedForDaddy,
  ])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dry-night-tracker-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const STORAGE_KEY = 'dry-night-tracker-events'
const DAILY_KEY = 'dry-night-tracker-daily'

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

export function loadDailyLogs() {
  try {
    const raw = localStorage.getItem(DAILY_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveDailyLog(date, data) {
  const logs = loadDailyLogs()
  logs[date] = { ...logs[date], ...data }
  localStorage.setItem(DAILY_KEY, JSON.stringify(logs))
  return logs
}

export function exportCSV(events, dailyLogs) {
  const header = ['Date', 'Day', 'Time', 'Logged By', 'Wet/Dry', 'Woke Up By', 'Went to Toilet', 'Asked for Daddy', 'Bedtime Helper']
  const rows = events.map(e => [
    e.date,
    e.dayName,
    e.time,
    e.parent || '',
    e.wetDry,
    e.wokeUpBy,
    e.wentToToilet,
    e.askedForDaddy,
    (dailyLogs[e.date] || {}).bedtimeHelper || '',
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

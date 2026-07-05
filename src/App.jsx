import { useState } from 'react'
import Wizard from './components/Wizard.jsx'
import History from './components/History.jsx'
import { loadEvents, saveEvent, deleteEvent, exportCSV } from './storage.js'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getNow() {
  const now = new Date()
  return {
    date: now.toLocaleDateString('en-GB'),
    dayName: DAYS[now.getDay()],
    time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    id: now.getTime().toString(),
  }
}

export default function App() {
  const [view, setView] = useState('home')
  const [events, setEvents] = useState(() => loadEvents())

  function handleSave(answers) {
    const ts = getNow()
    const event = { ...ts, ...answers }
    const updated = saveEvent(event)
    setEvents(updated)
    setView('saved')
  }

  function handleDelete(id) {
    const updated = deleteEvent(id)
    setEvents(updated)
  }

  if (view === 'wizard') {
    return <Wizard onSave={handleSave} onCancel={() => setView('home')} />
  }

  if (view === 'history') {
    return (
      <History
        events={events}
        onDelete={handleDelete}
        onExport={() => exportCSV(events)}
        onBack={() => setView('home')}
      />
    )
  }

  if (view === 'saved') {
    return (
      <div style={styles.center}>
        <div style={styles.savedIcon}>✓</div>
        <div style={styles.savedText}>Event logged!</div>
        <button style={styles.bigBtn} onClick={() => setView('home')}>Done</button>
        <button style={{ ...styles.bigBtn, ...styles.secondaryBtn }} onClick={() => setView('wizard')}>
          Log another
        </button>
      </div>
    )
  }

  return (
    <div style={styles.home}>
      <div style={styles.header}>
        <div style={styles.moon}>🌙</div>
        <h1 style={styles.title}>Dry Night Tracker</h1>
        <div style={styles.subtitle}>Night log for the sleep coach</div>
      </div>
      <div style={styles.btnGroup}>
        <button style={{ ...styles.bigBtn, ...styles.primaryBtn }} onClick={() => setView('wizard')}>
          + Log a Wake Event
        </button>
        <button style={{ ...styles.bigBtn, ...styles.secondaryBtn }} onClick={() => setView('history')}>
          View History
          {events.length > 0 && <span style={styles.badge}>{events.length}</span>}
        </button>
      </div>
    </div>
  )
}

const styles = {
  home: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    gap: '40px',
  },
  header: {
    textAlign: 'center',
  },
  moon: {
    fontSize: '64px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#f0f2f8',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#8b90a8',
  },
  btnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '400px',
  },
  bigBtn: {
    width: '100%',
    padding: '22px 24px',
    borderRadius: '18px',
    border: 'none',
    fontSize: '20px',
    fontWeight: '600',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  primaryBtn: {
    background: '#6c8fff',
    color: '#fff',
  },
  secondaryBtn: {
    background: '#252836',
    color: '#f0f2f8',
  },
  badge: {
    background: '#6c8fff',
    color: '#fff',
    borderRadius: '12px',
    padding: '2px 10px',
    fontSize: '14px',
    fontWeight: '700',
  },
  center: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    gap: '24px',
  },
  savedIcon: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    background: '#51cf66',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    color: '#fff',
  },
  savedText: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f0f2f8',
  },
}

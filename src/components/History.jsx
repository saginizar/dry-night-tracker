import { useState } from 'react'

const WET_COLOR = '#ff6b6b'
const DRY_COLOR = '#51cf66'

function groupByDate(events) {
  const groups = {}
  for (const e of [...events].reverse()) {
    const key = `${e.dayName} ${e.date}`
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  }
  return groups
}

export default function History({ events, dailyLogs, onDelete, onExport, onBack }) {
  const [viewMode, setViewMode] = useState('cards')
  const groups = groupByDate(events)
  const keys = Object.keys(groups)

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h2 style={styles.title}>History</h2>
        <button style={styles.exportBtn} onClick={onExport}>Export</button>
      </div>

      <div style={styles.toggleRow}>
        <button
          style={{ ...styles.toggleBtn, ...(viewMode === 'cards' ? styles.toggleActive : {}) }}
          onClick={() => setViewMode('cards')}
        >
          Cards
        </button>
        <button
          style={{ ...styles.toggleBtn, ...(viewMode === 'table' ? styles.toggleActive : {}) }}
          onClick={() => setViewMode('table')}
        >
          Table
        </button>
      </div>

      {keys.length === 0 && (
        <div style={styles.empty}>No events logged yet.</div>
      )}

      {viewMode === 'cards' ? (
        <div style={styles.list}>
          {keys.map(dateKey => {
            const firstEvent = groups[dateKey][0]
            const bedtime = (dailyLogs[firstEvent.date] || {}).bedtimeHelper
            return (
              <div key={dateKey} style={styles.dayGroup}>
                <div style={styles.dateHeader}>
                  <span>{dateKey}</span>
                  {bedtime && <span style={styles.bedtimePill}>🛏 {bedtime}</span>}
                </div>
                {groups[dateKey].map(event => (
                  <EventCard key={event.id} event={event} onDelete={onDelete} />
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        <TableView events={[...events].reverse()} dailyLogs={dailyLogs} onDelete={onDelete} />
      )}
    </div>
  )
}

function TableView({ events, dailyLogs, onDelete }) {
  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            {['Date', 'Time', 'By', 'Wet?', 'Woke by', 'Toilet', 'Daddy?', 'Bedtime', ''].map(h => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map(e => {
            const isWet = e.wetDry === 'Wet'
            const bedtime = (dailyLogs[e.date] || {}).bedtimeHelper || '—'
            return (
              <tr key={e.id} style={styles.tr}>
                <td style={styles.td}>{e.date}<br /><span style={styles.tdDay}>{e.dayName}</span></td>
                <td style={styles.td}>{e.time}</td>
                <td style={styles.td}>{e.parent || '—'}</td>
                <td style={{ ...styles.td, color: isWet ? WET_COLOR : DRY_COLOR, fontWeight: '700' }}>
                  {isWet ? '💧' : '✅'}
                </td>
                <td style={styles.td}>{e.wokeUpBy}</td>
                <td style={styles.td}>{e.wentToToilet}</td>
                <td style={styles.td}>{e.askedForDaddy}</td>
                <td style={styles.td}>{bedtime}</td>
                <td style={styles.td}>
                  <button style={styles.deleteSmall} onClick={() => onDelete(e.id)}>✕</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function EventCard({ event, onDelete }) {
  const isWet = event.wetDry === 'Wet'
  const accent = isWet ? WET_COLOR : DRY_COLOR

  return (
    <div style={{ ...styles.card, borderLeftColor: accent }}>
      <div style={styles.cardTop}>
        <div style={{ ...styles.wetDryBadge, background: accent }}>
          {isWet ? '💧 WET' : '✅ DRY'}
        </div>
        <div style={styles.cardMeta}>
          {event.parent && <span style={styles.parentTag}>{event.parent}</span>}
          <span style={styles.time}>{event.time}</span>
        </div>
      </div>
      <div style={styles.details}>
        <Detail label="Woke up by" value={event.wokeUpBy} />
        <Detail label="Toilet" value={event.wentToToilet} />
        <Detail label="Daddy only" value={event.askedForDaddy} />
      </div>
      <button style={styles.deleteBtn} onClick={() => onDelete(event.id)}>Delete</button>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div style={styles.detail}>
      <span style={styles.detailLabel}>{label}:</span>
      <span style={styles.detailValue}>{value}</span>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100dvh',
    background: '#0f1117',
    padding: '16px 20px 40px',
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#8b90a8',
    fontSize: '22px',
    cursor: 'pointer',
    padding: '8px 0',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#f0f2f8',
  },
  exportBtn: {
    background: '#252836',
    border: 'none',
    color: '#8b90a8',
    fontSize: '16px',
    padding: '8px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  toggleRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    background: '#1a1d27',
    borderRadius: '12px',
    padding: '4px',
  },
  toggleBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    background: 'none',
    color: '#8b90a8',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  toggleActive: {
    background: '#252836',
    color: '#f0f2f8',
  },
  empty: {
    textAlign: 'center',
    color: '#8b90a8',
    marginTop: '60px',
    fontSize: '18px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  dayGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  dateHeader: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#6c8fff',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    paddingBottom: '6px',
    borderBottom: '1px solid #252836',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bedtimePill: {
    fontSize: '13px',
    color: '#ffa94d',
    fontWeight: '500',
    textTransform: 'none',
    letterSpacing: 0,
  },
  card: {
    background: '#1a1d27',
    borderRadius: '14px',
    padding: '16px',
    borderLeft: '5px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wetDryBadge: {
    color: '#fff',
    fontWeight: '700',
    fontSize: '16px',
    padding: '4px 14px',
    borderRadius: '20px',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  parentTag: {
    fontSize: '13px',
    color: '#6c8fff',
    background: '#6c8fff22',
    padding: '2px 10px',
    borderRadius: '10px',
    fontWeight: '600',
  },
  time: {
    color: '#8b90a8',
    fontSize: '16px',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  detail: {
    display: 'flex',
    gap: '8px',
    fontSize: '16px',
  },
  detailLabel: {
    color: '#8b90a8',
    minWidth: '90px',
  },
  detailValue: {
    color: '#f0f2f8',
    fontWeight: '500',
  },
  deleteBtn: {
    alignSelf: 'flex-end',
    background: 'none',
    border: '1px solid #ff6b6b33',
    color: '#ff6b6b',
    padding: '6px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  tableWrapper: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    textAlign: 'left',
    color: '#8b90a8',
    fontWeight: '600',
    padding: '8px 10px',
    borderBottom: '1px solid #252836',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #1a1d27',
  },
  td: {
    color: '#f0f2f8',
    padding: '10px 10px',
    verticalAlign: 'top',
    whiteSpace: 'nowrap',
  },
  tdDay: {
    color: '#8b90a8',
    fontSize: '12px',
  },
  deleteSmall: {
    background: 'none',
    border: 'none',
    color: '#ff6b6b',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
  },
}

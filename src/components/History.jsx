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

export default function History({ events, onDelete, onExport, onBack }) {
  const groups = groupByDate(events)
  const keys = Object.keys(groups)

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onBack}>
          ‹ Back
        </button>
        <h2 style={styles.title}>History</h2>
        <button style={styles.exportBtn} onClick={onExport}>
          Export
        </button>
      </div>

      {keys.length === 0 && (
        <div style={styles.empty}>
          No events logged yet.
        </div>
      )}

      <div style={styles.list}>
        {keys.map(dateKey => (
          <div key={dateKey} style={styles.dayGroup}>
            <div style={styles.dateHeader}>{dateKey}</div>
            {groups[dateKey].map(event => (
              <EventCard key={event.id} event={event} onDelete={onDelete} />
            ))}
          </div>
        ))}
      </div>
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
        <div style={styles.time}>{event.time}</div>
      </div>
      <div style={styles.details}>
        <Detail label="Woke up by" value={event.wokeUpBy} />
        <Detail label="Toilet" value={event.wentToToilet} />
        <Detail label="Daddy only" value={event.askedForDaddy} />
      </div>
      <button style={styles.deleteBtn} onClick={() => onDelete(event.id)}>
        Delete
      </button>
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
    gap: '0',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
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
    paddingBottom: '4px',
    borderBottom: '1px solid #252836',
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
}

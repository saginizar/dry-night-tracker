import { getParentPref } from '../storage.js'

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  return d.toLocaleDateString('en-GB')
}

function parseDate(str) {
  const [d, m, y] = str.split('/')
  return new Date(+y, +m - 1, +d)
}

function buildStats(events) {
  if (!events.length) return null

  // --- per-night breakdown ---
  const byDate = {}
  for (const e of events) {
    if (!byDate[e.date]) byDate[e.date] = []
    byDate[e.date].push(e)
  }
  const nights = Object.keys(byDate).sort((a, b) => parseDate(b) - parseDate(a))

  // --- totals ---
  const total = events.length
  const wetCount = events.filter(e => e.wetDry === 'Wet').length
  const dryCount = total - wetCount
  const toiletYes = events.filter(e => e.wentToToilet === 'Yes').length

  // --- weekly ---
  const byWeek = {}
  for (const e of events) {
    const ws = getWeekStart(parseDate(e.date))
    if (!byWeek[ws]) byWeek[ws] = { wet: 0, dry: 0, awakenings: 0 }
    byWeek[ws].awakenings++
    if (e.wetDry === 'Wet') byWeek[ws].wet++
    else byWeek[ws].dry++
  }
  const weeks = Object.keys(byWeek).sort((a, b) => parseDate(b) - parseDate(a)).slice(0, 5)

  // --- dry streak ---
  let streak = 0
  for (const date of nights) {
    const nightEvents = byDate[date]
    if (nightEvents.every(e => e.wetDry === 'Dry')) {
      streak++
    } else {
      break
    }
  }

  // --- wakeup causes ---
  const causes = {}
  for (const e of events) {
    causes[e.wokeUpBy] = (causes[e.wokeUpBy] || 0) + 1
  }

  // --- parent preference ---
  const parentPref = {}
  for (const e of events) {
    const p = getParentPref(e)
    if (p) parentPref[p] = (parentPref[p] || 0) + 1
  }

  return { total, wetCount, dryCount, toiletYes, streak, byDate, nights, byWeek, weeks, causes, parentPref }
}

export default function Summary({ events, onBack }) {
  const s = buildStats(events)

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h2 style={styles.title}>Summary</h2>
        <div />
      </div>

      {!s && <div style={styles.empty}>No events yet.</div>}

      {s && <>
        {/* top stats */}
        <div style={styles.grid4}>
          <StatCard label="Total wake-ups" value={s.total} />
          <StatCard label="Wet nights" value={s.wetCount} color="#ff6b6b" />
          <StatCard label="Dry nights" value={s.dryCount} color="#51cf66" />
          <StatCard label="Dry streak" value={`${s.streak}🌙`} color="#6c8fff" />
        </div>

        <div style={styles.grid2}>
          <StatCard label="Went to toilet" value={`${s.toiletYes}/${s.total}`} />
          <StatCard label="Toilet rate" value={`${Math.round(s.toiletYes / s.total * 100)}%`} color="#51cf66" />
        </div>

        {/* per-night awakenings */}
        <Section title="Awakenings per night">
          <table style={styles.table}>
            <thead>
              <tr>
                {['Night', 'Day', 'Wake-ups', 'Wet', 'Dry'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.nights.map(date => {
                const evts = s.byDate[date]
                const wet = evts.filter(e => e.wetDry === 'Wet').length
                const dry = evts.length - wet
                return (
                  <tr key={date} style={styles.tr}>
                    <td style={styles.td}>{date}</td>
                    <td style={styles.td}>{evts[0].dayName}</td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{evts.length}</td>
                    <td style={{ ...styles.td, color: wet ? '#ff6b6b' : '#8b90a8' }}>{wet}</td>
                    <td style={{ ...styles.td, color: dry ? '#51cf66' : '#8b90a8' }}>{dry}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Section>

        {/* weekly */}
        <Section title="Weekly breakdown (last 5 weeks)">
          <table style={styles.table}>
            <thead>
              <tr>
                {['Week of', 'Wake-ups', 'Wet', 'Dry', 'Wet %'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.weeks.map(ws => {
                const w = s.byWeek[ws]
                return (
                  <tr key={ws} style={styles.tr}>
                    <td style={styles.td}>{ws}</td>
                    <td style={styles.td}>{w.awakenings}</td>
                    <td style={{ ...styles.td, color: w.wet ? '#ff6b6b' : '#8b90a8' }}>{w.wet}</td>
                    <td style={{ ...styles.td, color: w.dry ? '#51cf66' : '#8b90a8' }}>{w.dry}</td>
                    <td style={styles.td}>{Math.round(w.wet / w.awakenings * 100)}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Section>

        {/* causes */}
        <Section title="What woke him up">
          {Object.entries(s.causes).sort((a, b) => b[1] - a[1]).map(([cause, n]) => (
            <Bar key={cause} label={cause} count={n} total={s.total} />
          ))}
        </Section>

        {/* parent preference */}
        {Object.keys(s.parentPref).length > 0 && (
          <Section title="Asked for specific parent">
            {Object.entries(s.parentPref).sort((a, b) => b[1] - a[1]).map(([p, n]) => (
              <Bar key={p} label={p} count={n} total={s.total} />
            ))}
          </Section>
        )}
      </>}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.cardValue, color: color || '#f0f2f8' }}>{value}</div>
      <div style={styles.cardLabel}>{label}</div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  )
}

function Bar({ label, count, total }) {
  const pct = Math.round(count / total * 100)
  return (
    <div style={styles.barRow}>
      <div style={styles.barLabel}>{label}</div>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${pct}%` }} />
      </div>
      <div style={styles.barCount}>{count} ({pct}%)</div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100dvh',
    background: '#0f1117',
    padding: '16px 20px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    background: 'none', border: 'none', color: '#8b90a8',
    fontSize: '22px', cursor: 'pointer', padding: '8px 0',
  },
  title: { fontSize: '22px', fontWeight: '700', color: '#f0f2f8' },
  empty: { textAlign: 'center', color: '#8b90a8', marginTop: '60px', fontSize: '18px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  card: {
    background: '#1a1d27', borderRadius: '14px',
    padding: '16px 12px', textAlign: 'center',
  },
  cardValue: { fontSize: '28px', fontWeight: '700', marginBottom: '4px' },
  cardLabel: { fontSize: '13px', color: '#8b90a8' },
  section: { display: 'flex', flexDirection: 'column', gap: '10px' },
  sectionTitle: {
    fontSize: '14px', fontWeight: '700', color: '#6c8fff',
    textTransform: 'uppercase', letterSpacing: '1px',
    paddingBottom: '4px', borderBottom: '1px solid #252836',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: { textAlign: 'left', color: '#8b90a8', fontWeight: '600', padding: '6px 8px', borderBottom: '1px solid #252836', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #1a1d27' },
  td: { color: '#f0f2f8', padding: '8px 8px', whiteSpace: 'nowrap' },
  barRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  barLabel: { color: '#f0f2f8', fontSize: '15px', minWidth: '130px' },
  barTrack: { flex: 1, height: '10px', background: '#252836', borderRadius: '5px', overflow: 'hidden' },
  barFill: { height: '100%', background: '#6c8fff', borderRadius: '5px' },
  barCount: { color: '#8b90a8', fontSize: '13px', minWidth: '80px', textAlign: 'right' },
}

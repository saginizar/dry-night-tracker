const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function BedtimeLogger({ onSave, onCancel, existing }) {
  const now = new Date()
  const date = now.toLocaleDateString('en-GB')
  const dayName = DAYS[now.getDay()]

  function pick(value) {
    onSave(date, { bedtimeHelper: value, bedtimeDate: date, bedtimeDayName: dayName })
  }

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onCancel}>‹ Back</button>
      </div>

      <div style={styles.dateLabel}>{dayName}, {date}</div>

      <div style={styles.questionArea}>
        <div style={styles.question}>Who put him to sleep tonight?</div>
      </div>

      {existing && (
        <div style={styles.existing}>
          Already logged: <strong>{existing}</strong> — tap to change
        </div>
      )}

      <div style={styles.options}>
        {[
          { value: 'Daddy', label: '👨 Daddy', color: '#6c8fff' },
          { value: 'Mommy', label: '👩 Mommy', color: '#f06595' },
          { value: 'Together', label: '👨‍👩 Together', color: '#51cf66' },
        ].map(opt => (
          <button
            key={opt.value}
            style={{
              ...styles.optionBtn,
              borderColor: opt.color,
              background: existing === opt.value ? opt.color + '33' : '#1a1d27',
            }}
            onClick={() => pick(opt.value)}
          >
            <span style={styles.optionLabel}>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 24px 40px',
    background: '#0f1117',
  },
  topBar: {
    marginBottom: '12px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#8b90a8',
    fontSize: '22px',
    cursor: 'pointer',
    padding: '8px 0',
  },
  dateLabel: {
    textAlign: 'center',
    color: '#6c8fff',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  questionArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingBottom: '16px',
  },
  question: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#f0f2f8',
    lineHeight: 1.3,
  },
  existing: {
    textAlign: 'center',
    color: '#ffa94d',
    fontSize: '16px',
    marginBottom: '16px',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  optionBtn: {
    width: '100%',
    padding: '24px 20px',
    borderRadius: '18px',
    border: '3px solid',
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
  },
  optionLabel: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#f0f2f8',
  },
}

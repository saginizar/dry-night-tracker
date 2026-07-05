import { useState } from 'react'

const STEPS = [
  {
    key: 'wetDry',
    question: 'Was the underwear wet?',
    options: [
      { value: 'Wet', label: '💧 WET', color: '#ff6b6b' },
      { value: 'Dry', label: '✅ DRY', color: '#51cf66' },
    ],
  },
  {
    key: 'wokeUpBy',
    question: 'What woke him up?',
    options: [
      { value: 'Buzzer', label: '🔔 Buzzer', color: '#ffa94d' },
      { value: 'Woke up himself', label: '🧒 Woke up himself', color: '#6c8fff' },
      { value: 'We woke him', label: '👋 We woke him', color: '#cc5de8' },
    ],
  },
  {
    key: 'wentToToilet',
    question: 'Did he go to the toilet?',
    options: [
      { value: 'Yes', label: '✅ Yes', color: '#51cf66' },
      { value: 'No', label: '❌ No', color: '#ff6b6b' },
      { value: 'Refused', label: '🙅 Refused', color: '#ffa94d' },
    ],
  },
  {
    key: 'askedForDaddy',
    question: 'Did he ask for Daddy only?',
    options: [
      { value: 'Yes', label: '👨 Yes — Daddy only', color: '#ffa94d' },
      { value: 'No', label: '👍 No — was fine', color: '#51cf66' },
    ],
  },
]

export default function Wizard({ onSave, onCancel }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  function handleOption(value) {
    const key = STEPS[step].key
    const next = { ...answers, [key]: value }
    setAnswers(next)
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      onSave(next)
    }
  }

  function handleBack() {
    if (step === 0) {
      onCancel()
    } else {
      setStep(step - 1)
    }
  }

  const current = STEPS[step]
  const progress = ((step) / STEPS.length) * 100

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={handleBack}>
          ‹ Back
        </button>
        <div style={styles.stepLabel}>
          {step + 1} of {STEPS.length}
        </div>
      </div>

      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      <div style={styles.dots}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.dot,
              background: i <= step ? '#6c8fff' : '#252836',
              transform: i === step ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      <div style={styles.questionArea}>
        <div style={styles.question}>{current.question}</div>
      </div>

      <div style={styles.options}>
        {current.options.map(opt => (
          <button
            key={opt.value}
            style={{ ...styles.optionBtn, borderColor: opt.color }}
            onClick={() => handleOption(opt.value)}
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  stepLabel: {
    color: '#8b90a8',
    fontSize: '16px',
  },
  progressTrack: {
    height: '6px',
    background: '#252836',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  progressFill: {
    height: '100%',
    background: '#6c8fff',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '40px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transition: 'all 0.25s ease',
  },
  questionArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingBottom: '24px',
  },
  question: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#f0f2f8',
    lineHeight: 1.3,
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
    background: '#1a1d27',
    cursor: 'pointer',
    transition: 'transform 0.1s ease, background 0.15s ease',
    active: {
      transform: 'scale(0.97)',
    },
  },
  optionLabel: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#f0f2f8',
  },
}

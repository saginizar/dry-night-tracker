import { useState } from 'react'
import { loadApiKey, saveApiKey, getParentPref } from '../storage.js'

function buildContext(events, dailyLogs) {
  if (!events.length) return 'No events logged yet.'
  const lines = events.map(e => {
    const pref = getParentPref(e)
    return `${e.date} ${e.dayName} ${e.time} | ${e.parent || '?'} logged | ${e.wetDry} | woke: ${e.wokeUpBy} | toilet: ${e.wentToToilet} | parent pref: ${pref || 'n/a'}`
  })
  const bedlines = Object.entries(dailyLogs)
    .filter(([, v]) => v.bedtimeHelper)
    .map(([date, v]) => `${date}: bedtime by ${v.bedtimeHelper}`)
  return [
    '=== WAKE EVENT LOG ===',
    ...lines,
    '',
    '=== BEDTIME LOG ===',
    ...bedlines,
  ].join('\n')
}

export default function AskAI({ events, dailyLogs, onBack }) {
  const [apiKey, setApiKey] = useState(() => loadApiKey())
  const [keyInput, setKeyInput] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showKeyForm, setShowKeyForm] = useState(!loadApiKey())

  function handleSaveKey() {
    if (!keyInput.trim()) return
    saveApiKey(keyInput.trim())
    setApiKey(keyInput.trim())
    setShowKeyForm(false)
    setKeyInput('')
  }

  async function handleAsk() {
    if (!question.trim() || !apiKey) return
    setLoading(true)
    setError('')
    setAnswer('')

    const context = buildContext(events, dailyLogs)
    const systemPrompt = `You are a sleep training assistant helping parents track their child's nightly waking patterns.
You have access to a log of wake events. Answer questions concisely and helpfully.
Today's date context: the log may span multiple weeks.

DATA:
${context}`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: question }],
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error?.message || 'API error')
      } else {
        const text = data.content?.find(b => b.type === 'text')?.text || ''
        setAnswer(text)
      }
    } catch (e) {
      setError('Network error — check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h2 style={styles.title}>Ask AI</h2>
        <button style={styles.keyBtn} onClick={() => setShowKeyForm(v => !v)}>
          {apiKey ? '🔑' : '🔑 Set key'}
        </button>
      </div>

      {showKeyForm && (
        <div style={styles.keyForm}>
          <div style={styles.keyHint}>
            Enter your Anthropic API key. It is stored only in this browser — never sent anywhere else.
            Get one at console.anthropic.com
          </div>
          <input
            style={styles.input}
            type="password"
            placeholder="sk-ant-..."
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveKey()}
          />
          <button style={styles.saveKeyBtn} onClick={handleSaveKey}>Save Key</button>
        </div>
      )}

      {!apiKey && !showKeyForm && (
        <div style={styles.noKey}>Add your API key to use the AI assistant.</div>
      )}

      {apiKey && (
        <>
          <div style={styles.suggestions}>
            {[
              'How many wet nights did we have this week?',
              'What is the trend in awakenings over time?',
              'Which parent did he ask for most?',
              'What percentage of times did he go to the toilet?',
              'Is there a pattern in what wakes him up?',
            ].map(q => (
              <button key={q} style={styles.chip} onClick={() => setQuestion(q)}>{q}</button>
            ))}
          </div>

          <textarea
            style={styles.textarea}
            placeholder="Ask anything about the sleep log…"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            rows={3}
          />

          <button
            style={{ ...styles.askBtn, opacity: loading || !question.trim() ? 0.5 : 1 }}
            onClick={handleAsk}
            disabled={loading || !question.trim()}
          >
            {loading ? 'Thinking…' : 'Ask'}
          </button>

          {error && <div style={styles.error}>{error}</div>}

          {answer && (
            <div style={styles.answer}>
              <div style={styles.answerLabel}>AI Answer</div>
              <div style={styles.answerText}>{answer}</div>
            </div>
          )}

          <div style={styles.dataPreview}>
            <div style={styles.dataLabel}>Data context sent to AI</div>
            <div style={styles.dataSummary}>{events.length} wake events · {Object.values(dailyLogs).filter(v => v.bedtimeHelper).length} bedtime entries</div>
          </div>
        </>
      )}
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
    gap: '16px',
  },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  backBtn: {
    background: 'none', border: 'none', color: '#8b90a8',
    fontSize: '22px', cursor: 'pointer', padding: '8px 0',
  },
  title: { fontSize: '22px', fontWeight: '700', color: '#f0f2f8' },
  keyBtn: {
    background: 'none', border: '1px solid #252836', color: '#8b90a8',
    padding: '6px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '15px',
  },
  keyForm: {
    background: '#1a1d27', borderRadius: '14px', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  keyHint: { color: '#8b90a8', fontSize: '14px', lineHeight: 1.5 },
  input: {
    background: '#252836', border: '1px solid #3a3f54', color: '#f0f2f8',
    borderRadius: '10px', padding: '12px 14px', fontSize: '16px', outline: 'none',
  },
  saveKeyBtn: {
    background: '#6c8fff', border: 'none', color: '#fff',
    padding: '12px', borderRadius: '10px', fontSize: '16px',
    fontWeight: '600', cursor: 'pointer',
  },
  noKey: { textAlign: 'center', color: '#8b90a8', marginTop: '40px', fontSize: '18px' },
  suggestions: { display: 'flex', flexDirection: 'column', gap: '8px' },
  chip: {
    background: '#1a1d27', border: '1px solid #252836', color: '#8b90a8',
    borderRadius: '10px', padding: '10px 14px', fontSize: '14px',
    cursor: 'pointer', textAlign: 'left',
  },
  textarea: {
    background: '#1a1d27', border: '1px solid #252836', color: '#f0f2f8',
    borderRadius: '14px', padding: '14px', fontSize: '17px',
    fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.5,
  },
  askBtn: {
    background: '#6c8fff', border: 'none', color: '#fff',
    padding: '18px', borderRadius: '14px', fontSize: '20px',
    fontWeight: '700', cursor: 'pointer',
  },
  error: {
    background: '#2a1a1a', border: '1px solid #ff6b6b44',
    color: '#ff6b6b', borderRadius: '10px', padding: '12px 14px', fontSize: '15px',
  },
  answer: {
    background: '#1a1d27', borderRadius: '14px', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  answerLabel: { fontSize: '12px', color: '#6c8fff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' },
  answerText: { color: '#f0f2f8', fontSize: '16px', lineHeight: 1.6, whiteSpace: 'pre-wrap' },
  dataPreview: {
    background: '#1a1d27', borderRadius: '12px', padding: '12px 14px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  dataLabel: { color: '#8b90a8', fontSize: '13px' },
  dataSummary: { color: '#6c8fff', fontSize: '13px', fontWeight: '600' },
}

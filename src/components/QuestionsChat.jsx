import { useEffect, useRef, useState } from 'react'

export default function QuestionsChat({ messages, done, loading, onAnswer, onRetry, onBack, onNext }) {
  const [draft, setDraft] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, loading])

  function handleSubmit(e) {
    e.preventDefault()
    if (!draft.trim()) return
    onAnswer(draft.trim())
    setDraft('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e)
  }

  const waitingForReply = messages.length === 0 || messages.at(-1).role === 'user'

  return (
    <div>
      <h2>Follow-up questions</h2>
      <p className="muted">Answer a few questions so the analysis has what it needs.</p>

      <div className="chat">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === 'user' ? 'user' : 'bot'}`}>
            {m.content}
          </div>
        ))}
        {loading && <div className="bubble bot muted">Thinking…</div>}
        {!loading && waitingForReply && (
          <div className="bubble bot">
            Something went wrong.{' '}
            <button className="link" onClick={onRetry}>
              Try again
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {!done && (
        <form className="chat-input" onSubmit={handleSubmit}>
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer… (Enter to send, Shift+Enter for a new line)"
            disabled={loading || waitingForReply}
          />
          <button type="submit" disabled={loading || waitingForReply || !draft.trim()}>
            Send
          </button>
        </form>
      )}

      <div className="actions">
        <button className="secondary" onClick={onBack} disabled={loading}>
          ← Back
        </button>
        <button onClick={onNext} disabled={!done}>
          Next: Opportunity Report →
        </button>
      </div>
    </div>
  )
}

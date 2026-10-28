import { useState } from 'react'

export default function DescribeStep({
  workflowName,
  description,
  onNameChange,
  onDescriptionChange,
  onNext,
}) {
  const [validationError, setValidationError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!workflowName.trim() || !description.trim()) {
      setValidationError('Please enter both a workflow name and a description.')
      return
    }
    setValidationError('')
    onNext()
  }

  return (
    <>
      <div className="intro">
        <span className="eyebrow-pill">AI &amp; automation opportunities</span>
        <h1>
          Let&apos;s make your workflows <span className="soft">faster and more efficient.</span>
        </h1>
        <p className="lead">
          Describe how your team works today. We&apos;ll ask a few questions and show where
          automation and AI can help.
        </p>
      </div>

      <form className="panel" onSubmit={handleSubmit}>
        <p className="step-count">Step 1 of 3</p>
        <h2>Describe your workflow</h2>
        <p className="muted">Tell us how the workflow works today, step by step, in plain language.</p>

        <label>
          Workflow name
          <input
            value={workflowName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g., IT Support Ticketing"
          />
        </label>

        <label>
          How does it currently work?
          <textarea
            rows={9}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Who starts it, what happens at each step, who is involved, what tools are used..."
          />
        </label>

        <div
          className="alert warning privacy-warning"
          role="note"
          aria-label="Sensitive information warning"
        >
          <strong>Protect sensitive information.</strong> Do not enter passwords, API keys,
          credentials, or personal information that is not needed. Redact or summarize confidential
          details before continuing. Your workflow description and answers are sent to the configured
          AI provider for analysis.
        </div>

        {validationError && <div className="alert error">{validationError}</div>}

        <div className="actions">
          <button type="submit">Next: follow-up questions →</button>
        </div>
      </form>
    </>
  )
}

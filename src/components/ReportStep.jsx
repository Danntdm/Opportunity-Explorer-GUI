function getType(recommendation = '') {
  const text = recommendation.toLowerCase()
  if (text.includes('ai-assisted')) return 'AI'
  if (text.includes('safeguard')) return 'SAFEGUARD'
  if (text.includes('rule')) return 'RULE'
  if (text.includes('human')) return 'HUMAN'
  return 'UNKNOWN'
}

function Label({ kind, value }) {
  const level = (value || 'Unknown').toLowerCase()
  return <span className={`label ${kind}-${level}`}>{value || 'Unknown'}</span>
}

export default function ReportStep({ report, onBack }) {
  const sections = report.sections?.filter((section) => section.items?.length) || []
  const opportunities = report.opportunities || []

  return (
    <div>
      <div className="report-header">
        <p className="step-count">Step 3 of 3</p>
        <h2>Opportunity Report</h2>
        <p className="muted">{report.workflowName}</p>
      </div>

      <section className="callout">
        <h3>Workflow summary</h3>
        <p>{report.summary}</p>
      </section>

      <div className="section-grid">
        {sections.map((section) => (
          <section className="card" key={section.title}>
            <h3>{section.title}</h3>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <h3 className="section-heading">
        Opportunities <span className="count">{opportunities.length}</span>
      </h3>
      {opportunities.map((opp) => {
        const type = getType(opp.recommendation)
        return (
          <section className="card opportunity" key={opp.task}>
            <div className="opp-title">
              <Label kind="type" value={type} />
              <h4>{opp.task}</h4>
            </div>

            <dl className="props">
              <div>
                <dt>Recommendation</dt>
                <dd>{opp.recommendation}</dd>
              </div>
              <div>
                <dt>Improvement potential</dt>
                <dd>
                  <span className="label plain">{opp.potential}</span>
                </dd>
              </div>
              <div>
                <dt>Risk</dt>
                <dd>
                  <Label kind="risk" value={opp.risk} />
                </dd>
              </div>
              <div>
                <dt>Human review</dt>
                <dd>
                  <span className="label plain">{opp.humanReview}</span>
                </dd>
              </div>
            </dl>

            <h5 className="block-title">
              {type === 'UNKNOWN' ? 'What to find out first' : 'Suggested implementation'}
            </h5>
            <p>{opp.implementation}</p>

            <h5 className="block-title">Why this recommendation</h5>
            <ul>
              {opp.reasons?.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </section>
        )
      })}

      <div className="actions">
        <button className="secondary" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  )
}

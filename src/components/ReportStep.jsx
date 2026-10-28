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
  return (
    <div>
      <h2>Opportunity Report: {report.workflowName}</h2>

      <section className="card">
        <h3>Workflow summary</h3>
        <p>{report.summary}</p>
      </section>

      {report.sections?.filter((section) => section.items?.length).map((section) => (
        <section className="card" key={section.title}>
          <h3>{section.title}</h3>
          <ul>
            {section.items?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <h3>Opportunities</h3>
      {report.opportunities?.map((opp) => {
        const type = getType(opp.recommendation)
        return (
          <section className="card" key={opp.task}>
            <h4>
              <Label kind="type" value={type} /> {opp.task}
            </h4>
            <p>
              <strong>Recommendation:</strong> {opp.recommendation}
              <br />
              <strong>Improvement potential:</strong> {opp.potential}
              <br />
              <strong>Risk:</strong> <Label kind="risk" value={opp.risk} />
              <br />
              <strong>Human review:</strong> {opp.humanReview}
            </p>
            <p>
              <strong>{type === 'UNKNOWN' ? 'What to find out first:' : 'Suggested implementation:'}</strong>{' '}
              {opp.implementation}
            </p>
            <strong>Why this recommendation:</strong>
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

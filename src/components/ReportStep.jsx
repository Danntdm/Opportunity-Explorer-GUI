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
      {report.opportunities?.map((opp) => (
        <section className="card" key={opp.task}>
          <h4>{opp.task}</h4>
          <p>
            <strong>Recommendation:</strong> {opp.recommendation}
            <br />
            <strong>Improvement potential:</strong> {opp.potential}
            <br />
            <strong>Risk:</strong> {opp.risk}
            <br />
            <strong>Human review:</strong> {opp.humanReview}
          </p>
          <strong>Why this recommendation:</strong>
          <ul>
            {opp.reasons?.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
          <p>
            <strong>Suggested experiment:</strong> {opp.experiment}
          </p>
        </section>
      ))}

      <div className="actions">
        <button className="secondary" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  )
}

const TYPE_ORDER = ['RULE', 'AI', 'HUMAN', 'SAFEGUARD', 'UNKNOWN']
const TYPE_NAMES = {
  RULE: 'Rule',
  AI: 'AI',
  HUMAN: 'Human',
  SAFEGUARD: 'Safeguard',
  UNKNOWN: 'Needs more information',
}

const CHECKPOINTS = {
  required: ['approval required', 'A person must approve before anything happens.'],
  yes: ['review needed', 'A person checks the result before it is used.'],
  no: ['review not needed', 'Runs on its own once it is set up.'],
}

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

function Tile({ tone = '', value, label, detail }) {
  return (
    <div className={`tile ${tone ? `tone-${tone}` : ''}`}>
      <span className="tile-value">{value}</span>
      <span className="tile-label">{label}</span>
      {detail && <span className="tile-detail">{detail}</span>}
    </div>
  )
}


function downloadPdf(workflowName) {
  const previousTitle = document.title
  document.title = `KFlow Report - ${workflowName}`
  window.addEventListener('afterprint', () => (document.title = previousTitle), { once: true })
  window.print()
}

function OpportunityCard({ opp, type }) {
  const [reviewLabel, reviewNote] = CHECKPOINTS[(opp.humanReview || '').toLowerCase()] || [
    opp.humanReview,
    '',
  ]
  return (
    <article className="rec-card">
      <p className={`rec-type type-${type.toLowerCase()}`}>{TYPE_NAMES[type]}</p>
      <h4>{opp.task}</h4>

      <div className="rec-props">
        <div className="prop">
          <span className="prop-name">Approach</span>
          <strong>{opp.recommendation}</strong>
        </div>
        <div className="prop">
          <span className="prop-name">Improvement</span>
          <strong>{opp.potential}</strong>
        </div>
        <div className="prop">
          <span className="prop-name">Risk</span>
          <Label kind="risk" value={opp.risk} />
        </div>
      </div>

      <div className="rec-body">
        <div>
          <p className="rec-subtitle">Why this recommendation</p>
          <ul className="reasons">
            {opp.reasons?.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>

        <div className="rec-side">
          <div className="note checkpoint">
            <p className="note-title">Human checkpoint · {reviewLabel}</p>
            {reviewNote && <p>{reviewNote}</p>}
          </div>
          <div className="note implementation">
            <p className="note-title">
              {type === 'UNKNOWN' ? 'What to find out first' : 'Suggested implementation'}
            </p>
            <p>{opp.implementation}</p>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function ReportStep({ report, savedAt, backLabel = '← Back', onBack }) {
  const sections = report.sections?.filter((section) => section.items?.length) || []
  const opportunities = (report.opportunities || []).map((opp) => ({
    opp,
    type: getType(opp.recommendation),
  }))

  const itemCount = (title) => report.sections?.find((s) => s.title === title)?.items?.length || 0
  const typeCount = (type) => opportunities.filter((o) => o.type === type).length
  const rules = typeCount('RULE')
  const ai = typeCount('AI')
  const human = typeCount('HUMAN')
  const safeguards = typeCount('SAFEGUARD')
  const bottlenecks = itemCount('Bottlenecks')
  const unknowns = itemCount('What we still need to know')

  return (
    <div>
      {/* Only shown in the PDF, where the sidebar logo is hidden. */}
      <div className="print-brand">
        <img src="/kflow-icon.svg" width="28" height="28" alt="" />
        KFlow
      </div>

      <div className="report-header">
        <div>
          <p className="eyebrow">
            {savedAt ? (
              <>
                Report · Saved{' '}
                {new Date(savedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </>
            ) : (
              <>
                <span className="no-print">Step 3 of 3 · </span>Report
              </>
            )}
          </p>
          <h2>{report.workflowName}</h2>
        </div>
        <button className="secondary no-print" onClick={() => downloadPdf(report.workflowName)}>
          Download PDF
        </button>
      </div>

      <div className="tiles">
        <Tile value={bottlenecks} label={bottlenecks === 1 ? 'place work slows down' : 'places work slows down'} />
        <Tile tone="rule" value={rules + ai} label="to automate" detail={`${rules} Rule · ${ai} AI`} />
        <Tile tone="human" value={human} label={human === 1 ? 'decision stays human' : 'decisions stay human'} />
        <Tile tone="safeguard" value={safeguards} label={safeguards === 1 ? 'safeguard to add' : 'safeguards to add'} />
        <Tile tone="unknown" value={unknowns} label={unknowns === 1 ? 'open question' : 'open questions'} />
      </div>

      <section className="analysis">
        <p className="eyebrow">Workflow summary</p>
        <p className="summary-text">{report.summary}</p>
        <div className="analysis-grid">
          {sections.map((section) => (
            <div className="analysis-cell" key={section.title}>
              <h3>
                {section.title} <span className="count">{section.items.length}</span>
              </h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="recs-heading">
        <h3>Recommendations by type</h3>
        <p className="muted">Rules run on their own, AI needs review, and some decisions stay with people.</p>
      </div>

      {TYPE_ORDER.map((type) => {
        const group = opportunities.filter((o) => o.type === type)
        if (group.length === 0) return null
        return (
          <section className="rec-group" key={type}>
            <p className={`group-label type-${type.toLowerCase()}`}>
              {TYPE_NAMES[type]} · {group.length}
            </p>
            {group.map(({ opp }) => (
              <OpportunityCard key={opp.task} opp={opp} type={type} />
            ))}
          </section>
        )
      })}

      <div className="actions no-print">
        <button className="secondary" onClick={onBack}>
          {backLabel}
        </button>
      </div>
    </div>
  )
}

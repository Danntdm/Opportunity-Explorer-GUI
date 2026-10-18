// Fake report for the IT support ticketing workflow. Replace with real data later.
const REPORT = {
  workflowName: 'IT Support Ticketing',
  summary:
    'Users submit IT problems through an online form or by email. A help desk technician ' +
    'reads each ticket, assigns a category and priority, then either fixes it or forwards it ' +
    'to a specialist team. Users receive email updates until the ticket is closed. ' +
    'Administrator access requests must be approved by the IT manager.',
  sections: [
    {
      title: 'Repetitive tasks',
      items: [
        'Categorizing incoming tickets (hardware, software, network, account access)',
        'Sending "ticket received" and status update emails',
        'Resetting passwords for locked accounts',
      ],
    },
    {
      title: 'Bottlenecks',
      items: [
        'Tickets wait in the queue until a technician reads and categorizes them',
        'Tickets missing key details need back-and-forth with the user',
      ],
    },
    {
      title: 'Important handoffs',
      items: [
        'User to help desk when the ticket is submitted',
        'Help desk to specialist teams (network, accounts)',
        'Help desk to IT manager for access approvals',
      ],
    },
    {
      title: 'Tasks requiring human judgment',
      items: [
        'Diagnosing unusual or multi-cause problems',
        'Deciding priority when several urgent tickets arrive at once',
        'Approving administrator access',
      ],
    },
    {
      title: 'Risks and privacy/security concerns',
      items: [
        'Tickets can contain personal information or passwords',
        'Wrongly granted access could expose sensitive systems',
        'A security incident handled late or incorrectly could spread',
      ],
    },
  ],
  opportunities: [
    {
      task: 'Ticket categorization',
      recommendation: 'AI-assisted with human review',
      potential: 'High',
      humanReview: 'Yes',
      why:
        'Done for every ticket, based on text, and a wrong category is easy for a technician ' +
        'to spot and fix.',
      experiment:
        'Run AI categorization on 2 weeks of past tickets without showing it to users. ' +
        'Compare with technician categories. Target: 85% agreement.',
    },
    {
      task: '"Ticket received" confirmation',
      recommendation: 'Automate (no AI needed)',
      potential: 'High',
      humanReview: 'No',
      why: 'The same message is sent every time. A simple rule in the ticketing system can handle it.',
      experiment:
        'Turn on an auto-reply for one week and track how many users still ask whether ' +
        'their ticket was received.',
    },
    {
      task: 'Missing-information check',
      recommendation: 'AI-assisted with human review',
      potential: 'Medium',
      humanReview: 'Yes',
      why:
        'Incomplete tickets cause delays. AI can flag missing details (device, error message) ' +
        'and draft a follow-up question for the technician to send.',
      experiment:
        'Flag incomplete tickets for 2 weeks and measure whether time to first response drops.',
    },
    {
      task: 'Granting administrator access',
      recommendation: 'Keep human-controlled',
      potential: 'Low',
      humanReview: 'Required',
      why:
        'A high-consequence security decision. Mistakes are hard to detect and undo, so the ' +
        'IT manager must keep approving every request.',
      experiment: 'None. Keep the current approval process.',
    },
    {
      task: 'Handling security incidents',
      recommendation: 'Keep human-controlled',
      potential: 'Low',
      humanReview: 'Required',
      why:
        'Every incident is different and the cost of a wrong response is severe. ' +
        'This needs experienced staff.',
      experiment: 'None. Keep the current incident process.',
    },
  ],
}

export default function ReportStep({ onBack }) {
  return (
    <div>
      <h2>Opportunity Report: {REPORT.workflowName}</h2>

      <section className="card">
        <h3>Workflow summary</h3>
        <p>{REPORT.summary}</p>
      </section>

      {REPORT.sections.map((section) => (
        <section className="card" key={section.title}>
          <h3>{section.title}</h3>
          <ul>
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <h3>Opportunities</h3>
      {REPORT.opportunities.map((opp) => (
        <section className="card" key={opp.task}>
          <h4>{opp.task}</h4>
          <p>
            <strong>Recommendation:</strong> {opp.recommendation}
            <br />
            <strong>Automation potential:</strong> {opp.potential}
            <br />
            <strong>Human review:</strong> {opp.humanReview}
          </p>
          <p>
            <strong>Why:</strong> {opp.why}
          </p>
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

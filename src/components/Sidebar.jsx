import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import Stepper from './Stepper'

const DAY = 24 * 60 * 60 * 1000

function groupFor(time) {
  const startOfToday = new Date().setHours(0, 0, 0, 0)
  const startOfDay = new Date(time).setHours(0, 0, 0, 0)
  const daysAgo = Math.round((startOfToday - startOfDay) / DAY)
  if (daysAgo <= 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  if (daysAgo < 7) return 'Previous 7 days'
  return 'Older'
}

function whenLabel(time, group) {
  const date = new Date(time)
  if (group === 'Today' || group === 'Yesterday') {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function Sidebar({
  stages,
  stage,
  history,
  activeHistoryId,
  onNewAnalysis,
  onOpenHistory,
  onDeleteHistory,
}) {
  const [pendingDelete, setPendingDelete] = useState(null)

  const groups = []
  for (const entry of history) {
    const group = groupFor(entry.createdAt)
    if (groups.at(-1)?.label !== group) groups.push({ label: group, entries: [] })
    groups.at(-1).entries.push(entry)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/kflow-icon.svg" width="26" height="26" alt="" />
        KFlow
      </div>

      <button className="new-analysis" onClick={onNewAnalysis}>
        + New analysis
      </button>

      <div>
        <p className="sidebar-label">This analysis</p>
        <Stepper stages={stages} current={stage} />
      </div>

      <div className="history">
        <p className="sidebar-label">History</p>
        {history.length === 0 && <p className="history-empty">Finished reports will appear here.</p>}
        {groups.map((group) => (
          <div key={group.label}>
            <p className="history-group">{group.label}</p>
            {group.entries.map((entry) => {
              const when = whenLabel(entry.createdAt, group.label)
              return (
                <div
                  key={entry.id}
                  className={`history-row ${entry.id === activeHistoryId ? 'active' : ''}`}
                >
                  <button className="history-item" onClick={() => onOpenHistory(entry.id)}>
                    {entry.workflowName}
                    <span className="history-sub">
                      {entry.report.opportunities?.length || 0} opportunities · {when}
                    </span>
                  </button>
                  <button
                    className="history-delete"
                    aria-label={`Delete ${entry.workflowName} report`}
                    title="Delete report"
                    onClick={() => setPendingDelete({ ...entry, when })}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M2.5 4h11M6.5 4V2.75h3V4M4 4l.6 9.25h6.8L12 4M6.75 6.5v4.5M9.25 6.5v4.5"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this report?"
          message={`"${pendingDelete.workflowName}" from ${pendingDelete.when} will be removed from your history. This can't be undone.`}
          confirmLabel="Yes, delete"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            onDeleteHistory(pendingDelete.id)
            setPendingDelete(null)
          }}
        />
      )}
    </aside>
  )
}

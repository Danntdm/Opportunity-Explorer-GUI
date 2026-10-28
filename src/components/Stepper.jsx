export default function Stepper({ stages, current }) {
  return (
    <ol className="stepper">
      {stages.map((label, i) => {
        const state = i === current ? 'active' : i < current ? 'done' : ''
        return (
          <li key={label} className={state}>
            <span className="step-dot">{state === 'done' ? '✓' : i + 1}</span>
            <span className="step-label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

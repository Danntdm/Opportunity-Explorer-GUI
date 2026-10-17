export default function Stepper({ stages, current }) {
  return (
    <ol className="stepper">
      {stages.map((label, i) => (
        <li key={label} className={i === current ? 'active' : i < current ? 'done' : ''}>
          <span className="step-num">Step {i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  )
}

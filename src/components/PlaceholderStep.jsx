export default function PlaceholderStep({ title, onBack, onNext, nextLabel }) {
  return (
    <div>
      <h2>{title}</h2>
      <div className="placeholder-box">Placeholder</div>
      <div className="actions">
        <button className="secondary" onClick={onBack}>
          ← Back
        </button>
        {onNext && <button onClick={onNext}>{nextLabel}</button>}
      </div>
    </div>
  )
}

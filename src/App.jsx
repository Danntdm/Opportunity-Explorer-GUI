import OpportunityExplorer from './components/OpportunityExplorer'

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <h1>Opportunity Explorer</h1>
        <p>Discover opportunities to improve workflows through AI and automation.</p>
      </header>

      <main className="container">
        <OpportunityExplorer />
      </main>

      <footer className="footer">LA Tech Rising | Opportunity Explorer Project</footer>
    </div>
  )
}

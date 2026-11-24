function HomePage({ history, onSearch, onNavigate }) {
  const collections = [
    ['Database', 'Schemas, queries, and data foundations'],
    ['Frontend Development', 'Interfaces and component patterns'],
    ['Backend Development', 'Services, APIs, and integrations'],
    ['Artificial Intelligence', 'Models, workflows, and evaluation'],
    ['Cloud Computing', 'Infrastructure and reliability'],
    ['Cybersecurity', 'Application and data protection'],
    ['DevOps', 'Deployment and delivery practices'],
    ['Software Engineering', 'Architecture and engineering principles'],
    ['Networking', 'Connectivity and communication systems'],
    ['Data Science', 'Analysis, experiments, and insights'],
  ]

  return (
    <div className="workspace-page">
      <div className="workspace-breadcrumb">Workspace <span>/</span> Home</div>
      <header className="workspace-page-header">
        <p className="workspace-eyebrow">Knowledge workspace</p>
        <h1>Good afternoon.</h1>
        <p>Find and explore knowledge across your documents.</p>
      </header>

      <section className="workspace-home-grid">
        <div className="workspace-home-primary">
          <section className="workspace-section workspace-quick-search">
            <div className="workspace-section-heading">
              <div>
                <p className="workspace-eyebrow">Start here</p>
                <h2>Quick search</h2>
              </div>
              <button type="button" onClick={() => onNavigate('search')} className="workspace-text-button">Open search →</button>
            </div>
            <button type="button" onClick={() => onNavigate('search')} className="workspace-home-search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m20 20-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" /></svg>
              <span>Search your documents...</span>
              <kbd>⌘ K</kbd>
            </button>
            <div className="workspace-example-row">
              <span>Try</span>
              {['database', 'React components', 'cloud infrastructure'].map((example) => (
                <button type="button" key={example} onClick={() => onSearch(example)}>{example}</button>
              ))}
            </div>
          </section>

          <section className="workspace-section">
            <div className="workspace-section-heading">
              <div>
                <p className="workspace-eyebrow">Your activity</p>
                <h2>Recently searched</h2>
              </div>
              {history.length > 0 && <button type="button" onClick={() => onNavigate('recent')} className="workspace-text-button">View all →</button>}
            </div>
            {history.length === 0 ? (
              <p className="workspace-empty-copy">Searches you make will appear here for quick access.</p>
            ) : (
              <div className="workspace-recent-list">
                {history.slice(0, 4).map((item) => (
                  <button type="button" key={`${item.mode}-${item.query}`} onClick={() => onSearch(item.query, item.mode)}>
                    <span className="workspace-recent-icon">⌕</span>
                    <span className="min-w-0"><strong>{item.query}</strong><small>{item.mode === 'keyword' ? 'Keyword search' : 'Natural-language question'}</small></span>
                    <span className="workspace-arrow">→</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="workspace-home-tips">
          <p className="workspace-eyebrow">A useful habit</p>
          <h2>Search with context.</h2>
          <p>Use a keyword when you know the concept. Ask a full question when you want the workspace to remove common filler words first.</p>
          <div className="workspace-tip-example"><span>Example</span><strong>“Which document explains React components?”</strong></div>
          <button type="button" onClick={() => onNavigate('search', 'natural')} className="workspace-text-button">Ask a question →</button>
        </aside>
      </section>

      <section className="workspace-section workspace-collections">
        <div className="workspace-section-heading">
          <div>
            <p className="workspace-eyebrow">Browse by topic</p>
            <h2>Collections</h2>
          </div>
          <button type="button" onClick={() => onNavigate('documents')} className="workspace-text-button">All documents →</button>
        </div>
        <div className="workspace-collection-grid">
          {collections.map(([name, description]) => (
            <button type="button" key={name} onClick={() => onNavigate('collection', name)} className="workspace-collection-card">
              <span className="workspace-collection-folder">◫</span>
              <span><strong>{name}</strong><small>{description}</small></span>
              <span className="workspace-arrow">→</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage

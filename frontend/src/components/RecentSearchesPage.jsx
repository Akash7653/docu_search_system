function RecentSearchesPage({ history, onSearch, onClear, onNavigate }) {
  return (
    <div className="workspace-page">
      <div className="workspace-breadcrumb">Workspace <span>/</span> Recent Searches</div>
      <header className="workspace-page-header">
        <p className="workspace-eyebrow">Your activity</p>
        <h1>Recent searches</h1>
        <p>Return to questions and concepts you explored recently.</p>
      </header>
      <section className="workspace-section workspace-recent-page">
        <div className="workspace-section-heading">
          <div>
            <p className="workspace-eyebrow">History</p>
            <h2>{history.length ? `${history.length} saved searches` : 'Nothing here yet'}</h2>
          </div>
          {history.length > 0 && <button type="button" onClick={onClear} className="workspace-text-button">Clear history</button>}
        </div>
        {history.length === 0 ? (
          <div className="workspace-empty-copy">
            <p>Search your documents and your recent queries will appear here.</p>
            <button type="button" onClick={() => onNavigate('search')} className="workspace-text-button">Go to search →</button>
          </div>
        ) : (
          <div className="workspace-recent-list">
            {history.map((item) => (
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
  )
}

export default RecentSearchesPage

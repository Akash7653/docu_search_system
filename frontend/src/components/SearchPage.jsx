import SearchInput from './SearchInput'
import SearchModeSelector from './SearchModeSelector'
import SearchResults from './SearchResults'
import StatusMessage from './StatusMessage'

const examples = {
  keyword: ['database', 'React components', 'cloud infrastructure', 'machine learning'],
  natural: [
    'Where can I find information about database management?',
    'Which document explains React components?',
    'Tell me about web application security.',
  ],
}

function SearchPage({ mode, query, response, error, loading, onModeChange, onQueryChange, onSearch, onClear, onExample }) {
  return (
    <div className="workspace-page">
      <div className="workspace-breadcrumb">Workspace <span>/</span> Search</div>
      <header className="workspace-page-header workspace-search-header">
        <p className="workspace-eyebrow">Knowledge retrieval</p>
        <h1>Search your knowledge</h1>
        <p>Find the information you need across your project documents.</p>
      </header>

      <section className="workspace-search-box">
        <SearchModeSelector mode={mode} onChange={onModeChange} />
        <div className="mt-5">
          <SearchInput value={query} onChange={onQueryChange} onSubmit={onSearch} onClear={onClear} loading={loading} mode={mode} />
        </div>
        <div className="workspace-search-examples">
          <span>Suggested</span>
          {examples[mode].map((example) => <button type="button" key={example} onClick={() => onExample(example)}>{example}</button>)}
        </div>
      </section>

      <p className="workspace-score-note">Relevance scores represent lexical retrieval relevance, not AI confidence.</p>
      <section className="workspace-results-area">
        {loading && <StatusMessage type="loading">Searching your documents...</StatusMessage>}
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        {!loading && !error && response && <SearchResults response={response} mode={mode} />}
        {!loading && !error && !response && <div className="workspace-search-empty"><span>⌕</span><h2>Search your knowledge base</h2><p>Begin with a keyword or ask a question in your own words.</p></div>}
      </section>
    </div>
  )
}

export default SearchPage

import DocumentResultCard from './DocumentResultCard'

function SearchResults({ response, mode }) {
  if (!response || response.results.length === 0) {
    return (
      <div className="workspace-no-results">
        <p className="text-base font-semibold">No documents found</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Try a different keyword or ask about another topic.
        </p>
        {mode === 'natural' && response && (
          <p className="mt-3 text-xs text-[var(--text-subtle)]">
            Processed query: {response.processed_query || 'No meaningful terms'}
          </p>
        )}
      </div>
    )
  }

  return (
    <section className="workspace-results" aria-live="polite">
      <div className="workspace-results-header">
        <div>
          <p className="text-sm font-semibold">
            {response.total} relevant {response.total === 1 ? 'document' : 'documents'}
          </p>
          {mode === 'natural' && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Processed query:{' '}
              <span               className="font-medium text-[var(--text)]">
                {response.processed_query || 'No meaningful terms'}
              </span>
            </p>
          )}
        </div>
        <p className="text-xs text-[var(--text-subtle)]">Results are shown in relevance order</p>
      </div>
      <div className="workspace-result-list">
        {response.results.map((result, index) => (
          <DocumentResultCard key={result.id} result={result} index={index} />
        ))}
      </div>
    </section>
  )
}

export default SearchResults

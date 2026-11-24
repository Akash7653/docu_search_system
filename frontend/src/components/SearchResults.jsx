import DocumentResultCard from './DocumentResultCard'

function SearchResults({ response, mode }) {
  if (!response || response.results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="text-base font-semibold text-slate-800">No documents found</p>
        <p className="mt-2 text-sm text-slate-500">
          Try a different keyword or ask about another topic.
        </p>
        {mode === 'natural' && response && (
          <p className="mt-3 text-xs text-slate-400">
            Processed query: {response.processed_query || 'No meaningful terms'}
          </p>
        )}
      </div>
    )
  }

  return (
    <section aria-live="polite">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {response.total} relevant {response.total === 1 ? 'document' : 'documents'}
          </p>
          {mode === 'natural' && (
            <p className="mt-1 text-sm text-slate-500">
              Processed query:{' '}
              <span className="font-medium text-slate-700">
                {response.processed_query || 'No meaningful terms'}
              </span>
            </p>
          )}
        </div>
        <p className="text-xs text-slate-400">Results are shown in relevance order</p>
      </div>
      <div className="space-y-4">
        {response.results.map((result, index) => (
          <DocumentResultCard key={result.id} result={result} index={index} />
        ))}
      </div>
    </section>
  )
}

export default SearchResults

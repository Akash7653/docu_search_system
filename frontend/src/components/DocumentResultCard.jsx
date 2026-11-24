function DocumentResultCard({ result, index }) {
  const score = `${(result.relevance_score * 100).toFixed(1)}%`

  return (
    <article className="workspace-result-item">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="workspace-document-title">
            <span className="workspace-document-icon">▤</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
            Result {index + 1}
              </p>
              <h3>
            {result.name}
              </h3>
            </div>
          </div>
        </div>
        <div className="workspace-result-score">
          <p>
            Relevance score
          </p>
          <strong>{score}</strong>
        </div>
      </div>
      <div className="workspace-result-meta">
        <span className="workspace-category">
          {result.category}
        </span>
        {result.matched_fields.map((field) => (
          <span key={field} className="workspace-matched-field">
            Matched: {field}
          </span>
        ))}
      </div>
      <p className="workspace-result-description">{result.short_description}</p>
    </article>
  )
}

export default DocumentResultCard

function DocumentResultCard({ result, index }) {
  const score = `${(result.relevance_score * 100).toFixed(1)}%`

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Result {index + 1}
          </p>
          <h3 className="mt-1 break-words text-lg font-semibold text-slate-900">
            {result.name}
          </h3>
        </div>
        <div className="w-full rounded-lg bg-blue-50 px-3 py-2 text-left sm:w-auto sm:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
            Relevance score
          </p>
          <p className="text-lg font-bold text-blue-800">{score}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {result.category}
        </span>
        {result.matched_fields.map((field) => (
          <span
            key={field}
            className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700"
          >
            Matched: {field}
          </span>
        ))}
      </div>
      <p className="mt-4 break-words leading-7 text-slate-600">{result.short_description}</p>
    </article>
  )
}

export default DocumentResultCard

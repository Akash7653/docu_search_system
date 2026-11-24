function SearchInput({
  value,
  onChange,
  onSubmit,
  onClear,
  loading,
  mode,
}) {
  const isQuestion = mode === 'natural'

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="document-search-input">
        {isQuestion ? 'Ask a question' : 'Search documents'}
      </label>
      <input
        id="document-search-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onSubmit()
          }
        }}
        placeholder={
          isQuestion
            ? 'Where can I find information about databases?'
            : 'Try database, React, or cloud infrastructure'
        }
        maxLength={500}
        className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="min-h-12 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:w-auto"
        >
          Clear
        </button>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={() => onSubmit()}
        className="min-h-12 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </div>
  )
}

export default SearchInput

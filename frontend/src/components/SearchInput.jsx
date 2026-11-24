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
    <div className="workspace-search-input">
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
        className="workspace-search-field"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="workspace-clear-button"
        >
          Clear
        </button>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={() => onSubmit()}
        className="workspace-search-button"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </div>
  )
}

export default SearchInput

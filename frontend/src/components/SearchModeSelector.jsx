const modes = [
  {
    id: 'keyword',
    label: 'Keyword Search',
    description: 'Find exact concepts and terms',
  },
  {
    id: 'natural',
    label: 'Natural Language Query',
    description: 'Ask a question in your own words',
  },
]

function SearchModeSelector({ mode, onChange }) {
  return (
    <div className="workspace-mode-selector" role="radiogroup" aria-label="Search mode">
      {modes.map((option) => {
        const selected = mode === option.id
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={`workspace-mode-option ${
              selected
                ? 'workspace-mode-option-active'
                : ''
            }`}
          >
            <span className="block text-sm font-semibold text-slate-900">
              {option.label}
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              {option.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default SearchModeSelector

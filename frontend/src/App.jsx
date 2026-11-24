import { useState } from 'react'

import BrandMark from './components/BrandMark'
import DocumentManager from './components/DocumentManager'
import SearchInput from './components/SearchInput'
import SearchModeSelector from './components/SearchModeSelector'
import SearchResults from './components/SearchResults'
import StatusMessage from './components/StatusMessage'
import { searchByKeyword, searchByQuestion } from './services/api'

const examples = {
  keyword: ['database', 'React', 'cloud infrastructure', 'machine learning'],
  natural: [
    'Where can I find information about database management?',
    'Which document explains React components?',
    'Tell me about web application security.',
  ],
}

function App() {
  const [view, setView] = useState('search')
  const [mode, setMode] = useState('keyword')
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  const handleModeChange = (nextMode) => {
    setMode(nextMode)
    setResponse(null)
    setError('')
  }

  const handleClear = () => {
    setQuery('')
    setResponse(null)
    setError('')
  }

  const handleSearch = async (nextQuery = query, nextMode = mode) => {
    if (!nextQuery.trim()) {
      setResponse(null)
      setError('Enter a keyword or question before searching.')
      return
    }

    const trimmedQuery = nextQuery.trim()
    setQuery(trimmedQuery)
    setLoading(true)
    setResponse(null)
    setError('')

    try {
      const nextResponse =
        nextMode === 'keyword'
          ? await searchByKeyword(trimmedQuery)
          : await searchByQuestion(trimmedQuery)
      setResponse(nextResponse)
      setHistory((current) => [
        { query: trimmedQuery, mode: nextMode },
        ...current.filter((item) => item.query !== trimmedQuery),
      ].slice(0, 5))
    } catch (requestError) {
      setError(
        requestError.message ||
          'The backend is unavailable. Check that the API server is running.',
      )
    } finally {
      setLoading(false)
    }
  }

  const runExample = (example) => {
    setView('search')
    handleSearch(example)
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button type="button" onClick={() => setView('search')} aria-label="Go to search" className="rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100">
            <BrandMark />
          </button>
          <nav className="hidden items-center gap-1 rounded-xl bg-slate-100 p-1 md:flex" aria-label="Main navigation">
            <button type="button" onClick={() => setView('search')} className={`nav-tab ${view === 'search' ? 'nav-tab-active' : ''}`}>Search</button>
            <button type="button" onClick={() => setView('documents')} className={`nav-tab ${view === 'documents' ? 'nav-tab-active' : ''}`}>Documents</button>
          </nav>
          <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Local workspace
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 sm:pb-10 md:pt-8 lg:px-8 lg:py-12">
        {view === 'documents' ? (
          <DocumentManager />
        ) : (
          <>
            <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-2xl shadow-slate-900/10 sm:px-10 lg:px-14 lg:py-14">
              <div className="hero-glow" />
              <div className="relative max-w-3xl">
                <p className="eyebrow text-blue-300">Intelligent knowledge retrieval</p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Find the right document, faster.</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Search your project knowledge with precise keywords or ask a question in your own words.</p>
              </div>
              <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
                <div className="hero-stat"><span className="text-2xl font-bold">TF-IDF</span><span>Explainable ranking</span></div>
                <div className="hero-stat"><span className="text-2xl font-bold">2 modes</span><span>Keyword + natural language</span></div>
                <div className="hero-stat"><span className="text-2xl font-bold">100%</span><span>Fictional sample data</span></div>
              </div>
            </section>

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
              <section className="panel p-5 sm:p-8">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow">Search workspace</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{mode === 'keyword' ? 'Search by concept' : 'Ask a question'}</h2>
                  </div>
                  <p className="text-xs text-slate-400">Scores are retrieval relevance, not AI confidence</p>
                </div>
                <SearchModeSelector mode={mode} onChange={handleModeChange} />
                <div className="mt-5">
                  <SearchInput value={query} onChange={setQuery} onSubmit={handleSearch} onClear={handleClear} loading={loading} mode={mode} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Try:</span>
                  {examples[mode].map((example) => (
                    <button type="button" key={example} onClick={() => runExample(example)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">{example}</button>
                  ))}
                </div>
              </section>

              <aside className="panel p-5">
                <div className="flex items-center justify-between">
                  <div><p className="eyebrow">Activity</p><h2 className="mt-2 font-bold text-slate-950">Recent searches</h2></div>
                  {history.length > 0 && <button type="button" onClick={() => setHistory([])} className="text-xs font-semibold text-slate-400 hover:text-slate-700">Clear</button>}
                </div>
                {history.length === 0 ? <p className="mt-6 text-sm leading-6 text-slate-500">Your latest searches will appear here for quick access.</p> :                 <div className="mt-5 space-y-3">{history.map((item) => <button type="button" key={`${item.mode}-${item.query}`} onClick={() => { setMode(item.mode); handleSearch(item.query, item.mode) }} className="block w-full text-left"><span className="line-clamp-2 text-sm font-medium text-slate-700 hover:text-blue-700">{item.query}</span><span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.mode === 'keyword' ? 'Keyword' : 'Question'}</span></button>)}</div>}
              </aside>
            </div>

            <section className="mt-8">
              {loading && <StatusMessage type="loading">Searching your documents...</StatusMessage>}
              {error && <StatusMessage type="error">{error}</StatusMessage>}
              {!loading && !error && response && <SearchResults response={response} mode={mode} />}
              {!loading && !error && !response && <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600">⌕</div><p className="mt-4 text-lg font-bold text-slate-900">Your results will appear here</p><p className="mt-2 text-sm text-slate-500">Start with a suggested search or enter your own query above.</p></div>}
            </section>
          </>
        )}
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-24 text-center text-xs text-slate-400 sm:px-6 sm:pb-8 lg:px-8">DocuFind · Explainable document retrieval for project knowledge</footer>
      <nav className="mobile-bottom-nav md:hidden" aria-label="Mobile navigation">
        <button type="button" onClick={() => setView('search')} className={`mobile-nav-item ${view === 'search' ? 'mobile-nav-item-active' : ''}`} aria-current={view === 'search' ? 'page' : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m20 20-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" /></svg>
          <span>Search</span>
        </button>
        <button type="button" onClick={() => setView('documents')} className={`mobile-nav-item ${view === 'documents' ? 'mobile-nav-item-active' : ''}`} aria-current={view === 'documents' ? 'page' : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.75A1.75 1.75 0 0 1 6.75 3h7.5L19 7.75v11.5A1.75 1.75 0 0 1 17.25 21h-10A2.25 2.25 0 0 1 5 18.75V4.75Z" /><path d="M14 3v5h5M8.5 12h7M8.5 15.5h5" /></svg>
          <span>Documents</span>
        </button>
      </nav>
    </div>
  )
}

export default App

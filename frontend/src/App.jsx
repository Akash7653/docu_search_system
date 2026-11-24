import { useEffect, useRef, useState } from 'react'

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

function NavigationIcon({ name }) {
  if (name === 'documents') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4.75A1.75 1.75 0 0 1 6.75 3h7.5L19 7.75v11.5A1.75 1.75 0 0 1 17.25 21h-10A2.25 2.25 0 0 1 5 18.75V4.75Z" />
        <path d="M14 3v5h5M8.5 12h7M8.5 15.5h5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m20 20-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
    </svg>
  )
}

function App() {
  const [view, setView] = useState('search')
  const [mode, setMode] = useState('keyword')
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!mobileMenuOpen) return undefined

    const previousFocus = document.activeElement
    closeButtonRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [mobileMenuOpen])

  const navigate = (nextView) => {
    setView(nextView)
    setMobileMenuOpen(false)
  }

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
    navigate('search')
    handleSearch(example)
  }

  const navigation = (
    <div className="space-y-2">
      {[
        { id: 'search', label: 'Search workspace', icon: 'search' },
        { id: 'documents', label: 'Document library', icon: 'documents' },
      ].map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => navigate(item.id)}
          className={`side-nav-item ${view === item.id ? 'side-nav-item-active' : ''}`}
          aria-current={view === item.id ? 'page' : undefined}
        >
          <NavigationIcon name={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <aside className="desktop-sidebar">
        <BrandMark />
        <div className="mt-12">
          <p className="sidebar-label">Workspace</p>
          <div className="mt-4">{navigation}</div>
        </div>
        <div className="sidebar-note">
          <span className="sidebar-note-icon">✦</span>
          <p className="mt-3 text-sm font-semibold text-slate-800">Built for clarity</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Find useful project knowledge without guessing how the ranking works.</p>
        </div>
        <p className="mt-auto text-xs text-slate-400">DocuFind v1.0</p>
      </aside>

      <div className="xl:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <button type="button" onClick={() => navigate('search')} aria-label="Go to search" className="rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 lg:hidden">
              <BrandMark compact />
            </button>
            <div className="hidden xl:block">
              <p className="text-sm font-semibold text-slate-900">{view === 'search' ? 'Search workspace' : 'Document library'}</p>
              <p className="mt-0.5 text-xs text-slate-400">Project knowledge, organized</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Local workspace
              </div>
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                className="touch-target rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100 xl:hidden"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-6 sm:px-6 md:pt-8 lg:px-8 lg:pb-16 lg:pt-10">
          {view === 'documents' ? (
            <DocumentManager />
          ) : (
            <>
              <section className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 px-5 py-7 text-white shadow-2xl shadow-slate-900/10 sm:px-8 sm:py-10 lg:rounded-[2rem] lg:px-12 lg:py-12">
                <div className="hero-glow" />
                <div className="relative max-w-3xl">
                  <p className="eyebrow text-blue-300">Intelligent knowledge retrieval</p>
                  <h1 className="mt-3 text-[clamp(2rem,4.5vw,4rem)] font-bold leading-[1.05] tracking-tight">Find the right document, faster.</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">Search your project knowledge with precise keywords or ask a question in your own words.</p>
                </div>
                <div className="relative mt-7 grid gap-2 sm:grid-cols-3 sm:gap-3">
                  <div className="hero-stat"><span className="text-xl font-bold sm:text-2xl">TF-IDF</span><span>Explainable ranking</span></div>
                  <div className="hero-stat"><span className="text-xl font-bold sm:text-2xl">2 modes</span><span>Keyword + natural language</span></div>
                  <div className="hero-stat"><span className="text-xl font-bold sm:text-2xl">100%</span><span>Fictional sample data</span></div>
                </div>
              </section>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] lg:mt-8 lg:gap-8">
                <section className="panel min-w-0 p-4 sm:p-6 lg:p-8">
                  <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="eyebrow">Search workspace</p>
                      <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{mode === 'keyword' ? 'Search by concept' : 'Ask a question'}</h2>
                    </div>
                    <p className="text-xs text-slate-400">Scores are retrieval relevance, not AI confidence</p>
                  </div>
                  <SearchModeSelector mode={mode} onChange={handleModeChange} />
                  <div className="mt-4 sm:mt-5">
                    <SearchInput value={query} onChange={setQuery} onSubmit={handleSearch} onClear={handleClear} loading={loading} mode={mode} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Try:</span>
                    {examples[mode].map((example) => (
                      <button type="button" key={example} onClick={() => runExample(example)} className="min-h-9 max-w-full rounded-full border border-slate-200 px-3 py-1.5 text-left text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">{example}</button>
                    ))}
                  </div>
                </section>

                <aside className="panel min-w-0 p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div><p className="eyebrow">Activity</p><h2 className="mt-2 font-bold text-slate-950">Recent searches</h2></div>
                    {history.length > 0 && <button type="button" onClick={() => setHistory([])} className="touch-target text-xs font-semibold text-slate-400 hover:text-slate-700">Clear</button>}
                  </div>
                  {history.length === 0 ? <p className="mt-5 text-sm leading-6 text-slate-500">Your latest searches will appear here for quick access.</p> : <div className="mt-5 space-y-1">{history.map((item) => <button type="button" key={`${item.mode}-${item.query}`} onClick={() => { setMode(item.mode); handleSearch(item.query, item.mode) }} className="block min-h-12 w-full rounded-xl px-2 py-2 text-left transition hover:bg-blue-50"><span className="block break-words text-sm font-medium text-slate-700 hover:text-blue-700">{item.query}</span><span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.mode === 'keyword' ? 'Keyword' : 'Question'}</span></button>)}</div>}
                </aside>
              </div>

              <section className="mt-6 lg:mt-8">
                {loading && <StatusMessage type="loading">Searching your documents...</StatusMessage>}
                {error && <StatusMessage type="error">{error}</StatusMessage>}
                {!loading && !error && response && <SearchResults response={response} mode={mode} />}
                {!loading && !error && !response && <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center sm:px-6 sm:py-14"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600">⌕</div><p className="mt-4 text-lg font-bold text-slate-900">Your results will appear here</p><p className="mt-2 text-sm text-slate-500">Start with a suggested search or enter your own query above.</p></div>}
              </section>
            </>
          )}
        </main>
        <footer className="mx-auto max-w-[1440px] px-4 pb-8 text-center text-xs text-slate-400 sm:px-6 lg:px-8">DocuFind · Explainable document retrieval for project knowledge</footer>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu-layer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button type="button" className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation menu" />
          <aside className="mobile-drawer">
            <div className="flex items-center justify-between">
              <BrandMark />
              <button ref={closeButtonRef} type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation menu" className="touch-target rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>
            <p className="sidebar-label mt-10">Workspace</p>
            <div className="mt-4">{navigation}</div>
            <div className="sidebar-note mt-10">
              <span className="sidebar-note-icon">✦</span>
              <p className="mt-3 text-sm font-semibold text-slate-800">Built for clarity</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Explainable retrieval for your project knowledge.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

export default App

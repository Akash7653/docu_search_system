import { useEffect, useRef, useState } from 'react'

import DocumentManager from './components/DocumentManager'
import HomePage from './components/HomePage'
import RecentSearchesPage from './components/RecentSearchesPage'
import SearchPage from './components/SearchPage'
import ThemeToggle from './components/ThemeToggle'
import WorkspaceSidebar from './components/WorkspaceSidebar'
import { searchByKeyword, searchByQuestion } from './services/api'

function App() {
  const [view, setView] = useState('home')
  const [category, setCategory] = useState('')
  const [mode, setMode] = useState('keyword')
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [theme, setTheme] = useState(() => localStorage.getItem('docufind-theme') || 'light')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('docufind-theme', theme)
  }, [theme])

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

  const navigate = (nextView, nextCategory = '') => {
    setView(nextView)
    setCategory(nextCategory)
    setMobileMenuOpen(false)
  }

  const handleSearch = async (nextQuery = query, nextMode = mode) => {
    if (!nextQuery.trim()) {
      setResponse(null)
      setError('Enter a keyword or question before searching.')
      return
    }

    const trimmedQuery = nextQuery.trim()
    setView('search')
    setCategory('')
    setQuery(trimmedQuery)
    setMode(nextMode)
    setLoading(true)
    setResponse(null)
    setError('')

    try {
      const nextResponse = nextMode === 'keyword'
        ? await searchByKeyword(trimmedQuery)
        : await searchByQuestion(trimmedQuery)
      setResponse(nextResponse)
      setHistory((current) => [
        { query: trimmedQuery, mode: nextMode },
        ...current.filter((item) => item.query !== trimmedQuery),
      ].slice(0, 8))
    } catch (requestError) {
      setError(requestError.message || 'The backend is unavailable. Check that the API server is running.')
    } finally {
      setLoading(false)
    }
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

  const handleThemeChange = (nextTheme) => setTheme(nextTheme)
  const handleHomeNavigate = (nextView, nextMode) => {
    if (nextMode) setMode(nextMode)
    navigate(nextView)
  }

  return (
    <div className="docufind-app">
      <div className={`workspace-desktop-sidebar ${sidebarCollapsed ? 'workspace-desktop-sidebar-collapsed' : ''}`}>
        <WorkspaceSidebar
          view={view}
          category={category}
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed((current) => !current)}
          onNavigate={navigate}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
      </div>

      <div className={`workspace-main ${sidebarCollapsed ? 'workspace-main-collapsed' : ''}`}>
        <header className="workspace-topbar">
          <div className="workspace-topbar-inner">
            <button type="button" onClick={() => navigate('home')} className="workspace-mobile-brand" aria-label="Go to home">
              <span className="workspace-mobile-brand-mark">D</span>
              <span>DocuFind</span>
            </button>
            <div className="workspace-topbar-context">
              <span>DocuFind</span>
              <span>/</span>
              <strong>{category || (view === 'home' ? 'Home' : view === 'documents' ? 'All Documents' : view === 'recent' ? 'Recent Searches' : 'Search')}</strong>
            </div>
            <div className="workspace-topbar-actions">
              <div className="workspace-status"><span /> Synced workspace</div>
              <div className="hidden lg:block"><ThemeToggle theme={theme} onChange={handleThemeChange} /></div>
              <button type="button" onClick={() => setMobileMenuOpen(true)} className="workspace-icon-button workspace-mobile-menu-button" aria-label="Open navigation menu" aria-expanded={mobileMenuOpen}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              </button>
            </div>
          </div>
        </header>

        <main className="workspace-content">
          {view === 'home' && <HomePage history={history} onSearch={handleSearch} onNavigate={handleHomeNavigate} />}
          {view === 'search' && (
            <SearchPage
              mode={mode}
              query={query}
              response={response}
              error={error}
              loading={loading}
              onModeChange={handleModeChange}
              onQueryChange={setQuery}
              onSearch={() => handleSearch(query, mode)}
              onClear={handleClear}
              onExample={(example) => handleSearch(example, mode)}
            />
          )}
          {view === 'recent' && <RecentSearchesPage history={history} onSearch={handleSearch} onClear={() => setHistory([])} onNavigate={navigate} />}
          {view === 'documents' && <DocumentManager />}
          {view === 'collection' && <DocumentManager categoryFilter={category} />}
        </main>
        <footer className="workspace-footer">DocuFind · A focused space for project knowledge</footer>
      </div>

      {mobileMenuOpen && (
        <div className="workspace-mobile-layer" role="dialog" aria-modal="true" aria-label="Workspace navigation">
          <button type="button" className="workspace-mobile-backdrop" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation menu" />
          <div className="workspace-mobile-drawer">
            <WorkspaceSidebar
              mobile
              view={view}
              category={category}
              onNavigate={navigate}
              theme={theme}
              onThemeChange={handleThemeChange}
            />
            <button ref={closeButtonRef} type="button" onClick={() => setMobileMenuOpen(false)} className="workspace-mobile-close" aria-label="Close navigation menu">×</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

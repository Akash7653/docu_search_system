import BrandMark from './BrandMark'
import ThemeToggle from './ThemeToggle'

const collections = [
  'Database',
  'Frontend Development',
  'Backend Development',
  'Artificial Intelligence',
  'Cloud Computing',
  'Cybersecurity',
  'DevOps',
  'Software Engineering',
  'Networking',
  'Data Science',
]

function NavigationIcon({ name }) {
  const paths = {
    home: 'M4 10.5 12 4l8 6.5v8.25A1.25 1.25 0 0 1 18.75 20h-13A1.25 1.25 0 0 1 4.5 18.75V10.5ZM9 20v-5h6v5',
    search: 'm20 20-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z',
    documents: 'M5 4.75A1.75 1.75 0 0 1 6.75 3h7.5L19 7.75v11.5A1.75 1.75 0 0 1 17.25 21h-10A2.25 2.25 0 0 1 5 18.75V4.75ZM14 3v5h5M8.5 12h7M8.5 15.5h5',
    recent: 'M12 7v5l3 2m5-2a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    collection: 'M4 6.5A1.5 1.5 0 0 1 5.5 5H10l2 2h6.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11Z',
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name] || paths.collection} />
    </svg>
  )
}

function WorkspaceSidebar({
  view,
  category,
  collapsed,
  onCollapse,
  onNavigate,
  theme,
  onThemeChange,
  mobile = false,
}) {
  const isActive = (id) => view === id && !category

  return (
    <aside className={`workspace-sidebar ${collapsed && !mobile ? 'workspace-sidebar-collapsed' : ''} ${mobile ? 'workspace-sidebar-mobile' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <BrandMark compact={collapsed && !mobile} />
        <div className="flex items-center gap-1">
          {mobile && <ThemeToggle theme={theme} onChange={onThemeChange} />}
          {!mobile && (
            <button type="button" onClick={onCollapse} className="workspace-icon-button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={collapsed ? 'm9 6 6 6-6 6' : 'm15 6-6 6 6 6'} /></svg>
            </button>
          )}
        </div>
      </div>

      <div className="mt-10">
        {!collapsed && <p className="workspace-sidebar-label">Workspace</p>}
        <nav className="mt-3 space-y-1" aria-label="Workspace navigation">
          {[
            ['home', 'Home'],
            ['search', 'Search'],
            ['documents', 'All Documents'],
            ['recent', 'Recent Searches'],
          ].map(([id, label]) => (
            <button type="button" key={id} onClick={() => onNavigate(id)} className={`workspace-nav-item ${isActive(id) ? 'workspace-nav-item-active' : ''}`} aria-current={isActive(id) ? 'page' : undefined} title={collapsed ? label : undefined}>
              <NavigationIcon name={id} />
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {!collapsed && (
        <div className="mt-8">
          <p className="workspace-sidebar-label">Collections</p>
          <nav className="mt-3 space-y-1" aria-label="Document collections">
            {collections.map((item) => (
              <button type="button" key={item} onClick={() => onNavigate('collection', item)} className={`workspace-nav-item workspace-collection-item ${category === item ? 'workspace-nav-item-active' : ''}`}>
                <NavigationIcon name="collection" />
                <span>{item}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      <div className="mt-auto">
        {!collapsed && (
          <div className="workspace-sidebar-note">
            <p className="text-sm font-semibold">A calmer way to search</p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Organize project knowledge and find useful context without the noise.</p>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          {!collapsed && <span className="text-xs text-[var(--text-muted)]">DocuFind workspace</span>}
          {!mobile && <ThemeToggle theme={theme} onChange={onThemeChange} />}
        </div>
      </div>
    </aside>
  )
}

export { NavigationIcon }
export default WorkspaceSidebar

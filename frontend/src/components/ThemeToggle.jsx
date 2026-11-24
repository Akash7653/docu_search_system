function ThemeToggle({ theme, onChange }) {
  const nextTheme = theme === 'light' ? 'dark' : 'light'

  return (
    <button
      type="button"
      onClick={() => onChange(nextTheme)}
      className="workspace-icon-button"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      {theme === 'light' ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v1.5M12 19.5V21M4.6 4.6l1.05 1.05m12.7 12.7 1.05 1.05M3 12h1.5m15 0H21M4.6 19.4l1.05-1.05m12.7-12.7 1.05-1.05M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z" />
        </svg>
      )}
    </button>
  )
}

export default ThemeToggle

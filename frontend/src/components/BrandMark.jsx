function BrandMark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M6 3.75h8.5L19 8.25v12A1.75 1.75 0 0 1 17.25 22h-11A1.75 1.75 0 0 1 4.5 20.25v-14A2.5 2.5 0 0 1 7 3.75Z" />
          <path d="M14 3.75v4.5h5M8 12h8M8 15.5h5" />
          <circle cx="17.5" cy="17.5" r="3" fill="currentColor" stroke="white" />
          <path d="m19.7 19.7 1.8 1.8" stroke="white" />
        </svg>
      </div>
      <div className={compact ? 'hidden sm:block' : ''}>
        <p className="text-sm font-bold tracking-tight text-slate-950">DocuFind</p>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Knowledge workspace</p>
      </div>
    </div>
  )
}

export default BrandMark

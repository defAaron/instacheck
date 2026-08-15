import type { ReactNode } from "react"

type ShellProps = {
  children: ReactNode
  nav?: ReactNode
  onHome?: () => void
}

export function Shell({ children, nav, onHome }: ShellProps) {
  const brandClass =
    "font-serif text-[1.7rem] leading-none tracking-tight text-foreground"

  return (
    <div className="relative flex min-h-svh flex-col">
      <header className="relative z-10 flex items-center justify-between px-5 pt-6 sm:px-10 sm:pt-8">
        {onHome ? (
          <button type="button" className={brandClass} onClick={onHome}>
            Instacheck
          </button>
        ) : (
          <p className={brandClass}>Instacheck</p>
        )}
        {nav ? (
          <nav className="flex items-center gap-6 text-[11px] tracking-[0.18em] text-foreground uppercase">
            {nav}
          </nav>
        ) : null}
      </header>
      {children}
    </div>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-center border-b border-border bg-background/95 backdrop-blur-md px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center">
          <svg viewBox="0 0 32 32" className="h-7 w-7 text-primary" fill="currentColor">
            <path d="M16 2L14 8H8L13 12L11 18L16 14L21 18L19 12L24 8H18L16 2Z" />
            <rect x="14.5" y="14" width="3" height="14" rx="1" />
            <rect x="10" y="18" width="12" height="3" rx="1" />
          </svg>
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="font-serif text-lg font-bold tracking-wider text-foreground" data-testid="text-app-name">
            FAITH EMPIRE
          </span>
        </div>
      </div>
    </header>
  );
}

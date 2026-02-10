import logoPath from "@assets/Copy_of_EPRODUCTS_EMPIRE_PODCAST_(98)_1770693543975.png";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-center border-b border-border bg-background/95 backdrop-blur-md px-4 py-1 pt-[max(0.25rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-2">
        <img
          src={logoPath}
          alt="Decoded Faith Empire"
          className="h-28 w-auto object-contain"
          data-testid="img-logo"
        />
      </div>
    </header>
  );
}

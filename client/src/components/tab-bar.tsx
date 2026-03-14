import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { BookOpen, Book, Headphones, Menu } from "lucide-react";

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="6" y1="7" x2="18" y2="7" />
    </svg>
  );
}

const LAST_SEEN_KEY = "faith-empire-last-verse-seen";

function getETMidnight(): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const year = parseInt(parts.find((p) => p.type === "year")!.value);
  const month = parseInt(parts.find((p) => p.type === "month")!.value) - 1;
  const day = parseInt(parts.find((p) => p.type === "day")!.value);
  const etMidnight = new Date(Date.UTC(year, month, day, 5, 0, 0));
  return etMidnight.getTime();
}

function hasNewVerse(): boolean {
  try {
    const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
    const midnight = getETMidnight();
    if (!lastSeen) return true;
    return parseInt(lastSeen) < midnight;
  } catch {
    return false;
  }
}

export function markVerseSeen(): void {
  localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
}

const tabs = [
  { path: "/", label: "Today", icon: BookOpen },
  { path: "/bible", label: "Bible", icon: Book },
  { path: "/podcast", label: "Podcast", icon: Headphones },
  { path: "/decoded", label: "Decoded", icon: CrossIcon },
  { path: "/about", label: "More", icon: Menu },
];

export function TabBar() {
  const [location] = useLocation();
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    setShowBadge(hasNewVerse());
  }, []);

  useEffect(() => {
    if (location === "/") {
      markVerseSeen();
      setShowBadge(false);
    }
  }, [location]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md"
      data-testid="nav-tab-bar"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around gap-1 px-2 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const moreSubPages = ["/about", "/favorites", "/archive", "/privacy", "/terms", "/premium", "/prayers"];
          const isActive =
            tab.path === "/"
              ? location === "/"
              : tab.path === "/about"
                ? moreSubPages.some((p) => location === p || location.startsWith(p + "/"))
                : location.startsWith(tab.path);
          const Icon = tab.icon;
          const showDot = tab.path === "/" && showBadge && !isActive;
          return (
            <Link key={tab.path} href={tab.path}>
              <button
                className={`relative flex flex-col items-center gap-0.5 rounded-md px-4 py-2 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                data-testid={`tab-${tab.label.toLowerCase()}`}
              >
                <div className="relative">
                  <Icon
                    className={`h-5 w-5 transition-all ${
                      isActive ? "stroke-[2.5]" : "stroke-[1.5]"
                    }`}
                  />
                  {showDot && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className={`text-[10px] font-medium tracking-wide ${isActive ? "font-semibold" : ""}`}>
                  {tab.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

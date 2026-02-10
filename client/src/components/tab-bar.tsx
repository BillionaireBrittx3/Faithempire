import { useLocation, Link } from "wouter";
import { BookOpen, Archive, Heart, Info, Headphones } from "lucide-react";

const tabs = [
  { path: "/", label: "Today", icon: BookOpen },
  { path: "/archive", label: "Archive", icon: Archive },
  { path: "/podcast", label: "Podcast", icon: Headphones },
  { path: "/favorites", label: "Saved", icon: Heart },
  { path: "/about", label: "More", icon: Info },
];

export function TabBar() {
  const [location] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md"
      data-testid="nav-tab-bar"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around gap-1 px-2 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          const Icon = tab.icon;
          return (
            <Link key={tab.path} href={tab.path}>
              <button
                className={`flex flex-col items-center gap-0.5 rounded-md px-4 py-2 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                data-testid={`tab-${tab.label.toLowerCase()}`}
              >
                <Icon
                  className={`h-5 w-5 transition-all ${
                    isActive ? "stroke-[2.5]" : "stroke-[1.5]"
                  }`}
                />
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

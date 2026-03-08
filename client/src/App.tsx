import { Component, type ErrorInfo, type ReactNode } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SubscriptionProvider, useSubscription } from "@/lib/subscription";
import { Header } from "@/components/header";
import { TabBar } from "@/components/tab-bar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ArchivePage from "@/pages/archive";
import FavoritesPage from "@/pages/favorites";
import AboutPage from "@/pages/about";
import PodcastPage from "@/pages/podcast";
import BiblePage from "@/pages/bible";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import DecodedPage from "@/pages/decoded";
import DecodedBookPage from "@/pages/decoded-book";
import PaywallPage from "@/pages/paywall";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DFAC2A]/10 mb-4">
            <span className="font-serif text-2xl text-[#DFAC2A]">!</span>
          </div>
          <h1 className="font-serif text-xl font-bold text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-white/60 mb-6">
            Please restart the app to continue.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = "/";
            }}
            className="rounded-xl bg-[#DFAC2A] px-6 py-3 text-sm font-semibold text-black"
            data-testid="button-error-restart"
          >
            Restart App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PUBLIC_PATHS = ["/premium", "/privacy", "/terms"];

function SubscriptionGate({ children }: { children: ReactNode }) {
  const { isPremium, isLoading } = useSubscription();
  const [location] = useLocation();

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => location === p || location.startsWith(p + "/")
  );

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DFAC2A]/30 border-t-[#DFAC2A]" />
      </div>
    );
  }

  if (!isPremium) {
    return <PaywallPage />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <SubscriptionGate>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/bible" component={BiblePage} />
        <Route path="/archive" component={ArchivePage} />
        <Route path="/podcast" component={PodcastPage} />
        <Route path="/favorites" component={FavoritesPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/decoded/:bookSlug">
          {(params) => <DecodedBookPage bookSlug={params.bookSlug} />}
        </Route>
        <Route path="/decoded" component={DecodedPage} />
        <Route path="/premium" component={PaywallPage} />
        <Route component={NotFound} />
      </Switch>
    </SubscriptionGate>
  );
}

function AppLayout() {
  const { isPremium, isLoading } = useSubscription();
  const [location] = useLocation();
  const isPublicPath = PUBLIC_PATHS.some(
    (p) => location === p || location.startsWith(p + "/")
  );
  const showChrome = isPremium || isPublicPath;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {showChrome && <Header />}
      <main className={`flex-1 mx-auto w-full max-w-lg ${showChrome ? 'pb-16' : ''}`}>
        <Router />
      </main>
      {showChrome && <TabBar />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SubscriptionProvider>
            <TooltipProvider>
              <AppLayout />
              <Toaster />
            </TooltipProvider>
          </SubscriptionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

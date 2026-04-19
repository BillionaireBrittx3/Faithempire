import { Component, type ErrorInfo, type ReactNode } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SubscriptionProvider, useSubscription } from "@/lib/subscription";
import { PaywallModalProvider } from "@/components/paywall-modal";
import { AudioProvider } from "@/lib/audio-context";
import { Header } from "@/components/header";
import { TabBar } from "@/components/tab-bar";
import { GlobalPlayer } from "@/components/global-player";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ArchivePage from "@/pages/archive";
import FavoritesPage from "@/pages/favorites";
import AboutPage from "@/pages/about";
import PodcastPage from "@/pages/podcast";
import BiblePage from "@/pages/bible";
import PrayersPage from "@/pages/prayers";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import DecodedPage from "@/pages/decoded";
import DevotionalPage from "@/pages/devotional";
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

function Router() {
  const { isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DFAC2A]/30 border-t-[#DFAC2A]" />
      </div>
    );
  }

  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/bible" component={BiblePage} />
        <Route path="/archive" component={ArchivePage} />
        <Route path="/podcast" component={PodcastPage} />
        <Route path="/favorites" component={FavoritesPage} />
        <Route path="/prayers" component={PrayersPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/decoded/:bookSlug">
          {(params) => <DecodedBookPage bookSlug={params.bookSlug} />}
        </Route>
        <Route path="/decoded" component={DecodedPage} />
        <Route path="/devotional" component={DevotionalPage} />
        <Route path="/premium" component={PaywallPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-lg pb-16">
        <Router />
      </main>
      <GlobalPlayer />
      <TabBar />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SubscriptionProvider>
            <PaywallModalProvider>
              <AudioProvider>
                <TooltipProvider>
                  <AppLayout />
                  <Toaster />
                </TooltipProvider>
              </AudioProvider>
            </PaywallModalProvider>
          </SubscriptionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

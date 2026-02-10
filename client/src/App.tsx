import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { TabBar } from "@/components/tab-bar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ArchivePage from "@/pages/archive";
import FavoritesPage from "@/pages/favorites";
import AboutPage from "@/pages/about";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/archive" component={ArchivePage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 mx-auto w-full max-w-lg pb-16">
              <Router />
            </main>
            <TabBar />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

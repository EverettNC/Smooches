import { useState, useEffect } from 'react';
import { Switch, Route, Link, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth-simple";
import { 
  Home as HomeIcon, 
  Radio as RadioIcon, 
  Video, 
  Users,
  DollarSign,

  LogOut
} from "lucide-react";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import Profile from "@/pages/profile";
import Live from "@/pages/live";
import Radio from "@/pages/radio";
import MonetizationDashboard from "@/pages/monetization";
import Settings from "@/pages/settings";

import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/landing-page";
import CreateContentPage from "@/pages/create-content";
import { Header } from "@/components/header";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { AuthProvider } from "@/hooks/use-auth-simple";
import { ProtectedRoute, RoleProtectedRoute } from "@/lib/protected-route";
import SmoochesFeed from "@/components/SmoochesFeed";

function Navigation() {
  return null; // Navigation now handled in header
}

function Router() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // More explicit check for first-time users
    const completed = localStorage.getItem('onboardingComplete');
    return completed === null || completed !== 'true';
  });
  const authContext = useAuth();
  const currentUser = authContext.user;

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);
  };

  // Only show onboarding if user is logged in but hasn't completed onboarding
  if (showOnboarding && currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </div>
    );
  }
  
  // If not authenticated, show landing page or auth page
  if (!currentUser) {
    return (
      <div className="min-h-screen">
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="/" component={LandingPage} />
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </div>
    );
  }
  
  // If authenticated, show the full application
  return (
    <div>
      <Header />
      <div className="pt-20">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/profile/:id" component={Profile} />
          <Route path="/profile" component={Profile} />
          <Route path="/live" component={Live} />
          <Route path="/radio" component={Radio} />
          <Route path="/settings" component={Settings} />
          <Route path="/monetization" component={MonetizationDashboard} />
          <Route path="/create" component={CreateContentPage} />
          <Route path="/auth">
            <Redirect to="/" />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="dark min-h-screen bg-background text-foreground">
          <Router />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
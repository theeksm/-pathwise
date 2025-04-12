import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChat from "@/components/AIChat";
import { AuthProvider } from "@/hooks/use-auth";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import CareerPath from "@/pages/CareerPath";
import SkillGap from "@/pages/SkillGap";
import ResumeOptimizer from "@/pages/ResumeOptimizer";
import JobMatching from "@/pages/JobMatching";
import MarketTrends from "@/pages/MarketTrends";
import EntrepreneurshipAdvisor from "@/pages/EntrepreneurshipAdvisor";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";
import AIChatPage from "@/pages/AIChat";

import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <>
      <Navbar />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/contact" component={Contact} />
          <Route path="/market-trends" component={MarketTrends} />
          
          {/* Protected routes - require authentication */}
          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <ProtectedRoute path="/career-path" component={CareerPath} />
          <ProtectedRoute path="/skill-gap" component={SkillGap} />
          <ProtectedRoute path="/resume-optimizer" component={ResumeOptimizer} />
          <ProtectedRoute path="/job-matching" component={JobMatching} />
          <ProtectedRoute path="/entrepreneurship" component={EntrepreneurshipAdvisor} />
          <ProtectedRoute path="/ai-chat" component={AIChatPage} />
          
          <Route component={NotFound} />
        </Switch>
      </main>
      <AIChat />
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChat from "@/components/AIChat";
import DevModePanel from "@/components/DevModePanel";
import { AuthProvider } from "@/hooks/use-auth";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import CareerPath from "@/pages/CareerPath";
import SkillGap from "@/pages/SkillGap";
import ResumeOptimizer from "@/pages/ResumeOptimizer";
import ResumeTemplates from "@/pages/ResumeTemplates";
import JobMatching from "@/pages/JobMatching";
import MarketTrends from "@/pages/MarketTrends";
import StockProfile from "@/pages/StockProfile";
import EntrepreneurshipAdvisor from "@/pages/EntrepreneurshipAdvisor";
import LearningPaths from "@/pages/LearningPaths";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";
import AIChatPage from "@/pages/AIChat";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

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
          <Route path="/stock/:symbol" component={StockProfile} />
          <Route path="/resume-templates" component={ResumeTemplates} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          
          {/* Protected routes - require authentication */}
          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <ProtectedRoute path="/career-path" component={CareerPath} />
          <ProtectedRoute path="/skill-gap" component={SkillGap} />
          <ProtectedRoute path="/resume-optimizer" component={ResumeOptimizer} />
          <ProtectedRoute path="/job-matching" component={JobMatching} />
          <ProtectedRoute path="/entrepreneurship" component={EntrepreneurshipAdvisor} />
          <ProtectedRoute path="/learning-paths" component={LearningPaths} />
          <ProtectedRoute path="/ai-chat" component={AIChatPage} />
          
          <Route component={NotFound} />
        </Switch>
      </main>
      <AIChat />
      <DevModePanel />
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

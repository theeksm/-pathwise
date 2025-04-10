import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChat from "@/components/AIChat";

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
import NotFound from "@/pages/not-found";
import AIChatPage from "@/pages/AIChat";

function Router() {
  return (
    <>
      <Navbar />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/career-path" component={CareerPath} />
          <Route path="/skill-gap" component={SkillGap} />
          <Route path="/resume-optimizer" component={ResumeOptimizer} />
          <Route path="/job-matching" component={JobMatching} />
          <Route path="/market-trends" component={MarketTrends} />
          <Route path="/entrepreneurship" component={EntrepreneurshipAdvisor} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/ai-chat" component={AIChatPage} />
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

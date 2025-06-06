import { useState, createElement } from "react";
import { Link, useLocation } from "wouter";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  BrainCircuit, 
  BookOpen, 
  FileText, 
  Briefcase, 
  Bot, 
  TrendingUp, 
  Rocket, 
  LayoutDashboard,
  ChevronDown,
  LogOut,
  User,
  Gift,
  Layers,
  GraduationCap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Logo from "@/assets/logo";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";

const features = [
  { icon: BrainCircuit, name: "Career Path Guidance", path: "/career-path" },
  { icon: BookOpen, name: "Skill Gap Analyzer", path: "/skill-gap" },
  { icon: FileText, name: "Resume Optimizer", path: "/resume-optimizer" },
  { icon: FileText, name: "Resume Templates", path: "/resume-templates" },
  { icon: Briefcase, name: "Job Matching", path: "/job-matching" },
  { icon: GraduationCap, name: "Learning Paths", path: "/learning-paths" },
  { icon: Bot, name: "AI Career Coach", path: "/ai-chat" },
  { icon: TrendingUp, name: "Market Trends", path: "/market-trends" },
  { icon: Rocket, name: "Entrepreneurship Advisor", path: "/entrepreneurship" },
  { icon: LayoutDashboard, name: "Dashboard", path: "/dashboard" },
];

const Navbar = () => {
  // Helper function to get feature descriptions for the dropdown menu
  const getFeatureDescription = (featureName: string): string => {
    switch (featureName) {
      case "Career Path Guidance":
        return "Discover personalized career paths based on your skills, interests, and goals.";
      case "Skill Gap Analyzer":
        return "Identify missing skills needed for your target career and get course recommendations.";
      case "Resume Optimizer":
        return "Get AI-powered suggestions to improve your resume and increase interview chances.";
      case "Resume Templates":
        return "Create professional resumes from templates with AI suggestions - completely free, no login required.";
      case "Job Matching":
        return "Find job opportunities that match your skills and experience with personalized scores.";
      case "AI Career Coach":
        return "Chat with our AI career coach for personalized guidance and advice.";
      case "Learning Paths":
        return "Track your courses, organize your learning journey, and develop new skills for your career.";
      case "Market Trends":
        return "Stay updated with the latest market trends and industry insights.";
      case "Entrepreneurship Advisor":
        return "Get guidance on starting your own business and entrepreneurial opportunities.";
      case "Dashboard":
        return "View your career progress, learning paths, and personalized recommendations.";
      default:
        return "Explore our AI-powered tools to advance your career.";
    }
  };
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Use our custom auth hook
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Logo className="h-8 w-auto text-primary-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">PathWise</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <div className={cn(
                  "inline-flex items-center px-1 pt-1 text-sm font-medium cursor-pointer",
                  isActive("/") 
                    ? "border-primary-500 border-b-2 text-gray-900 dark:text-white" 
                    : "text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                )}>
                  Home
                </div>
              </Link>
              
              <div className="relative group">
                <div className={cn(
                  "inline-flex items-center px-1 pt-1 text-sm font-medium cursor-pointer",
                  isActive(features.map(f => f.path).find(p => location.startsWith(p)) || "")
                    ? "border-primary-500 border-b-2 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                )}>
                  Features
                  <ChevronDown className="ml-1 h-4 w-4 stroke-1 group-hover:rotate-180 transition-transform duration-200" />
                </div>
                <div className="absolute left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                    {features.map((feature) => (
                      <Link key={feature.path} href={feature.path}>
                        <div className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                          {createElement(feature.icon, { className: "mr-2 h-4 w-4 text-blue-700 dark:text-blue-400 stroke-[2]" })}
                          {feature.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              <Link href="/resume-templates">
                <div className={cn(
                  "inline-flex items-center px-1 pt-1 text-sm font-medium cursor-pointer",
                  isActive("/resume-templates")
                    ? "border-primary-500 border-b-2 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                )}>
                  <span className="flex items-center">
                    Resume Templates
                    <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-colors border-blue-500/20 dark:border-blue-500/30">
                      Free
                    </Badge>
                  </span>
                </div>
              </Link>
              
              <Link href="/market-trends">
                <div className={cn(
                  "inline-flex items-center px-1 pt-1 text-sm font-medium cursor-pointer",
                  isActive("/market-trends")
                    ? "border-primary-500 border-b-2 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                )}>
                  Market Trends
                </div>
              </Link>
              
              <Link href="/pricing">
                <div className={cn(
                  "inline-flex items-center px-1 pt-1 text-sm font-medium cursor-pointer",
                  isActive("/pricing")
                    ? "border-primary-500 border-b-2 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                )}>
                  Pricing
                </div>
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <ThemeToggle />
            
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" className="text-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout} 
                  className="text-gray-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button style={{backgroundColor: "#1e3a8a", color: "white"}} className="text-white font-medium shadow-md hover:bg-blue-900">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col py-4">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={cn(
                      "px-4 py-2 text-base font-medium cursor-pointer",
                      isActive("/") 
                        ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700 dark:bg-gray-700 dark:text-white dark:border-blue-500" 
                        : "border-transparent text-gray-500 dark:text-gray-300"
                    )}>
                      Home
                    </div>
                  </Link>
                  
                  <div className="mt-4 mb-2">
                    <h3 className="px-4 text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Features</h3>
                  </div>
                  
                  {features.map((feature) => (
                    <Link key={feature.path} href={feature.path} onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={cn(
                        "px-4 py-2 text-base font-medium cursor-pointer",
                        isActive(feature.path) 
                          ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700 dark:bg-gray-700 dark:text-white dark:border-blue-500" 
                          : "border-transparent text-gray-500 dark:text-gray-300"
                      )}>
                        <span className="flex items-center">
                          {createElement(feature.icon, { className: "h-4 w-4 mr-2 text-blue-700 dark:text-blue-400 stroke-[2]" })}
                          {feature.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                  
                  <div className="mt-4">
                    <Link href="/resume-templates" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={cn(
                        "px-4 py-2 text-base font-medium cursor-pointer",
                        isActive("/resume-templates") 
                          ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700 dark:bg-gray-700 dark:text-white dark:border-blue-500" 
                          : "border-transparent text-gray-500 dark:text-gray-300"
                      )}>
                        <span className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-700 dark:text-blue-400 stroke-[2]" />
                          Resume Templates
                          <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 text-xs">
                            Free
                          </Badge>
                        </span>
                      </div>
                    </Link>
                    
                    <Link href="/market-trends" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={cn(
                        "px-4 py-2 text-base font-medium cursor-pointer",
                        isActive("/market-trends") 
                          ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700 dark:bg-gray-700 dark:text-white dark:border-blue-500" 
                          : "border-transparent text-gray-500 dark:text-gray-300"
                      )}>
                        Market Trends
                      </div>
                    </Link>
                    
                    <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={cn(
                        "px-4 py-2 text-base font-medium cursor-pointer",
                        isActive("/pricing") 
                          ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700 dark:bg-gray-700 dark:text-white dark:border-blue-500" 
                          : "border-transparent text-gray-500 dark:text-gray-300"
                      )}>
                        Pricing
                      </div>
                    </Link>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="px-4 mb-4 flex items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-300 mr-4">Theme</span>
                      <ThemeToggle />
                    </div>
                    
                    {user ? (
                      <div className="flex flex-col space-y-3 px-4">
                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                            <User className="mr-2 h-4 w-4" />
                            Dashboard
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleLogout();
                          }} 
                          className="w-full dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                          disabled={logoutMutation.isPending}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {logoutMutation.isPending ? "Logging out..." : "Logout"}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-3 px-4">
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700">Log in</Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button style={{backgroundColor: "#1e3a8a", color: "white"}} className="w-full text-white font-medium shadow-md hover:bg-blue-900">Sign up</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

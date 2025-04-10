import { useState, createElement } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
  LayoutDashboard 
} from "lucide-react";
import Logo from "@/assets/logo";
import { cn } from "@/lib/utils";

const features = [
  { icon: BrainCircuit, name: "Career Path Guidance", path: "/career-path" },
  { icon: BookOpen, name: "Skill Gap Analyzer", path: "/skill-gap" },
  { icon: FileText, name: "Resume Optimizer", path: "/resume-optimizer" },
  { icon: Briefcase, name: "Job Matching", path: "/job-matching" },
  { icon: Bot, name: "AI Career Coach", path: "/dashboard" },
  { icon: TrendingUp, name: "Market Trends", path: "/market-trends" },
  { icon: Rocket, name: "Entrepreneurship Advisor", path: "/entrepreneurship" },
  { icon: LayoutDashboard, name: "Dashboard", path: "/dashboard" },
];

const Navbar = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    refetchOnWindowFocus: false,
    throwOnError: false
  });

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Logo className="h-8 w-auto text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">PathWise</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={cn(
                  "inline-flex items-center px-1 pt-1 text-sm font-medium",
                  isActive("/") 
                    ? "border-primary-500 border-b-2 text-gray-900" 
                    : "text-gray-500 hover:text-gray-900"
                )}>
                  Home
                </a>
              </Link>
              
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={cn(
                      "h-auto px-1 pt-1 font-medium",
                      isActive(features.map(f => f.path).find(p => location.startsWith(p)) || "")
                        ? "text-gray-900"
                        : "text-gray-500"
                    )}>
                      Features
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[400px] p-2">
                        <div className="grid grid-cols-2 gap-2">
                          {features.map((feature) => (
                            <Link key={feature.path} href={feature.path}>
                              <NavigationMenuLink
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  isActive(feature.path) && "bg-accent"
                                )}
                              >
                                <div className="text-base font-medium leading-none flex items-center">
                                  {createElement(feature.icon, { className: "h-4 w-4 mr-2 text-primary-600 stroke-[1.5]" })}
                                  {feature.name}
                                </div>
                              </NavigationMenuLink>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              
              <Link href="/market-trends">
                <a className={cn(
                  "inline-flex items-center px-1 pt-1 text-sm font-medium",
                  isActive("/market-trends")
                    ? "border-primary-500 border-b-2 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                )}>
                  Market Trends
                </a>
              </Link>
              
              <Link href="/pricing">
                <a className={cn(
                  "inline-flex items-center px-1 pt-1 text-sm font-medium",
                  isActive("/pricing")
                    ? "border-primary-500 border-b-2 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                )}>
                  Pricing
                </a>
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <Link href="/dashboard">
                <Button variant="outline" className="text-gray-700">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-500">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col py-4">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <a className={cn(
                      "px-4 py-2 text-base font-medium",
                      isActive("/") ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700" : "border-transparent text-gray-500"
                    )}>
                      Home
                    </a>
                  </Link>
                  
                  <div className="mt-4 mb-2">
                    <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Features</h3>
                  </div>
                  
                  {features.map((feature) => (
                    <Link key={feature.path} href={feature.path} onClick={() => setIsMobileMenuOpen(false)}>
                      <a className={cn(
                        "px-4 py-2 text-base font-medium",
                        isActive(feature.path) 
                          ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700" 
                          : "border-transparent text-gray-500"
                      )}>
                        <span className="flex items-center">
                          {createElement(feature.icon, { className: "h-4 w-4 mr-2 text-primary-600 stroke-[1.5]" })}
                          {feature.name}
                        </span>
                      </a>
                    </Link>
                  ))}
                  
                  <div className="mt-4">
                    <Link href="/market-trends" onClick={() => setIsMobileMenuOpen(false)}>
                      <a className={cn(
                        "px-4 py-2 text-base font-medium",
                        isActive("/market-trends") 
                          ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700" 
                          : "border-transparent text-gray-500"
                      )}>
                        Market Trends
                      </a>
                    </Link>
                    
                    <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
                      <a className={cn(
                        "px-4 py-2 text-base font-medium",
                        isActive("/pricing") 
                          ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700" 
                          : "border-transparent text-gray-500"
                      )}>
                        Pricing
                      </a>
                    </Link>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {user ? (
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full">Dashboard</Button>
                      </Link>
                    ) : (
                      <div className="flex flex-col space-y-3 px-4">
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">Log in</Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full">Sign up</Button>
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

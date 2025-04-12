import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";
import { 
  BrainCircuit, 
  BookOpen, 
  FileText, 
  Briefcase, 
  Bot, 
  TrendingUp, 
  Rocket, 
  LayoutDashboard 
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "Career Path Guidance",
    description: "Discover personalized career paths based on your skills and interests.",
    path: "/career-path"
  },
  {
    icon: BookOpen,
    title: "Skill Gap Analyzer",
    description: "Identify missing skills and get personalized learning recommendations.",
    path: "/skill-gap"
  },
  {
    icon: FileText,
    title: "Resume Optimizer",
    description: "Improve your resume with AI-powered suggestions and tips.",
    path: "/resume-optimizer"
  },
  {
    icon: Briefcase,
    title: "Job Matching",
    description: "Find jobs that match your profile with personalized recommendations.",
    path: "/job-matching"
  },
  {
    icon: Bot,
    title: "AI Career Coach",
    description: "Get personalized career advice and guidance from our AI assistant.",
    path: "/dashboard"
  },
  {
    icon: TrendingUp,
    title: "Market Trends",
    description: "Stay updated with the latest market trends and industry insights.",
    path: "/market-trends"
  },
  {
    icon: Rocket,
    title: "Entrepreneurship Advisor",
    description: "Get guidance on starting your own business or freelance career.",
    path: "/entrepreneurship"
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Track your career progress and goals in one centralized place.",
    path: "/dashboard"
  }
];

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">Find Your Future</span>
                <span className="block text-primary-600 dark:text-blue-400">with AI</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Let smart tech guide you to the right career
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 home-hero">
                <Link href="/career-path">
                  <Button 
                    style={{backgroundColor: "#1d4ed8", color: "white"}} 
                    className="px-5 py-3 text-base font-semibold shadow-md hover:bg-blue-800" 
                    size="lg"
                  >
                    Start My Career Journey
                  </Button>
                </Link>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  PathWise is an AI-powered career advisor that helps you discover your ideal career path, analyze your current skills, and connect with real job opportunities.
                </p>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <img 
                    className="w-full relative z-10 object-cover opacity-100 !visible"
                    style={{
                      filter: 'contrast(120%) brightness(100%)',
                      display: 'block',
                      visibility: 'visible !important',
                      opacity: '1 !important',
                      pointerEvents: 'auto',
                      height: '300px',
                      objectFit: 'cover'
                    }}
                    src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                    alt="Professional data analytics dashboard" 
                  />
                  <div className="absolute inset-0 z-20 bg-gradient-to-r from-primary-600 to-primary-800 mix-blend-multiply opacity-30 dark:mix-blend-soft-light dark:opacity-40"></div>
                  <Button
                    variant="ghost"
                    className="absolute inset-0 z-30 w-full h-full flex items-center justify-center text-white hover:bg-transparent dark:hover:bg-gray-800/30"
                  >
                    <svg className="h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-50 dark:bg-gray-800 py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              All the tools you need for your career journey
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              Our AI-powered platform provides everything you need to plan, develop, and succeed in your career.
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                path={feature.path}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

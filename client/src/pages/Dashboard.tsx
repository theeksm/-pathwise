import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  XCircle,
  Brain,
  BookOpen,
  FileText,
  Briefcase,
  Bot,
  TrendingUp,
  Rocket,
  LayoutDashboard,
  Settings,
  Share2,
  Edit,
} from "lucide-react";

const Dashboard = () => {
  // Define types for expected data
  interface User {
    id: number;
    username: string;
    fullName?: string;
    email: string;
  }

  interface Career {
    id: number;
    userId: number;
    careerTitle: string;
    description: string;
    fitScore: number;
    createdAt: string;
  }

  interface Skill {
    id: number;
    userId: number;
    skillName: string;
    category: string;
    proficiency?: number;
    isMissing: boolean;
    createdAt: string;
  }

  interface Resume {
    id: number;
    userId: number;
    content: string;
    optimizedContent?: string;
    createdAt: string;
  }

  interface Job {
    id: number;
    userId: number;
    jobTitle: string;
    company: string;
    description: string;
    matchPercentage: number;
    isSaved: boolean;
    createdAt: string;
  }

  interface LearningPath {
    id: number;
    userId: number;
    title: string;
    description: string;
    steps: string[];
    createdAt: string;
  }

  const { data: user, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    throwOnError: false,
  });

  const { data: careers, isLoading: isCareersLoading } = useQuery<Career[]>({
    queryKey: ['/api/careers'],
    enabled: !!user,
    throwOnError: false,
  });

  const { data: skills, isLoading: isSkillsLoading } = useQuery<Skill[]>({
    queryKey: ['/api/skills'],
    enabled: !!user,
    throwOnError: false,
  });

  const { data: resumes, isLoading: isResumesLoading } = useQuery<Resume[]>({
    queryKey: ['/api/resumes'],
    enabled: !!user,
    throwOnError: false,
  });

  const { data: jobs, isLoading: isJobsLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
    enabled: !!user,
    throwOnError: false,
  });

  const { data: learningPaths, isLoading: isLearningPathsLoading } = useQuery<LearningPath[]>({
    queryKey: ['/api/learning-paths'],
    enabled: !!user,
    throwOnError: false,
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign in to access your dashboard</h2>
        <p className="text-gray-600 mb-8 text-center">
          You need to be logged in to view your career progress and use the dashboard features.
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button>Log in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">Sign up</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLoading = isUserLoading || isCareersLoading || isSkillsLoading || isResumesLoading || isJobsLoading || isLearningPathsLoading;
  const completed = skills?.filter(s => !s.isMissing)?.length || 0;
  const total = skills?.length || 0;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const hasResume = resumes && resumes.length > 0;
  const resumeStatus = hasResume ? "Optimized ✅" : "Needs Work ❌";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left sidebar */}
        <div className="md:col-span-1">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-2xl font-bold mb-2">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
                </div>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 mt-2">
                  <Edit className="h-4 w-4" />
                  Edit profile
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 mt-1">
                  <Share2 className="h-4 w-4" />
                  Share your profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick panel</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {/* Using standard <li> elements with onClick handlers instead of nested Link components */}
                <li 
                  className="flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => window.location.href = "/career-path"}
                >
                  <Brain className="mr-3 h-5 w-5 text-primary-500" />
                  <span>Career Path Finder</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      window.location.href = "/career-path";
                    }}
                  >
                    View
                  </Button>
                </li>
                <li 
                  className="flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => window.location.href = "/skill-gap"}
                >
                  <BookOpen className="mr-3 h-5 w-5 text-primary-500" />
                  <span>Skill Gap Analyzer</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      window.location.href = "/skill-gap";
                    }}
                  >
                    Update
                  </Button>
                </li>
                <li 
                  className="flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => window.location.href = "/resume-optimizer"}
                >
                  <FileText className="mr-3 h-5 w-5 text-primary-500" />
                  <span>Resume Optimizer</span>
                </li>
                <li 
                  className="flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => window.location.href = "/job-matching"}
                >
                  <Briefcase className="mr-3 h-5 w-5 text-primary-500" />
                  <span>Job Matches</span>
                </li>
                <li 
                  className="flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => window.location.href = "/ai-chat"}
                >
                  <Bot className="mr-3 h-5 w-5 text-primary-500" />
                  <span>AI Career Coach</span>
                </li>
                <li 
                  className="flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => window.location.href = "/market-trends"}
                >
                  <TrendingUp className="mr-3 h-5 w-5 text-primary-500" />
                  <span>Market Trends</span>
                </li>
                <li 
                  className="flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => window.location.href = "/entrepreneurship"}
                >
                  <Rocket className="mr-3 h-5 w-5 text-primary-500" />
                  <span>Entrepreneurship Advisor</span>
                </li>
                <li 
                  className="flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => window.location.href = "/dashboard"}
                >
                  <LayoutDashboard className="mr-3 h-5 w-5 text-primary-500" />
                  <span>Career Plan Dashboard</span>
                </li>
                <li 
                  className="flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => window.location.href = "/profile"}
                >
                  <Settings className="mr-3 h-5 w-5 text-primary-500" />
                  <span>Profile & Preferences</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:col-span-2">
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Hi {user?.fullName || user?.username}, welcome back to your career journey.
                  </h2>
                  <p className="text-gray-600 mt-1">• Progress Summary:</p>
                </div>
                <div className="mt-4 md:mt-0 text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  {completionPercentage}% completed
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Career Path</h3>
                    {isLoading ? (
                      <Skeleton className="h-16 w-full" />
                    ) : careers && careers.length > 0 ? (
                      <ul className="space-y-1">
                        {careers.slice(0, 1).map((career) => (
                          <li key={career.id} className="text-sm text-gray-700">
                            {career.careerTitle}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Link href="/career-path">
                        <span className="text-primary-600 hover:underline text-sm cursor-pointer">
                          Click here to fill in your information
                        </span>
                      </Link>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Skill Gap Progress</h3>
                    {isLoading ? (
                      <Skeleton className="h-4 w-full mb-2" />
                    ) : (
                      <Progress value={completionPercentage} className="h-2 mb-2" />
                    )}
                    <div className="text-xs text-gray-600 flex justify-between">
                      <span>{completed} skills acquired</span>
                      <span>{total - completed} skills to learn</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Resume Status</h3>
                    {isLoading ? (
                      <Skeleton className="h-6 w-full" />
                    ) : (
                      <div className="flex items-center">
                        <span className="text-sm">{resumeStatus}</span>
                        {hasResume ? (
                          <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="ml-2 h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Job Matches</h3>
                    {isLoading ? (
                      <Skeleton className="h-16 w-full" />
                    ) : jobs && jobs.length > 0 ? (
                      <>
                        <p className="text-sm font-medium text-primary-700 mb-1">📈 Business & Marketing</p>
                        <ul className="text-sm text-gray-700 space-y-1 pl-4 list-disc">
                          {jobs.slice(0, 3).map((job) => (
                            <li key={job.id}>{job.jobTitle}</li>
                          ))}
                        </ul>
                        <Link href="/job-matching">
                          <span className="text-primary-600 hover:underline text-xs mt-2 inline-block cursor-pointer">
                            Read more
                          </span>
                        </Link>
                      </>
                    ) : (
                      <Link href="/job-matching">
                        <span className="text-primary-600 hover:underline text-sm cursor-pointer">
                          Find matching jobs
                        </span>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  <span>My Career Path</span>
                </CardTitle>
                <p className="text-sm text-gray-600">View or update selected career goals</p>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoading ? (
                  <>
                    <Skeleton className="h-12 w-full mb-4" />
                    <Skeleton className="h-12 w-full" />
                  </>
                ) : careers && careers.length > 0 ? (
                  <div className="space-y-4">
                    {careers.map((career) => (
                      <div key={career.id} className="border p-4 rounded-md">
                        <h4 className="font-medium">{career.careerTitle}</h4>
                        <p className="text-sm text-gray-600 mt-1">{career.description}</p>
                        <div className="mt-2 text-sm">
                          <span className="text-gray-700">Fit score: </span>
                          <span className="font-medium">{career.fitScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">No career paths defined yet</p>
                    <Link href="/career-path">
                      <Button>Discover Career Paths</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  <span>Skill Progress Tracker</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoading ? (
                  <>
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-6 w-full mb-2" />
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Shows current skills</h4>
                      {skills?.filter(s => !s.isMissing)?.length > 0 ? (
                        <ul className="space-y-1 pl-4 list-disc">
                          {skills
                            .filter(s => !s.isMissing)
                            .slice(0, 3)
                            .map(skill => (
                              <li key={skill.id} className="text-sm text-gray-700">
                                {skill.skillName}
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">- No skills added yet</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Target skills</h4>
                      {skills?.filter(s => s.isMissing)?.length > 0 ? (
                        <ul className="space-y-1 pl-4 list-disc">
                          {skills
                            .filter(s => s.isMissing)
                            .slice(0, 3)
                            .map(skill => (
                              <li key={skill.id} className="text-sm text-gray-700">
                                {skill.skillName}
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">- No target skills identified</p>
                      )}
                    </div>

                    <div className="pt-2">
                      <Link href="/skill-gap">
                        <Button className="w-full">Continue learning</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  <span>Resume Optimizer</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  {hasResume ? (
                    <>
                      <div className="flex-1">
                        <Button variant="outline" className="mr-4">View Resume</Button>
                      </div>
                      <div className="flex-1">
                        <div className="bg-primary-50 p-4 rounded-md">
                          <h4 className="font-medium text-primary-700 mb-2">AI generated</h4>
                          <p className="text-sm text-gray-700">
                            Your resume has been optimized with AI. You can view, edit, or download it anytime.
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 text-right">
                        <Button>Chat with AI</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <Link href="/resume-optimizer">
                          <Button>Upload resume</Button>
                        </Link>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-sm text-gray-600">No resume uploaded yet</p>
                      </div>
                      <div className="flex-1 text-right">
                        <Button variant="outline">Edit</Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

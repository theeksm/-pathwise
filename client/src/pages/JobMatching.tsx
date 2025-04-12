import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Briefcase, 
  Building, 
  DollarSign, 
  MapPin, 
  BookmarkPlus, 
  Send, 
  Filter, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  LucideIcon,
  GraduationCap,
  Laptop,
  Home,
  Building2,
  Lightbulb,
  AreaChart,
  ArrowUpRight
} from "lucide-react";

const formSchema = z.object({
  skills: z.string().min(2, {
    message: "Please enter at least one skill",
  }),
  experience: z.string().optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  minSalary: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// Define JobMatch interface with advanced matching features
interface JobMatch {
  id: number;
  userId: number;
  jobTitle: string;
  company: string;
  description: string;
  matchPercentage: number;
  matchTier?: string; // 'Excellent Match', 'Strong Match', etc.
  salary: string;
  location: string;
  isSaved: boolean;
  createdAt: string;
  url?: string;
  matchReasons?: string[];
  requiredSkills?: string[];
  userSkillMatch?: string[];
  skillGaps?: string[];
  skillMatchCount?: number;
  skillGapCount?: number;
  growthPotential?: string;
  industryTrends?: string;
  remoteType?: 'remote' | 'hybrid' | 'on-site';
  applicationStatus?: string;
  developmentPlan?: {
    prioritySkills: string[];
    certifications: string[];
    experienceBuilding: string[];
  };
  careerProgression?: {
    nextRoles: string[];
    timelineEstimate: string;
  };
}

const JobMatching = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobMatch[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Define interfaces for TypeScript type safety
  interface UserSkill {
    id: number;
    skillName: string;
    category: string;
    proficiency?: number;
    isMissing: boolean;
  }

  interface UserProfile {
    id: number;
    experience?: string;
    [key: string]: any;
  }

  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    throwOnError: false,
  });

  const { data: userProfile, isLoading: isProfileLoading } = useQuery<UserProfile>({
    queryKey: ['/api/user'],
    enabled: !!user,
    throwOnError: false,
  });

  const { data: userSkills, isLoading: isSkillsLoading } = useQuery<UserSkill[]>({
    queryKey: ['/api/skills'],
    enabled: !!user,
    throwOnError: false,
  });

  const { data: savedJobs, isLoading: isSavedJobsLoading } = useQuery({
    queryKey: ['/api/jobs', { saved: true }],
    enabled: !!user,
    throwOnError: false,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skills: "",
      experience: "",
      location: "",
      remote: false,
      minSalary: "",
    },
  });

  const jobMatchMutation = useMutation({
    mutationFn: async (data: {
      userSkills: string[];
      userExperience?: string;
      preferences?: {
        location?: string;
        remote?: boolean;
        minSalary?: number;
      };
    }) => {
      const res = await apiRequest("POST", "/api/jobs/match", data);
      return res.json();
    },
    onSuccess: (data) => {
      setJobs(data);
      setFilteredJobs(data);
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({
        title: "Job matching complete",
        description: `Found ${data.length} jobs that match your profile!`,
      });
      setIsMatching(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error matching jobs",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      setIsMatching(false);
    },
  });

  const saveJobMutation = useMutation({
    mutationFn: async ({ jobId, isSaved }: { jobId: number; isSaved: boolean }) => {
      const res = await apiRequest("PATCH", `/api/jobs/${jobId}`, { isSaved });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs', { saved: true }] });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving job",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to use this feature",
        variant: "destructive",
      });
      return;
    }

    setIsMatching(true);
    
    // Parse skills comma-separated values into arrays
    const skills = data.skills.split(',').map(s => s.trim()).filter(s => s);
    
    // Prepare preferences object
    const preferences: {
      location?: string;
      remote?: boolean;
      minSalary?: number;
    } = {};
    
    if (data.location) preferences.location = data.location;
    if (data.remote !== undefined) preferences.remote = data.remote;
    if (data.minSalary) preferences.minSalary = parseInt(data.minSalary);
    
    jobMatchMutation.mutate({
      userSkills: skills,
      userExperience: data.experience,
      preferences: Object.keys(preferences).length > 0 ? preferences : undefined
    });
  };

  const toggleSaveJob = (jobId: number, currentlySaved: boolean) => {
    saveJobMutation.mutate({
      jobId,
      isSaved: !currentlySaved
    });

    // Optimistic update for better UX
    const updatedJobs = jobs.map(job => 
      job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
    );
    setJobs(updatedJobs);
    setFilteredJobs(updatedJobs);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'all') {
      setFilteredJobs(jobs);
    } else if (value === 'saved') {
      setFilteredJobs(jobs.filter(job => job.isSaved));
    }
  };

  // Fill form with user's existing skills when they load
  const initializeForm = () => {
    if (userSkills && userSkills.length > 0 && !form.getValues("skills")) {
      const skillsValue = userSkills
        .filter(skill => !skill.isMissing)
        .map(skill => skill.skillName)
        .join(', ');
      form.setValue("skills", skillsValue);
    }
    
    if (userProfile) {
      if (userProfile.experience) form.setValue("experience", userProfile.experience);
    }
  };

  // Call initialization when user data loads
  if (userSkills && userProfile && form.getValues("skills") === "") {
    initializeForm();
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign in to match with jobs</h2>
        <p className="text-gray-600 mb-8 text-center">
          You need to be logged in to find jobs that match your skills and preferences
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <a href="/login">Log in</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/signup">Sign up</a>
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = isProfileLoading || isSkillsLoading || isSavedJobsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Find Your Perfect Career Match
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
          Discover jobs that align with your skills, experience, and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Job Matching Criteria</CardTitle>
            <CardDescription>
              Tell us about your skills and preferences to find matching jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your skills</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. Python, Marketing, React... (comma-separated)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        List your key skills to find matching jobs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Entry-level">Entry-level</SelectItem>
                          <SelectItem value="Mid-level">Mid-level</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Director">Director</SelectItem>
                          <SelectItem value="Executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <p className="text-sm font-medium">Preferences (optional)</p>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. New York, Remote, etc." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="remote"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Remote only</FormLabel>
                        <FormDescription>
                          Show only remote positions
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="minSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum salary (annual)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 50000" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isMatching}
                >
                  {isMatching ? "Finding matches..." : "Find Matching Jobs"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="bg-primary-50">
              <div className="flex justify-between items-center">
                <CardTitle>Job Matches</CardTitle>
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardDescription>
                Jobs that match your skills and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading || isMatching ? (
                <div className="space-y-6">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="space-y-6">
                  {filteredJobs.map((job) => (
                    <Card key={job.id} className="overflow-hidden">
                      <div className="relative">
                        <CardContent className="p-6">
                          {/* Header with job title, company, match percentage and match tier */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{job.jobTitle}</h3>
                              <div className="flex items-center mt-1 text-gray-700">
                                <Building className="h-4 w-4 mr-1" />
                                <span className="text-sm">{job.company}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <Badge 
                                className={`border-0 ${
                                  job.matchPercentage >= 85 ? "bg-green-100 text-green-800" : 
                                  job.matchPercentage >= 70 ? "bg-blue-100 text-blue-800" : 
                                  job.matchPercentage >= 50 ? "bg-amber-100 text-amber-800" : 
                                  "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {job.matchPercentage}% Match
                              </Badge>
                              {job.matchTier && (
                                <span className="text-xs text-gray-500 mt-1">{job.matchTier}</span>
                              )}
                            </div>
                          </div>

                          {/* Job description */}
                          <p className="mt-4 text-sm text-gray-600">{job.description}</p>

                          {/* Job details (location, salary, remote type) */}
                          <div className="flex flex-wrap gap-4 mt-4">
                            <div className="flex items-center text-gray-700">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="text-sm">{job.location}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span className="text-sm">{job.salary}</span>
                            </div>
                            {job.remoteType && (
                              <div className="flex items-center text-gray-700">
                                {job.remoteType === 'remote' ? (
                                  <Home className="h-4 w-4 mr-1" />
                                ) : job.remoteType === 'hybrid' ? (
                                  <Laptop className="h-4 w-4 mr-1" />
                                ) : (
                                  <Building2 className="h-4 w-4 mr-1" />
                                )}
                                <span className="text-sm capitalize">{job.remoteType}</span>
                              </div>
                            )}
                          </div>

                          {/* Expandable sections for detailed job information */}
                          {(job.matchReasons && job.matchReasons.length > 0 || 
                            job.requiredSkills && job.requiredSkills.length > 0 || 
                            job.userSkillMatch && job.userSkillMatch.length > 0 || 
                            job.skillGaps && job.skillGaps.length > 0 || 
                            job.growthPotential || job.industryTrends) && (
                            <div className="mt-5">
                              <Tabs defaultValue="match">
                                <TabsList className="w-full">
                                  <TabsTrigger value="match" className="flex-1">Why It's a Match</TabsTrigger>
                                  <TabsTrigger value="skills" className="flex-1">Skills Analysis</TabsTrigger>
                                  <TabsTrigger value="growth" className="flex-1">Growth & Trends</TabsTrigger>
                                </TabsList>
                                
                                {/* Tab 1: Match Reasons */}
                                <TabsContent value="match" className="pt-4">
                                  {job.matchReasons && job.matchReasons.length > 0 ? (
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-medium text-gray-900">Why this job matches your profile:</h4>
                                      <ul className="list-disc pl-5 space-y-1">
                                        {job.matchReasons && job.matchReasons.map((reason, idx) => (
                                          <li key={idx} className="text-sm text-gray-600">{reason}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 italic">No specific match information available</p>
                                  )}
                                </TabsContent>
                                
                                {/* Tab 2: Skills Analysis */}
                                <TabsContent value="skills" className="pt-4">
                                  <div className="space-y-4">
                                    {/* Skill Match Visualization */}
                                    <div className="mb-6">
                                      <h4 className="text-sm font-medium text-gray-900 mb-3">Skill Compatibility</h4>
                                      <div className="flex items-center gap-3">
                                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ 
                                              width: `${
                                                job.skillMatchCount && job.skillGapCount 
                                                  ? (job.skillMatchCount / (job.skillMatchCount + job.skillGapCount) * 100) 
                                                  : 0
                                              }%` 
                                            }}
                                          ></div>
                                        </div>
                                        <div className="text-xs text-gray-600 whitespace-nowrap">
                                          {job.skillMatchCount || 0} matched / {job.skillGapCount || 0} to develop
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {job.requiredSkills && job.requiredSkills.map((skill, idx) => (
                                            <Badge key={idx} variant="outline" className="bg-gray-50">
                                              {skill}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {job.userSkillMatch && job.userSkillMatch.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Your Matching Skills:</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {job.userSkillMatch && job.userSkillMatch.map((skill, idx) => (
                                            <Badge key={idx} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                              {skill}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {job.skillGaps && job.skillGaps.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Skills to Develop:</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {job.skillGaps && job.skillGaps.map((skill, idx) => (
                                            <Badge key={idx} variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                                              <GraduationCap className="h-3 w-3 mr-1" />
                                              {skill}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Development Plan */}
                                    {job.developmentPlan && (job.developmentPlan.prioritySkills?.length > 0 || 
                                                          job.developmentPlan.certifications?.length > 0 || 
                                                          job.developmentPlan.experienceBuilding?.length > 0) && (
                                      <div className="mt-5 p-3 bg-blue-50 rounded-md border border-blue-100">
                                        <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                                          <Lightbulb className="h-4 w-4 mr-1" />
                                          Personalized Development Plan
                                        </h4>
                                        
                                        {job.developmentPlan.prioritySkills?.length > 0 && (
                                          <div className="mb-2">
                                            <h5 className="text-xs font-medium text-blue-700">Priority Skills:</h5>
                                            <ul className="list-disc pl-5 text-xs text-blue-600 mt-1">
                                              {job.developmentPlan.prioritySkills.map((skill, idx) => (
                                                <li key={idx}>{skill}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        
                                        {job.developmentPlan.certifications?.length > 0 && (
                                          <div className="mb-2">
                                            <h5 className="text-xs font-medium text-blue-700">Recommended Certifications:</h5>
                                            <ul className="list-disc pl-5 text-xs text-blue-600 mt-1">
                                              {job.developmentPlan.certifications.map((cert, idx) => (
                                                <li key={idx}>{cert}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        
                                        {job.developmentPlan.experienceBuilding?.length > 0 && (
                                          <div>
                                            <h5 className="text-xs font-medium text-blue-700">Experience Building:</h5>
                                            <ul className="list-disc pl-5 text-xs text-blue-600 mt-1">
                                              {job.developmentPlan.experienceBuilding.map((exp, idx) => (
                                                <li key={idx}>{exp}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>
                                
                                {/* Tab 3: Growth Potential & Industry Trends */}
                                <TabsContent value="growth" className="pt-4">
                                  <div className="space-y-4">
                                    {job.growthPotential && (
                                      <div>
                                        <div className="flex items-center mb-2">
                                          <TrendingUp className="h-4 w-4 mr-2 text-primary-600" />
                                          <h4 className="text-sm font-medium text-gray-900">Growth Potential</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">{job.growthPotential}</p>
                                      </div>
                                    )}
                                    
                                    {job.industryTrends && (
                                      <div>
                                        <div className="flex items-center mb-2">
                                          <AlertCircle className="h-4 w-4 mr-2 text-primary-600" />
                                          <h4 className="text-sm font-medium text-gray-900">Industry Trends</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">{job.industryTrends}</p>
                                      </div>
                                    )}
                                    
                                    {/* Career Progression Path */}
                                    {job.careerProgression && (job.careerProgression.nextRoles?.length > 0 || job.careerProgression.timelineEstimate) && (
                                      <div className="mt-5 p-4 bg-green-50 rounded-md border border-green-100">
                                        <div className="flex items-center mb-3">
                                          <MapIcon className="h-4 w-4 mr-2 text-green-700" />
                                          <h4 className="text-sm font-medium text-green-800">Career Progression Path</h4>
                                        </div>
                                        
                                        {job.careerProgression.nextRoles?.length > 0 && (
                                          <div className="mb-4">
                                            <h5 className="text-xs font-medium text-green-700 mb-2">Future Career Path:</h5>
                                            <div className="flex items-center relative">
                                              <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center z-10">
                                                <Briefcase className="h-4 w-4 text-green-700" />
                                              </div>
                                              <div className="h-0.5 bg-green-200 w-full absolute left-4 top-1/2 -translate-y-1/2"></div>
                                              {job.careerProgression.nextRoles.map((role, idx) => (
                                                <div key={idx} className="z-10 ml-4 first:ml-6">
                                                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                                    <ArrowUpRight className="h-4 w-4 text-green-700" />
                                                  </div>
                                                  <span className="text-xs text-green-700 block text-center mt-1 w-16 -ml-4">{role}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {job.careerProgression.timelineEstimate && (
                                          <div className="ml-2">
                                            <h5 className="text-xs font-medium text-green-700 mb-1">Estimated Timeline:</h5>
                                            <p className="text-xs text-green-600">{job.careerProgression.timelineEstimate}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex items-center justify-between mt-6">
                            <Button
                              variant={job.isSaved === true ? "outline" : "default"}
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => toggleSaveJob(job.id, job.isSaved === true)}
                            >
                              <BookmarkPlus className="h-4 w-4" />
                              {job.isSaved === true ? "Saved" : "Save"}
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => window.open(job.url || "#", "_blank")}
                            >
                              <Send className="h-4 w-4" />
                              Apply
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 max-w-md mb-6">
                    Fill out your skills and preferences, then click "Find Matching Jobs" to discover opportunities that match your profile.
                  </p>
                  <img 
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                    alt="Job search" 
                    className="rounded-lg w-64 h-auto opacity-50"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobMatching;

import React, { useState } from "react";
import { Link } from "wouter";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import SkillButton from "@/components/SkillButton";
import CourseCard from "@/components/CourseCard";
import { 
  MonitorSmartphone, 
  TrendingUp, 
  Palette, 
  Brain, 
  Building2,
  Puzzle,
  Target,
  BarChart,
  GraduationCap,
  Clock,
  BookOpen,
  CheckCircle
} from "lucide-react";

const formSchema = z.object({
  targetCareer: z.string().min(2, {
    message: "Please enter a target career",
  }),
});

type FormData = z.infer<typeof formSchema>;

// Define skill categories
const skillCategories = [
  {
    id: "tech",
    name: "Tech & Data",
    icon: MonitorSmartphone,
    skills: ["Python", "HTML/CSS", "JavaScript", "SQL", "Java", "C++", "Git/GitHub", "Data Analysis", "Machine Learning", "Excel", "Power BI"]
  },
  {
    id: "business",
    name: "Business & Marketing",
    icon: TrendingUp,
    skills: ["Market Research", "SEO", "Accounting", "Google Ads", "Email Marketing", "Social Media Management", "Content Writing", "Public Speaking", "Business Strategy", "Financial Modeling", "Microsoft Excel"]
  },
  {
    id: "creative",
    name: "Creative & Design",
    icon: Palette,
    skills: ["Graphic Design", "Adobe Photoshop", "Adobe Illustrator", "Canva", "Video Editing", "Animation", "Branding"]
  },
  {
    id: "soft",
    name: "Soft & Transferable Skills",
    icon: Brain,
    skills: ["Critical Thinking", "Problem Solving", "Teamwork", "Leadership", "Communication", "Time Management", "Adaptability", "Attention to Detail", "Project Management"]
  },
  {
    id: "admin",
    name: "Admin & Office",
    icon: Building2,
    skills: ["Microsoft Word", "Microsoft PowerPoint", "Google Docs", "Calendar Management", "Data Entry", "Report Writing", "Email Communication"]
  }
];

const SkillGap = () => {
  const { toast } = useToast();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("manual");
  const [results, setResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    throwOnError: false,
  });

  const { data: userSkills } = useQuery({
    queryKey: ['/api/skills'],
    enabled: !!user,
    throwOnError: false,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetCareer: "",
    },
  });

  const skillGapMutation = useMutation({
    mutationFn: async (data: {
      currentSkills: string[];
      targetCareer: string;
    }) => {
      const res = await apiRequest("POST", "/api/skills/analyze-gap", data);
      return res.json();
    },
    onSuccess: (data) => {
      setResults(data.analysis);
      queryClient.invalidateQueries({ queryKey: ['/api/skills'] });
      queryClient.invalidateQueries({ queryKey: ['/api/learning-paths'] });
      toast({
        title: "Skill gap analysis complete",
        description: "We've identified skills you need for your target career!",
      });
      setIsAnalyzing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error analyzing skill gap",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    },
  });

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const onSubmit = (formData: FormData) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to use this feature",
        variant: "destructive",
      });
      return;
    }

    if (selectedSkills.length === 0) {
      toast({
        title: "No skills selected",
        description: "Please select at least one skill you already have",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    skillGapMutation.mutate({
      currentSkills: selectedSkills,
      targetCareer: formData.targetCareer
    });
  };

  // Initialize selectedSkills with user's existing skills when they load
  const initializeSelectedSkills = () => {
    if (userSkills && userSkills.length > 0 && selectedSkills.length === 0) {
      const existingSkills = userSkills
        .filter(skill => !skill.isMissing)
        .map(skill => skill.skillName);
      setSelectedSkills(existingSkills);
    }
  };

  // Call initialization when user skills load
  if (userSkills && selectedSkills.length === 0) {
    initializeSelectedSkills();
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Mind the Gap — Build the Skills You Need
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
            See what skills you're missing for your dream job and get personalized learning suggestions
          </p>
        </div>
        
        {/* Feature presentation for non-logged-in users */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-10">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="text-primary-600 p-3 bg-primary-50 rounded-full">
                <BookOpen className="h-10 w-10 stroke-[1.5]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Skill Gap Analyzer</h2>
            <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
              Our AI-powered Skill Gap Analyzer helps you identify the exact skills you need to develop 
              for your target career. Get personalized learning paths and course recommendations tailored to your needs.
            </p>
            
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-8">
              {skillCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-lg border p-5 flex items-start space-x-4">
                  <div className="text-primary-600 flex-shrink-0">
                    {React.createElement(category.icon, { size: 22, className: "stroke-[1.5]" })}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{category.skills.slice(0, 3).join(", ")} and more...</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-6 font-medium">
                Sign in to analyze your skills and get personalized recommendations
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Example results preview */}
        <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
              <BarChart className="w-5 h-5 mr-1.5 text-primary-600" />
              <span>Example Skill Gap Analysis</span>
            </h3>
            <p className="text-gray-600 mb-6 italic">
              Here's an example of what your personalized skill gap analysis might look like
            </p>
            <div className="bg-white rounded-lg shadow p-4 opacity-70 pointer-events-none select-none">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                alt="Example skill gap analysis" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Mind the Gap — Build the Skills You Need
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
          See what skills you're missing for your dream job and get personalized learning suggestions
        </p>
      </div>

      <Card className="mb-10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Skill Gap Analyzer</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="manual" className="px-4 py-2">
                Manual input
              </TabsTrigger>
              <TabsTrigger value="resume" className="px-4 py-2">
                Upload Resume
              </TabsTrigger>
              <TabsTrigger value="linkedin" className="px-4 py-2">
                Import LinkedIn
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-8">
              {skillCategories.map((category) => (
                <div key={category.id} className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <span className="mr-2 text-primary-600">
                      {React.createElement(category.icon, { size: 20, className: "stroke-[1.5]" })}
                    </span>
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <SkillButton
                        key={skill}
                        name={skill}
                        selected={selectedSkills.includes(skill)}
                        onClick={() => toggleSkill(skill)}
                      />
                    ))}
                    <Button variant="outline" className="px-4 py-2 rounded-full text-sm font-medium">
                      + Add more
                    </Button>
                  </div>
                </div>
              ))}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="targetCareer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-medium">Your target career</FormLabel>
                        <FormControl>
                          <Input placeholder="Type your target here" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing skills..." : "Generate the results"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="resume">
              <div className="py-12 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Upload your resume for automatic skill detection</h3>
                <p className="text-gray-500 mb-6">Supported formats: PDF, DOCX, TXT (Coming soon)</p>
                <Button variant="outline" className="mx-auto">
                  Upload Resume
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="linkedin">
              <div className="py-12 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Connect your LinkedIn profile</h3>
                <p className="text-gray-500 mb-6">We'll analyze your profile to detect your skills (Coming soon)</p>
                <Button variant="outline" className="mx-auto">
                  Connect LinkedIn
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {results && (
        <>
          <Card className="mb-10">
            <CardHeader className="bg-primary-700 text-white">
              <CardTitle className="text-2xl">Recommended Learning Paths for You</CardTitle>
              <CardDescription className="text-primary-100">
                Based on your career goal and missing skills, here's what you can start learning right away.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                <div className="p-4 bg-primary-50 rounded-md">
                  <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                    <Puzzle className="w-5 h-5 mr-1.5 text-primary-600" />
                    <span>Summary</span>
                  </h4>
                  <ul className="space-y-1 text-gray-700 pl-7">
                    <li className="flex items-start">
                      <Target className="w-4 h-4 mr-1.5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <span>Career Goal: {results.targetCareer}</span>
                    </li>
                    <li className="flex items-start">
                      <BarChart className="w-4 h-4 mr-1.5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <span>Missing Skills: {results.missingSkills.length} out of {results.currentSkills.length + results.missingSkills.length}</span>
                    </li>
                    <li className="flex items-start">
                      <GraduationCap className="w-4 h-4 mr-1.5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <span>Courses Suggested: {results.recommendedCourses.length}</span>
                    </li>
                    <li className="flex items-start">
                      <Clock className="w-4 h-4 mr-1.5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <span>Estimated Learning Time: ~6–8 weeks</span>
                    </li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <Button variant="outline">Re-analyze Skills</Button>
                    <Button>Add All to My Learning Plan</Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <BarChart className="w-5 h-5 mr-1.5 text-primary-600" />
                    <span>Skill Gap Results Section</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h5 className="font-medium mb-4">Required for {results.targetCareer}</h5>
                      <div className="flex flex-wrap gap-2">
                        {results.currentSkills.concat(results.missingSkills.map((s: any) => s.name)).map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="px-3 py-1">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-4">Your Current Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {results.currentSkills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="px-3 py-1 bg-green-100 text-green-800 border-green-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <h4 className="text-lg font-medium text-gray-900 flex items-center">
                  <BookOpen className="w-5 h-5 mr-1.5 text-primary-600" />
                  <span>Course Recommendation:</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {results.recommendedCourses.map((course: any, index: number) => (
                    <CourseCard
                      key={index}
                      title={course.title}
                      platform={course.platform}
                      cost={course.cost}
                      duration={course.duration}
                      skillName={course.skillName}
                      isMissing={true}
                      tags={["Free", "Beginner", "Project-Based", "Tool-based"]}
                      onStartCourse={() => {
                        window.open(course.url || `https://www.${course.platform.toLowerCase()}.com`, '_blank');
                      }}
                      onShowMoreOptions={() => {
                        toast({
                          title: "More options",
                          description: "Additional learning resources will be available soon",
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-1.5 text-primary-600" />
                <span>Platform Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-medium text-lg mb-2">What is {results.recommendedCourses[0]?.platform}?</h3>
              <p className="text-gray-700 mb-4">
                {results.recommendedCourses[0]?.platform} is a popular online learning platform that offers:
              </p>
              <ul className="list-disc pl-5 mb-6 space-y-1 text-gray-700">
                <li>Courses, certifications, and even degree programs</li>
                <li>Created by top universities and companies</li>
                <li>Covers a wide range of subjects — tech, business, design, personal development, etc.</li>
              </ul>
              
              <h3 className="font-medium text-lg mb-2 flex items-center">
                <Target className="w-5 h-5 mr-1.5 text-primary-600" />
                <span>Key Benefits:</span>
              </h3>
              <ul className="pl-5 mb-6 space-y-1 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 text-primary-600">$</span>
                  <span>Many courses are free to audit, with optional paid certificates</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary-600">🎓</span>
                  <span>Courses often include real credentials from well-known universities</span>
                </li>
                <li className="flex items-start">
                  <Clock className="w-4 h-4 mr-1.5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Courses are flexible and self-paced</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-1.5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Some courses offer career certificates recognized by employers</span>
                </li>
              </ul>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="font-medium mb-2">Example Course:</h3>
                <p className="text-gray-700">
                  <strong>Course:</strong> {results.recommendedCourses[0]?.title || "Data Analysis with Python"}<br />
                  <strong>Platform:</strong> {results.recommendedCourses[0]?.platform || "Coursera"}<br />
                  <strong>Duration:</strong> {results.recommendedCourses[0]?.duration || "~4 weeks"}<br />
                  <strong>Cost:</strong> {results.recommendedCourses[0]?.cost || "Free to audit, ~$49 for a certificate"}
                </p>
              </div>
              
              <h3 className="font-medium text-lg mb-4">Alternative platforms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 border rounded-md">
                  <p className="font-medium">Coursera</p>
                  <p className="text-sm text-gray-600">University-backed courses & career certificates</p>
                </div>
                <div className="p-3 border rounded-md">
                  <p className="font-medium">edX</p>
                  <p className="text-sm text-gray-600">Academic-level courses from institutions like MIT, Harvard, etc.</p>
                </div>
                <div className="p-3 border rounded-md">
                  <p className="font-medium">Udemy</p>
                  <p className="text-sm text-gray-600">Beginner to expert-level, affordable one-time courses</p>
                </div>
                <div className="p-3 border rounded-md">
                  <p className="font-medium">LinkedIn Learning</p>
                  <p className="text-sm text-gray-600">Professional development and soft skills, LinkedIn-integrated</p>
                </div>
                <div className="p-3 border rounded-md">
                  <p className="font-medium">Khan Academy</p>
                  <p className="text-sm text-gray-600">Free academic learning, good for fundamentals</p>
                </div>
                <div className="p-3 border rounded-md">
                  <p className="font-medium">YouTube</p>
                  <p className="text-sm text-gray-600">Free tutorials and walkthroughs — fast, informal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SkillGap;

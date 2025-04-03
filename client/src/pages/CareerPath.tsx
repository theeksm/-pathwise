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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  skills: z.string().min(2, {
    message: "Please enter at least one skill",
  }),
  interests: z.string().min(2, {
    message: "Please enter at least one interest",
  }),
  educationLevel: z.string({
    required_error: "Please select an education level",
  }),
  experience: z.string({
    required_error: "Please select your experience level",
  }),
});

type FormData = z.infer<typeof formSchema>;

const CareerPath = () => {
  const { toast } = useToast();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    throwOnError: false,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['/api/user'],
    enabled: !!user,
    throwOnError: false,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skills: userProfile?.skills?.join(', ') || "",
      interests: userProfile?.interests?.join(', ') || "",
      educationLevel: userProfile?.educationLevel || "",
      experience: userProfile?.experience || "",
    },
  });

  const careerMutation = useMutation({
    mutationFn: async (data: {
      skills: string[];
      interests: string[];
      educationLevel: string;
      experience: string;
    }) => {
      const res = await apiRequest("POST", "/api/careers/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      setResults(data);
      queryClient.invalidateQueries({ queryKey: ['/api/careers'] });
      toast({
        title: "Career recommendations generated",
        description: "We've found some career paths that match your profile!",
      });
      setIsLoading(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error generating recommendations",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data: {
      skills: string[];
      interests: string[];
      educationLevel: string;
      experience: string;
    }) => {
      const res = await apiRequest("PATCH", "/api/user", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving profile",
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

    setIsLoading(true);
    
    // Parse comma-separated values into arrays
    const skills = data.skills.split(',').map(s => s.trim()).filter(s => s);
    const interests = data.interests.split(',').map(s => s.trim()).filter(s => s);
    
    // Save profile data
    saveProfileMutation.mutate({
      skills,
      interests,
      educationLevel: data.educationLevel,
      experience: data.experience,
    });
    
    // Generate career recommendations
    careerMutation.mutate({
      skills,
      interests,
      educationLevel: data.educationLevel,
      experience: data.experience,
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign in to discover your career path</h2>
        <p className="text-gray-600 mb-8 text-center">
          You need to be logged in to access personalized career recommendations
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          AI Career Path Guidance
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
          Personalized career advice based on your skills, goals, and market trends.
          <br />
          <span className="text-primary-600">Powered by AI, built around you.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tell us about yourself</CardTitle>
                <CardDescription>
                  We'll use this information to recommend career paths that match your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your skills</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. Python, Marketing, Design... (comma-separated)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        List the skills you've acquired through work, education, or personal projects
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your interests</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. Technology, Healthcare, Finance... (comma-separated)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        What fields or activities are you passionate about?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="educationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your highest education level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="High School Diploma">High School Diploma</SelectItem>
                          <SelectItem value="Associate's Degree">Associate's Degree</SelectItem>
                          <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                          <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                          <SelectItem value="PhD or Doctorate">PhD or Doctorate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of experience</FormLabel>
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
                          <SelectItem value="0-1 years">0-1 years</SelectItem>
                          <SelectItem value="1-3 years">1-3 years</SelectItem>
                          <SelectItem value="3-5 years">3-5 years</SelectItem>
                          <SelectItem value="5-10 years">5-10 years</SelectItem>
                          <SelectItem value="10+ years">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Generating recommendations..." : "Get Career Suggestions"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Career Recommendations</CardTitle>
              <CardDescription>
                Based on your profile, here are some career paths that might be a good fit for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-6">
                  {results.map((career, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900">{career.careerTitle}</h3>
                        <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                          {career.fitScore}% Match
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{career.description}</p>
                      
                      <Separator className="my-3" />
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Salary Range:</span>
                          <span className="ml-2 text-gray-600">{career.salaryRange}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Growth Rate:</span>
                          <span className="ml-2 text-gray-600">{career.growthRate}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {career.requiredSkills.map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <p className="text-gray-500 mb-6">
                    Fill out the form and submit to get personalized career recommendations based on your profile
                  </p>
                  <img 
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                    alt="Career planning" 
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

export default CareerPath;

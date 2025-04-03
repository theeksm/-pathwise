import { useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Download, Edit, MessageCircle, Upload } from "lucide-react";

const formSchema = z.object({
  resumeContent: z.string().min(10, {
    message: "Resume content must be at least 10 characters.",
  }),
  targetPosition: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const ResumeOptimizer = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalContent, setOriginalContent] = useState("");
  const [optimizedContent, setOptimizedContent] = useState("");
  const [improvements, setImprovements] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    throwOnError: false,
  });

  const { data: resumes, isLoading: isResumesLoading } = useQuery({
    queryKey: ['/api/resumes'],
    enabled: !!user,
    throwOnError: false,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeContent: "",
      targetPosition: "",
    },
  });

  const optimizeResumeMutation = useMutation({
    mutationFn: async (data: {
      resumeContent: string;
      targetPosition?: string;
    }) => {
      const res = await apiRequest("POST", "/api/resumes/optimize", data);
      return res.json();
    },
    onSuccess: (data) => {
      setOriginalContent(data.originalContent);
      setOptimizedContent(data.optimizedContent);
      setImprovements(data.aiSuggestions || []);
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      toast({
        title: "Resume optimized successfully",
        description: "We've improved your resume with AI-powered suggestions!",
      });
      setIsOptimizing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error optimizing resume",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      setIsOptimizing(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // For now, we'll just read the file as text (for txt files)
      // In a real app, you'd need to handle different formats like PDF and DOCX
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const content = event.target.result as string;
          form.setValue("resumeContent", content);
          setOriginalContent(content);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onSubmit = (data: FormData) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to use this feature",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    setOriginalContent(data.resumeContent);
    optimizeResumeMutation.mutate({
      resumeContent: data.resumeContent,
      targetPosition: data.targetPosition || undefined
    });
  };

  // Helper function to highlight improvements in optimized resume
  const highlightImprovements = (text: string) => {
    let highlighted = text;
    
    // Very basic highlighting (in a real app, you would use a more sophisticated approach)
    improvements.forEach(improvement => {
      // Look for relevant phrases in the optimized content
      const keywords = improvement.split(' ')
        .filter(word => word.length > 4)  // Only look for significant words
        .map(word => word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""));  // Remove punctuation
      
      keywords.forEach(keyword => {
        if (keyword && keyword.length > 4) {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          highlighted = highlighted.replace(regex, match => `<span class="bg-green-100">${match}</span>`);
        }
      });
    });
    
    return { __html: highlighted };
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign in to optimize your resume</h2>
        <p className="text-gray-600 mb-8 text-center">
          You need to be logged in to use our AI-powered resume optimization tool
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

  const latestResume = resumes && resumes.length > 0 ? resumes[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Upgrade Your Resume & LinkedIn with AI
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
          Get smart suggestions to stand out and get hired.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Current Resume</CardTitle>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".txt,.pdf,.docx"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={triggerFileInput}
              >
                <Upload className="h-4 w-4" />
                Upload Resume
              </Button>
            </div>
            <CardDescription>
              {file ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)` : "Upload your resume or paste its content below"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="resumeContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your resume content here..."
                          className="h-96 font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="targetPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Position (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Data Analyst, Marketing Manager, Software Engineer" 
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
                  disabled={isOptimizing || form.watch("resumeContent") === ""}
                >
                  {isOptimizing ? "Optimizing resume..." : "Optimize My Resume"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-primary-200 border-2">
          <CardHeader className="bg-primary-50">
            <div className="flex items-center justify-between">
              <CardTitle>AI-Optimized Resume</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex items-center gap-2" disabled={!optimizedContent}>
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button className="flex items-center gap-2" disabled={!optimizedContent}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            <CardDescription>
              {optimizedContent ? "Your resume has been optimized with AI suggestions" : "Your optimized resume will appear here"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isOptimizing ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ) : optimizedContent ? (
              <div className="h-96 overflow-y-auto">
                <div className="bg-primary-50 mb-4 px-3 py-2 rounded-md border border-primary-200">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div className="ml-2">
                      <p className="text-sm text-primary-800 font-medium">AI Improvement Notes:</p>
                      <ul className="list-disc ml-4 text-xs text-primary-700">
                        {improvements.map((improvement, index) => (
                          <li key={index}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white p-4 rounded border border-gray-200 font-mono text-sm"
                  dangerouslySetInnerHTML={highlightImprovements(optimizedContent)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <p className="text-gray-500 mb-4">
                  Upload your resume and click "Optimize My Resume" to get AI-powered improvements
                </p>
                <img 
                  src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                  alt="Resume document" 
                  className="rounded-lg w-48 h-auto opacity-50"
                />
                <Button
                  variant="outline"
                  className="mt-6 flex items-center gap-2"
                  onClick={() => {
                    // If user has a previously optimized resume, load it
                    if (latestResume) {
                      setOriginalContent(latestResume.originalContent || "");
                      setOptimizedContent(latestResume.optimizedContent || "");
                      setImprovements(latestResume.aiSuggestions || []);
                    }
                  }}
                  disabled={!latestResume}
                >
                  <MessageCircle className="h-4 w-4" />
                  {latestResume ? "View Previous Optimization" : "No Previous Optimizations"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeOptimizer;

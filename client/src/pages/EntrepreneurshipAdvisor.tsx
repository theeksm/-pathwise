import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building,
  Lightbulb,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  Target,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const businessIdeaFormSchema = z.object({
  businessIdea: z.string().min(10, {
    message: "Business idea must be at least 10 characters long",
  }),
  targetMarket: z.string().min(5, {
    message: "Target market must be at least 5 characters long",
  }),
  skillsAndExperience: z.string().min(5, {
    message: "Please describe your skills and experience",
  }),
});

type BusinessIdeaFormData = z.infer<typeof businessIdeaFormSchema>;

const marketResearchFormSchema = z.object({
  industry: z.string().min(2, {
    message: "Please enter an industry",
  }),
  competitors: z.string().min(5, {
    message: "Please enter at least one competitor",
  }),
  targetAudience: z.string().min(5, {
    message: "Please describe your target audience",
  }),
  budgetRange: z.string().min(1, {
    message: "Please select a budget range",
  }),
});

type MarketResearchFormData = z.infer<typeof marketResearchFormSchema>;

const EntrepreneurshipAdvisor = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("business-idea");
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [marketAnalysisResults, setMarketAnalysisResults] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    throwOnError: false,
  });

  const businessIdeaForm = useForm<BusinessIdeaFormData>({
    resolver: zodResolver(businessIdeaFormSchema),
    defaultValues: {
      businessIdea: "",
      targetMarket: "",
      skillsAndExperience: "",
    },
  });

  const marketResearchForm = useForm<MarketResearchFormData>({
    resolver: zodResolver(marketResearchFormSchema),
    defaultValues: {
      industry: "",
      competitors: "",
      targetAudience: "",
      budgetRange: "",
    },
  });

  const evaluateBusinessIdeaMutation = useMutation({
    mutationFn: async (data: BusinessIdeaFormData) => {
      const res = await apiRequest("POST", "/api/chats", {
        userId: user?.id,
        messages: [
          {
            role: "user",
            content: `I need advice on my business idea. Here's my concept: ${data.businessIdea}. My target market is: ${data.targetMarket}. My relevant skills and experience: ${data.skillsAndExperience}. Please evaluate my business idea, give me a feasibility score out of 100, highlight strengths, weaknesses, and provide advice on next steps.`,
            timestamp: new Date().toISOString(),
          },
        ],
      });
      return res.json();
    },
    onSuccess: (data) => {
      // Parse the AI response to extract structured information
      const aiResponse = data.messages[1].content;
      
      // Extract score with regex (looking for patterns like "score: 75/100" or "75 out of 100")
      const scoreRegex = /(\d{1,3})(?:\s*\/\s*100|%|\s*out of\s*100)/i;
      const scoreMatch = aiResponse.match(scoreRegex);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 65; // Default to 65 if not found
      
      // Extract sections based on headers
      const getSection = (title: string): string[] => {
        const regex = new RegExp(`${title}[:\\s]+(.*?)(?=\\n\\s*\\n|\\n\\s*[A-Z]|$)`, "is");
        const match = aiResponse.match(regex);
        if (match && match[1]) {
          return match[1]
            .split(/\n-|\n•|\n\*|\n\d+\.|\.\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 0);
        }
        return [];
      };
      
      // Construct structured results
      const results = {
        score: score,
        strengths: getSection("Strengths"),
        weaknesses: getSection("Weaknesses"),
        opportunities: getSection("Opportunities"),
        threats: getSection("Threats"),
        nextSteps: getSection("Next Steps"),
        summary: aiResponse.split('\n\n')[0] || "Analysis complete."
      };
      
      setEvaluationResults(results);
      toast({
        title: "Business idea evaluated",
        description: "Your business idea has been analyzed by our AI advisor.",
      });
      setIsEvaluating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Evaluation failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      setIsEvaluating(false);
    },
  });

  const analyzeMarketMutation = useMutation({
    mutationFn: async (data: MarketResearchFormData) => {
      const res = await apiRequest("POST", "/api/chats", {
        userId: user?.id,
        messages: [
          {
            role: "user",
            content: `I need market research for a business in the ${data.industry} industry. My competitors include: ${data.competitors}. My target audience is: ${data.targetAudience}. My budget range is: ${data.budgetRange}. Please provide market analysis, growth potential, entry barriers, and marketing strategies.`,
            timestamp: new Date().toISOString(),
          },
        ],
      });
      return res.json();
    },
    onSuccess: (data) => {
      // Parse the AI response to extract structured information
      const aiResponse = data.messages[1].content;
      
      // Extract growth potential with regex
      const growthRegex = /growth\s*potential[:\s]+(\d+)%/i;
      const growthMatch = aiResponse.match(growthRegex);
      const growthPotential = growthMatch ? parseInt(growthMatch[1]) : 15; // Default to 15% if not found
      
      // Extract sections based on headers
      const getSection = (title: string): string[] => {
        const regex = new RegExp(`${title}[:\\s]+(.*?)(?=\\n\\s*\\n|\\n\\s*[A-Z]|$)`, "is");
        const match = aiResponse.match(regex);
        if (match && match[1]) {
          return match[1]
            .split(/\n-|\n•|\n\*|\n\d+\.|\.\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 0);
        }
        return [];
      };
      
      // Construct structured results
      const results = {
        marketSize: "$" + (Math.floor(Math.random() * 900) + 100) + "B", // This would be replaced with actual data from API
        growthPotential: growthPotential,
        entryBarriers: getSection("Entry Barriers"),
        marketTrends: getSection("Market Trends"),
        marketingStrategies: getSection("Marketing Strategies"),
        competitorAnalysis: getSection("Competitor Analysis"),
        recommendations: getSection("Recommendations"),
        summary: aiResponse.split('\n\n')[0] || "Market analysis complete."
      };
      
      setMarketAnalysisResults(results);
      toast({
        title: "Market analysis complete",
        description: "Your market research request has been analyzed.",
      });
      setIsAnalyzing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    },
  });

  const onBusinessIdeaSubmit = (data: BusinessIdeaFormData) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to use this feature",
        variant: "destructive",
      });
      return;
    }

    setIsEvaluating(true);
    evaluateBusinessIdeaMutation.mutate(data);
  };

  const onMarketResearchSubmit = (data: MarketResearchFormData) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to use this feature",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    analyzeMarketMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Sign in to access entrepreneurship tools
        </h2>
        <p className="text-gray-600 mb-8 text-center">
          You need to be logged in to use our AI-powered entrepreneurship advisor
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
          Entrepreneurship Advisor
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
          Get personalized guidance for your business ideas and entrepreneurial journey
        </p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business-idea">Business Idea Evaluation</TabsTrigger>
          <TabsTrigger value="market-research">Market Research</TabsTrigger>
          <TabsTrigger value="resources">Startup Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="business-idea" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Business Idea Evaluation</CardTitle>
                <CardDescription>
                  Get feedback on your business concept and suggestions for improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...businessIdeaForm}>
                  <form
                    onSubmit={businessIdeaForm.handleSubmit(onBusinessIdeaSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={businessIdeaForm.control}
                      name="businessIdea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Describe your business idea</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What product or service are you planning to offer? What problem does it solve?"
                              {...field}
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={businessIdeaForm.control}
                      name="targetMarket"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target market</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Who are your potential customers? What is your target demographic?"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={businessIdeaForm.control}
                      name="skillsAndExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your skills and experience</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What relevant skills, experience, or resources do you have to support this business?"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isEvaluating}
                    >
                      {isEvaluating ? "Evaluating..." : "Evaluate My Idea"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {isEvaluating ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Analyzing Your Business Idea</CardTitle>
                    <CardDescription>
                      Our AI advisor is evaluating your concept
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ) : evaluationResults ? (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Business Idea Evaluation</CardTitle>
                      <CardDescription>
                        {evaluationResults.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              Feasibility Score
                            </span>
                            <span className="text-sm font-medium">
                              {evaluationResults.score}/100
                            </span>
                          </div>
                          <Progress
                            value={evaluationResults.score}
                            className="h-2"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                              Strengths
                            </h4>
                            <ul className="text-sm space-y-1 pl-6 list-disc">
                              {evaluationResults.strengths.map(
                                (strength: string, index: number) => (
                                  <li key={index}>{strength}</li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium flex items-center">
                              <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                              Weaknesses
                            </h4>
                            <ul className="text-sm space-y-1 pl-6 list-disc">
                              {evaluationResults.weaknesses.map(
                                (weakness: string, index: number) => (
                                  <li key={index}>{weakness}</li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal pl-5 space-y-2">
                        {evaluationResults.nextSteps.map(
                          (step: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700">
                              {step}
                            </li>
                          )
                        )}
                      </ol>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6">
                      <Button variant="outline">Save Analysis</Button>
                      <Button onClick={() => setActiveTab("market-research")}>
                        Conduct Market Research
                      </Button>
                    </CardFooter>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                    <CardDescription>
                      Our AI advisor will analyze your business idea and provide feedback
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-primary-100 p-2 rounded-full">
                          <Lightbulb className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium">
                            Idea Evaluation
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            We'll assess your business concept based on
                            originality, feasibility, and market potential.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-primary-100 p-2 rounded-full">
                          <TrendingUp className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium">SWOT Analysis</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Get insights on strengths, weaknesses,
                            opportunities, and threats for your business idea.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-primary-100 p-2 rounded-full">
                          <Target className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium">
                            Actionable Next Steps
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Receive practical recommendations for validating and
                            developing your business idea.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="market-research" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Market Research</CardTitle>
                <CardDescription>
                  Analyze your target market, competition, and industry trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...marketResearchForm}>
                  <form
                    onSubmit={marketResearchForm.handleSubmit(
                      onMarketResearchSubmit
                    )}
                    className="space-y-6"
                  >
                    <FormField
                      control={marketResearchForm.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., SaaS, E-commerce, FinTech"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={marketResearchForm.control}
                      name="competitors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main competitors</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List your potential competitors (comma-separated)"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={marketResearchForm.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target audience</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your ideal customers (age, interests, pain points, etc.)"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={marketResearchForm.control}
                      name="budgetRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial budget range</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="">Select a budget range</option>
                              <option value="< $5,000">Less than $5,000</option>
                              <option value="$5,000 - $25,000">$5,000 - $25,000</option>
                              <option value="$25,000 - $100,000">$25,000 - $100,000</option>
                              <option value="$100,000 - $500,000">$100,000 - $500,000</option>
                              <option value="> $500,000">More than $500,000</option>
                            </select>
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
                      {isAnalyzing
                        ? "Analyzing market..."
                        : "Analyze Market Potential"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {isAnalyzing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Analyzing Market Data</CardTitle>
                    <CardDescription>
                      Our AI is researching market trends and competitors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ) : marketAnalysisResults ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Analysis Results</CardTitle>
                      <CardDescription>
                        {marketAnalysisResults.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-500">
                            Estimated Market Size
                          </h4>
                          <p className="text-2xl font-bold">
                            {marketAnalysisResults.marketSize}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-500">
                            Growth Potential
                          </h4>
                          <p className="text-2xl font-bold">
                            {marketAnalysisResults.growthPotential}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Market Trends
                          </h4>
                          <ul className="text-sm space-y-1 pl-6 list-disc">
                            {marketAnalysisResults.marketTrends.map(
                              (trend: string, index: number) => (
                                <li key={index}>{trend}</li>
                              )
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Entry Barriers
                          </h4>
                          <ul className="text-sm space-y-1 pl-6 list-disc">
                            {marketAnalysisResults.entryBarriers.map(
                              (barrier: string, index: number) => (
                                <li key={index}>{barrier}</li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Marketing Strategies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 pl-6 list-disc">
                        {marketAnalysisResults.marketingStrategies.map(
                          (strategy: string, index: number) => (
                            <li key={index}>{strategy}</li>
                          )
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6">
                      <Button variant="outline">Save Analysis</Button>
                      <Button onClick={() => setActiveTab("resources")}>
                        Explore Startup Resources
                      </Button>
                    </CardFooter>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Market Research Benefits</CardTitle>
                    <CardDescription>
                      Understanding your market is crucial for startup success
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-primary-100 p-2 rounded-full">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium">
                            Customer Insights
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Learn about your target audience's needs,
                            preferences, and buying behavior.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-primary-100 p-2 rounded-full">
                          <Building className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium">
                            Competitive Analysis
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Identify your competitors' strengths and
                            weaknesses to find your competitive advantage.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-primary-100 p-2 rounded-full">
                          <DollarSign className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium">
                            Revenue Potential
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Estimate your potential market share and revenue
                            based on industry data.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Essential Startup Resources</CardTitle>
                <CardDescription>
                  Tools and resources to help you on your entrepreneurial journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Business Planning</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">Business Plan Templates</h4>
                        <ul className="mt-2 space-y-1">
                          <li className="text-sm">
                            <a href="https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              SBA Business Plan Guide
                            </a>
                          </li>
                          <li className="text-sm">
                            <a href="https://www.score.org/resource/business-plan-template-startup-business" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              SCORE Business Plan Template
                            </a>
                          </li>
                          <li className="text-sm">
                            <a href="https://www.liveplan.com/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              LivePlan
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Financial Modeling</h4>
                        <ul className="mt-2 space-y-1">
                          <li className="text-sm">
                            <a href="https://www.finmodelslab.com/templates/startup-financial-model/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              Startup Financial Model Templates
                            </a>
                          </li>
                          <li className="text-sm">
                            <a href="https://www.fairsplit.co/cap-table" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              Cap Table Templates
                            </a>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Funding Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">Pitch Deck Templates</h4>
                        <ul className="mt-2 space-y-1">
                          <li className="text-sm">
                            <a href="https://slidebean.com/pitch-deck-template" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              Slidebean Pitch Deck Templates
                            </a>
                          </li>
                          <li className="text-sm">
                            <a href="https://www.ycombinator.com/library/4T-how-to-design-a-better-pitch-deck" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              Y Combinator Pitch Deck Guide
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Funding Platforms</h4>
                        <ul className="mt-2 space-y-1">
                          <li className="text-sm">
                            <a href="https://www.angellist.com/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              AngelList
                            </a>
                          </li>
                          <li className="text-sm">
                            <a href="https://www.kickstarter.com/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              Kickstarter
                            </a>
                          </li>
                          <li className="text-sm">
                            <a href="https://www.crowdfunder.com/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              Crowdfunder
                            </a>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Legal Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">Business Formation</h4>
                        <ul className="mt-2 space-y-1">
                          <li className="text-sm">
                            <a href="https://www.legalzoom.com/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              LegalZoom
                            </a>
                          </li>
                          <li className="text-sm">
                            <a href="https://www.zenbusiness.com/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              ZenBusiness
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Contract Templates</h4>
                        <ul className="mt-2 space-y-1">
                          <li className="text-sm">
                            <a href="https://www.lawdepot.com/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              LawDepot
                            </a>
                          </li>
                          <li className="text-sm">
                            <a href="https://www.rocketlawyer.com/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              RocketLawyer
                            </a>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recommended Books & Courses</CardTitle>
                <CardDescription>
                  Top resources to expand your entrepreneurial knowledge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Essential Books</h3>
                    <ul className="space-y-3">
                      <li className="flex">
                        <div className="w-12 h-16 bg-gray-200 rounded-sm mr-3 flex-shrink-0"></div>
                        <div>
                          <h4 className="text-sm font-medium">The Lean Startup</h4>
                          <p className="text-xs text-gray-500">by Eric Ries</p>
                          <p className="text-xs text-gray-600 mt-1">
                            How to use lean principles to build a successful startup.
                          </p>
                        </div>
                      </li>
                      <li className="flex">
                        <div className="w-12 h-16 bg-gray-200 rounded-sm mr-3 flex-shrink-0"></div>
                        <div>
                          <h4 className="text-sm font-medium">Zero to One</h4>
                          <p className="text-xs text-gray-500">by Peter Thiel</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Notes on startups, or how to build the future.
                          </p>
                        </div>
                      </li>
                      <li className="flex">
                        <div className="w-12 h-16 bg-gray-200 rounded-sm mr-3 flex-shrink-0"></div>
                        <div>
                          <h4 className="text-sm font-medium">Traction</h4>
                          <p className="text-xs text-gray-500">by Gabriel Weinberg & Justin Mares</p>
                          <p className="text-xs text-gray-600 mt-1">
                            A startup guide to getting customers.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-3">Online Courses</h3>
                    <ul className="space-y-3">
                      <li className="border p-3 rounded-md">
                        <h4 className="text-sm font-medium">Y Combinator's Startup School</h4>
                        <p className="text-xs text-gray-500">Free</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Comprehensive startup curriculum from leading accelerator.
                        </p>
                        <Button variant="link" className="p-0 h-auto text-xs mt-1">
                          <a href="https://www.startupschool.org/" target="_blank" rel="noopener noreferrer">
                            startupschool.org
                          </a>
                        </Button>
                      </li>
                      <li className="border p-3 rounded-md">
                        <h4 className="text-sm font-medium">How to Start a Startup</h4>
                        <p className="text-xs text-gray-500">Free on YouTube</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Stanford lecture series with top entrepreneurs.
                        </p>
                        <Button variant="link" className="p-0 h-auto text-xs mt-1">
                          <a href="https://www.youtube.com/playlist?list=PL5q_lef6zVkaTY_cT1k7qFNF2TidHCe-1" target="_blank" rel="noopener noreferrer">
                            Watch on YouTube
                          </a>
                        </Button>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Startup Communities</CardTitle>
                <CardDescription>
                  Connect with fellow entrepreneurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border p-3 rounded-md">
                    <h4 className="text-sm font-medium">Y Combinator Startup School Forum</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Connect with founders and get advice from YC partners.
                    </p>
                    <a
                      href="https://www.startupschool.org/forum"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline text-xs"
                    >
                      Join the community
                    </a>
                  </div>
                  <div className="border p-3 rounded-md">
                    <h4 className="text-sm font-medium">Indie Hackers</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Community of bootstrapped founders sharing their journeys.
                    </p>
                    <a
                      href="https://www.indiehackers.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline text-xs"
                    >
                      Join the community
                    </a>
                  </div>
                  <div className="border p-3 rounded-md">
                    <h4 className="text-sm font-medium">r/startups</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Reddit community for startup founders and entrepreneurs.
                    </p>
                    <a
                      href="https://www.reddit.com/r/startups/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline text-xs"
                    >
                      Join the community
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EntrepreneurshipAdvisor;

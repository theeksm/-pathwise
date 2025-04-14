import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import { Search, TrendingUp, TrendingDown, ArrowRight, RefreshCcw, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Define interfaces for stock data
interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Define proper interfaces for our stock data
interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockData {
  symbol: string;
  name: string;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  timeSeries: StockDataPoint[];
  error?: string;
}

interface StockSymbol {
  symbol: string;
  name: string;
}

// Career trends data (would come from API in production)
const careerTrends = [
  { 
    name: "Data Science", 
    growth: 35, 
    avgSalary: "$105,000", 
    demandLevel: "Very High",
    automationRisk: "Low",
    requiredSkills: ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization"],
    industries: ["Tech", "Finance", "Healthcare", "E-commerce"]
  },
  { 
    name: "Software Engineering", 
    growth: 22, 
    avgSalary: "$110,000", 
    demandLevel: "Very High",
    automationRisk: "Low",
    requiredSkills: ["JavaScript", "Java", "Python", "Cloud Services", "DevOps"],
    industries: ["Tech", "Finance", "E-commerce", "Media"]
  },
  { 
    name: "UX/UI Design", 
    growth: 18, 
    avgSalary: "$92,000", 
    demandLevel: "High",
    automationRisk: "Low",
    requiredSkills: ["Figma", "User Research", "Wireframing", "Visual Design", "Prototyping"],
    industries: ["Tech", "E-commerce", "Media", "Healthcare"]
  },
  { 
    name: "Digital Marketing", 
    growth: 20, 
    avgSalary: "$75,000", 
    demandLevel: "High",
    automationRisk: "Medium",
    requiredSkills: ["SEO", "Content Marketing", "Social Media", "Analytics", "PPC"],
    industries: ["Retail", "E-commerce", "Tech", "Entertainment"]
  },
  { 
    name: "Cybersecurity", 
    growth: 33, 
    avgSalary: "$115,000", 
    demandLevel: "Very High",
    automationRisk: "Low",
    requiredSkills: ["Network Security", "Cloud Security", "Risk Assessment", "Security Architecture"],
    industries: ["Finance", "Healthcare", "Government", "Tech"]
  },
  { 
    name: "Healthcare Administration", 
    growth: 15, 
    avgSalary: "$88,000", 
    demandLevel: "High",
    automationRisk: "Medium",
    requiredSkills: ["Healthcare Regulations", "Electronic Health Records", "Operations Management"],
    industries: ["Healthcare", "Insurance"]
  },
  { 
    name: "AI Specialist", 
    growth: 40, 
    avgSalary: "$120,000", 
    demandLevel: "Very High",
    automationRisk: "Low",
    requiredSkills: ["Machine Learning", "Deep Learning", "Python", "TensorFlow/PyTorch", "Data Modeling"],
    industries: ["Tech", "Finance", "Healthcare", "Automotive"]
  },
  { 
    name: "Content Creation", 
    growth: 17, 
    avgSalary: "$68,000", 
    demandLevel: "High",
    automationRisk: "Medium",
    requiredSkills: ["Writing", "Video Production", "Social Media", "SEO", "Storytelling"],
    industries: ["Media", "Marketing", "Entertainment", "E-commerce"]
  }
];

const automationRiskJobs = [
  { name: "Data Entry", risk: 85 },
  { name: "Customer Service", risk: 75 },
  { name: "Accounting", risk: 70 },
  { name: "Retail Sales", risk: 65 },
  { name: "Truck Driving", risk: 80 },
  { name: "Manufacturing", risk: 90 },
  { name: "Legal Assistants", risk: 60 },
  { name: "Fast Food", risk: 85 },
];

// Interface for news articles
interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  content?: string;
  imageUrl?: string;
  category?: string;
}

// Interface for trending stocks
interface TrendingStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const MarketTrends = () => {
  const { toast } = useToast();
  const [stockSymbol, setStockSymbol] = useState("MSFT");
  const [searchSymbol, setSearchSymbol] = useState("MSFT");
  // Define chart data point interface 
  interface ChartDataPoint {
    date: string;
    close: number;
  }
  
  const [stockChartData, setStockChartData] = useState<ChartDataPoint[]>([]);
  const [symbolSuggestions, setSymbolSuggestions] = useState<StockSymbol[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Query for stock data by symbol
  const { data: stockData, isLoading, isError, error, refetch } = useQuery<StockData, Error>({
    queryKey: ['/api/market-trends/stocks', stockSymbol],
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: !!stockSymbol,
    // Add cache-busting timestamp to prevent stale data
    queryFn: async () => {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/market-trends/stocks?symbol=${stockSymbol}&t=${timestamp}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch stock data');
      }
      return response.json();
    },
    // Reduce API request frequency to avoid hitting rate limits
    staleTime: 60000, // Consider data fresh for 1 minute to reduce API calls
    gcTime: 120000, // Keep in cache for 2 minutes
    refetchInterval: 60000 // Refresh every 60 seconds for balance between real-time and rate limits
  });
  
  // Query for trending stocks
  const { 
    data: trendingStocks, 
    isLoading: isLoadingTrending,
    isError: isTrendingError
  } = useQuery<TrendingStock[], Error>({
    queryKey: ['/api/market-trends/trending-stocks'],
    queryFn: async () => {
      const response = await fetch('/api/market-trends/trending-stocks');
      if (!response.ok) {
        throw new Error('Failed to fetch trending stocks');
      }
      return response.json();
    },
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    refetchInterval: 300000, // 5 minutes
  });
  
  // Query for tech news
  const {
    data: techNews,
    isLoading: isNewsLoading,
    isError: isNewsError
  } = useQuery<NewsArticle[], Error>({
    queryKey: ['/api/news/tech'],
    queryFn: async () => {
      const response = await fetch('/api/news/tech');
      if (!response.ok) {
        throw new Error('Failed to fetch tech news');
      }
      return response.json();
    },
    staleTime: 900000, // 15 minutes
    gcTime: 1800000, // 30 minutes
    refetchInterval: 900000, // 15 minutes
  });

  useEffect(() => {
    if (stockData && stockData.timeSeries) {
      // Make sure we have more than one data point to display
      if (stockData.timeSeries.length > 0) {
        const chartData = stockData.timeSeries
          .slice(-30) // Ensure we're only using last 30 days of data for better visualization
          .map((dataPoint: StockDataPoint) => ({
            date: new Date(dataPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            close: dataPoint.close,
          }))
          .sort((a: ChartDataPoint, b: ChartDataPoint) => {
            // Ensure data is properly sorted by date
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
          });
        
        setStockChartData(chartData);
      } else {
        // If no time series data, set to empty array
        setStockChartData([]);
      }
    } else {
      // Reset chart data when no stock data is available
      setStockChartData([]);
    }
  }, [stockData]);

  const handleSearch = () => {
    if (searchSymbol && searchSymbol !== stockSymbol) {
      setStockSymbol(searchSymbol);
      toast({
        title: "Loading stock data",
        description: `Fetching real-time data for ${searchSymbol}`,
        variant: "default"
      });
    }
  };
  
  // Function to search for stock symbols
  const searchStockSymbols = async (query: string) => {
    if (!query || query.trim().length === 0) {
      setSymbolSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/market-trends/stocks/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search for stock symbols');
      }
      
      const data = await response.json();
      setSymbolSuggestions(data);
    } catch (error) {
      console.error('Error searching for stock symbols:', error);
      setSymbolSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Effect to search for stock symbols when the query changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        searchStockSymbols(searchQuery);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const calculateRiskColor = (risk: number) => {
    if (risk < 30) return "#4ade80"; // green
    if (risk < 60) return "#facc15"; // yellow
    return "#ef4444"; // red
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Market Trends & Career Insights
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
          Stay informed about industry trends, growing careers, and market indicators
        </p>
      </div>

      <Tabs defaultValue="careers" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="careers">Fast-Growing Careers</TabsTrigger>
          <TabsTrigger value="automation">Automation Risk</TabsTrigger>
          <TabsTrigger value="stocks">Stock Market Data</TabsTrigger>
        </TabsList>

        <TabsContent value="careers" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Top Growing Careers in 2024</CardTitle>
                <CardDescription>
                  Based on projected growth rates, salary trends, and market demand
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-2 text-left">Career Field</th>
                        <th className="border p-2 text-left">Growth Rate</th>
                        <th className="border p-2 text-left">Avg. Salary</th>
                        <th className="border p-2 text-left">Demand</th>
                        <th className="border p-2 text-left">Automation Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {careerTrends.map((career, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border p-2 font-medium">{career.name}</td>
                          <td className="border p-2">
                            <span className="flex items-center">
                              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              {career.growth}%
                            </span>
                          </td>
                          <td className="border p-2">{career.avgSalary}</td>
                          <td className="border p-2">{career.demandLevel}</td>
                          <td className="border p-2">{career.automationRisk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Career Growth Comparison</CardTitle>
                <CardDescription>
                  Projected growth percentage for top careers over the next 5 years
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={careerTrends.sort((a, b) => b.growth - a.growth)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="growth" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Career Spotlight</CardTitle>
                <CardDescription>
                  Detailed look at a top growing career
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-bold mb-2">{careerTrends[0].name}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Growth Rate:</p>
                    <p className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      {careerTrends[0].growth}% (Next 5 years)
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Required Skills:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {careerTrends[0].requiredSkills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Top Industries:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {careerTrends[0].industries.map((industry, index) => (
                        <Badge key={index} variant="secondary">{industry}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Career Path
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Risk by Job</CardTitle>
                <CardDescription>
                  Probability of automation for different job roles
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={automationRiskJobs.sort((a, b) => b.risk - a.risk)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="risk">
                      {automationRiskJobs.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={calculateRiskColor(entry.risk)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automation Resilient Careers</CardTitle>
                <CardDescription>
                  Careers least likely to be replaced by automation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-md">
                    <h3 className="font-medium mb-1">1. Healthcare Practitioners</h3>
                    <p className="text-sm text-gray-600">Doctors, nurses, therapists, and specialized medical professionals</p>
                    <Badge className="mt-2 bg-green-100 text-green-800 border-0">Low Risk (5%)</Badge>
                  </div>
                  <div className="p-3 border rounded-md">
                    <h3 className="font-medium mb-1">2. Education and Training</h3>
                    <p className="text-sm text-gray-600">Teachers, counselors, and specialized instructors</p>
                    <Badge className="mt-2 bg-green-100 text-green-800 border-0">Low Risk (15%)</Badge>
                  </div>
                  <div className="p-3 border rounded-md">
                    <h3 className="font-medium mb-1">3. Creative Professions</h3>
                    <p className="text-sm text-gray-600">Artists, designers, writers, and performers</p>
                    <Badge className="mt-2 bg-green-100 text-green-800 border-0">Low Risk (20%)</Badge>
                  </div>
                  <div className="p-3 border rounded-md">
                    <h3 className="font-medium mb-1">4. Complex Problem Solvers</h3>
                    <p className="text-sm text-gray-600">Scientists, engineers, and strategic managers</p>
                    <Badge className="mt-2 bg-green-100 text-green-800 border-0">Low Risk (25%)</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Tips for Automation-Proof Career Planning</CardTitle>
                <CardDescription>
                  Strategies to ensure your career remains relevant in an automated future
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <h3 className="font-medium text-primary-900 mb-2">Focus on Uniquely Human Skills</h3>
                    <p className="text-sm text-gray-600">
                      Develop skills that AI and automation struggle with: creativity, emotional intelligence, ethical judgment, and critical thinking.
                    </p>
                  </div>
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <h3 className="font-medium text-primary-900 mb-2">Continuous Learning</h3>
                    <p className="text-sm text-gray-600">
                      Commit to lifelong learning and skill development. Stay adaptable and keep up with technology changes in your field.
                    </p>
                  </div>
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <h3 className="font-medium text-primary-900 mb-2">Work Alongside Technology</h3>
                    <p className="text-sm text-gray-600">
                      Learn to collaborate with AI and automation tools rather than compete against them. Become the person who can manage and interpret automated systems.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stocks" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-3">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>Stock Market Data</CardTitle>
                    <CardDescription>
                      Track tech companies and market indicators
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isSearchOpen}
                            className="w-full justify-between"
                          >
                            {searchSymbol || "Search for a stock"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <div className="flex items-center border-b px-3">
                              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                              <input
                                placeholder="Search stock symbol or name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                              />
                            </div>
                            {isSearching ? (
                              <div className="py-6 text-center text-sm">Searching...</div>
                            ) : (
                              <>
                                <CommandEmpty>No stocks found.</CommandEmpty>
                                <CommandGroup>
                                  {symbolSuggestions.map((stock) => (
                                    <CommandItem
                                      key={stock.symbol}
                                      value={stock.symbol}
                                      onSelect={() => {
                                        setSearchSymbol(stock.symbol);
                                        setIsSearchOpen(false);
                                        
                                        // Show loading state when changing stocks
                                        toast({
                                          title: "Updating Stock Data",
                                          description: `Loading data for ${stock.symbol} (${stock.name})`,
                                          duration: 2000
                                        });
                                        
                                        // Apply new stock symbol directly
                                        setStockSymbol(stock.symbol);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          searchSymbol === stock.symbol ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <span className="font-medium">{stock.symbol}</span>
                                      <span className="ml-2 text-muted-foreground">{stock.name}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </>
                            )}
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* No manual refresh needed - data updates automatically */}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : stockData && stockData.error ? (
                  <div className="flex flex-col items-center justify-center h-64 p-6 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-red-600 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load stock data</h3>
                    <p className="text-red-600 text-center mb-4">{stockData.error}</p>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      This could be due to an invalid API key, reaching API request limits, or an invalid stock symbol.
                    </p>
                    <Button variant="outline" onClick={() => refetch()}>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : stockData ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-2xl font-bold">{stockData.name || stockData.symbol}</h3>
                        <p className="text-gray-500">{stockData.symbol}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${stockData.price?.toFixed(2)}</div>
                        <div className={`flex items-center ${stockData.change && stockData.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stockData.change && stockData.change > 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          <span>
                            {stockData.change?.toFixed(2)} ({stockData.changePercent?.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-64">
                      {stockChartData && stockChartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={stockChartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                              tickCount={5}
                              padding={{ left: 10, right: 10 }}
                            />
                            <YAxis 
                              domain={['auto', 'auto']} 
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => `$${value.toFixed(2)}`}
                            />
                            <Tooltip 
                              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Line
                              type="monotone"
                              dataKey="close"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              dot={{ r: 2 }}
                              activeDot={{ r: 5 }}
                              name="Price"
                              isAnimationActive={true}
                              animationDuration={1000}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <p className="text-gray-500 mb-2">No chart data available</p>
                          <p className="text-sm text-gray-400">
                            {stockData?.error ? 
                              stockData.error : 
                              "Try searching for a different stock symbol"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : isError ? (
                  <div className="flex flex-col items-center justify-center h-64 p-6 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-red-600 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to fetch stock data</h3>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      An error occurred while fetching the data. Please check your connection and try again.
                    </p>
                    <Button variant="outline" onClick={() => refetch()}>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Enter a stock symbol to view data</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trending Stocks</CardTitle>
                <CardDescription>
                  Top performing stocks in the market
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTrending ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : isTrendingError ? (
                  <div className="p-4 text-center text-red-500 bg-red-50 rounded-md">
                    <p className="mb-2">Unable to load trending stocks</p>
                    <p className="text-sm text-gray-600">Please try again later</p>
                  </div>
                ) : trendingStocks && trendingStocks.length > 0 ? (
                  <div className="space-y-3">
                    {trendingStocks.map((stock, index) => (
                      <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                        <div className="font-medium">
                          <a 
                            href={`/stock/${stock.symbol}`}
                            className="hover:text-primary-600 hover:underline transition-colors"
                          >
                            {stock.symbol} {stock.name && `(${stock.name})`}
                          </a>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="font-medium">${stock.price?.toFixed(2)}</div>
                          <div className={`flex items-center text-xs ${stock.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change > 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            <span>
                              {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No trending stocks available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Tech Industry News</CardTitle>
                <CardDescription>
                  Latest stories affecting the tech job market
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isNewsLoading ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ) : isNewsError ? (
                  <div className="p-8 text-center bg-red-50 rounded-md">
                    <div className="text-red-500 mb-2">Unable to load news data</div>
                    <p className="text-sm text-gray-500">Please try again later</p>
                  </div>
                ) : techNews && techNews.length > 0 ? (
                  <div className="space-y-4">
                    {techNews.slice(0, 3).map((article, index) => {
                      // Format the published date
                      const publishDate = new Date(article.publishedAt);
                      const now = new Date();
                      
                      // Calculate time difference
                      const diffMs = now.getTime() - publishDate.getTime();
                      const diffMins = Math.round(diffMs / 60000);
                      const diffHours = Math.round(diffMs / 3600000);
                      const diffDays = Math.round(diffMs / 86400000);
                      
                      // Format time for display
                      let timeAgo;
                      if (diffMins < 60) {
                        timeAgo = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
                      } else if (diffHours < 24) {
                        timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                      } else {
                        timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                      }
                      
                      return (
                        <div key={index} className="border-b pb-4">
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium mb-1 hover:text-primary-600 transition-colors"
                          >
                            <h3 className="font-medium mb-1 line-clamp-2">{article.title}</h3>
                          </a>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {article.description || "No description available"}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <span className="mr-2">{timeAgo}</span>
                              <span className="text-xs text-gray-400">• {article.source}</span>
                            </div>
                            <Badge variant="outline">{article.category || "Tech News"}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No news articles available</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB" target="_blank" rel="noopener noreferrer">
                    View More Tech News
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketTrends;

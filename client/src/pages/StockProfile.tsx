import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Legend,
} from "recharts";
import {
  Building,
  Calendar,
  ChevronLeft,
  ExternalLink,
  Globe,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Briefcase,
  Newspaper,
  Info,
  BarChart3,
  Share2,
} from "lucide-react";
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

// Interface for company details
interface CompanyDetails {
  symbol: string;
  name: string;
  description: string;
  exchange: string;
  industry: string;
  sector: string;
  employees?: number;
  ceo?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  marketCap?: number;
  peRatio?: number;
  yearFounded?: number;
}

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

// Interface for chart data
interface ChartDataPoint {
  date: string;
  close: number;
}

const StockProfile = () => {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Extract symbol from URL
  const symbol = location.split("/").pop()?.toUpperCase() || "";
  
  // State for chart data
  const [stockChartData, setStockChartData] = useState<ChartDataPoint[]>([]);
  
  // Get stock data
  const { 
    data: stockData,
    isLoading: isStockLoading,
    isError: isStockError,
    error: stockError
  } = useQuery<StockData, Error>({
    queryKey: ['/api/market-trends/stocks', symbol],
    queryFn: async () => {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/market-trends/stocks?symbol=${symbol}&t=${timestamp}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch stock data');
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // 1 minute
    enabled: !!symbol
  });
  
  // Get company news
  const {
    data: companyNews,
    isLoading: isNewsLoading,
    isError: isNewsError
  } = useQuery<NewsArticle[], Error>({
    queryKey: ['/api/news/company', symbol],
    queryFn: async () => {
      const response = await fetch(`/api/news/company?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch company news');
      }
      return response.json();
    },
    staleTime: 900000, // 15 minutes
    enabled: !!symbol
  });
  
  // Process chart data when stockData changes
  useEffect(() => {
    if (stockData && stockData.timeSeries) {
      if (stockData.timeSeries.length > 0) {
        const chartData = stockData.timeSeries
          .slice(-30) // Last 30 days
          .map((dataPoint: StockDataPoint) => ({
            date: new Date(dataPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            close: dataPoint.close,
          }))
          .sort((a: ChartDataPoint, b: ChartDataPoint) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
          });
        
        setStockChartData(chartData);
      } else {
        setStockChartData([]);
      }
    } else {
      setStockChartData([]);
    }
  }, [stockData]);
  
  // Mock company details for now
  // In a real implementation, this would be fetched from an API
  const companyDetails: CompanyDetails | null = stockData ? {
    symbol: stockData.symbol,
    name: stockData.name,
    description: "This is a placeholder description for the company. In a production environment, this would be fetched from an API that provides company information such as Polygon.io, Yahoo Finance, or a similar service.",
    exchange: "NASDAQ",
    industry: "Technology",
    sector: "Information Technology",
    employees: 150000,
    website: "https://example.com",
    marketCap: 2000000000000, // $2 trillion
    peRatio: 30.5,
    yearFounded: 1980
  } : null;
  
  // Format large numbers for display
  const formatLargeNumber = (num: number) => {
    if (num >= 1000000000000) {
      return `$${(num / 1000000000000).toFixed(2)}T`;
    }
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    }
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    }
    return `$${num.toLocaleString()}`;
  };
  
  // Format date for display
  const formatTimeAgo = (dateString: string) => {
    const publishDate = new Date(dateString);
    const now = new Date();
    
    // Calculate time difference
    const diffMs = now.getTime() - publishDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    // Format time for display
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => setLocation("/market-trends")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Market Trends
      </Button>
      
      {isStockLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-80 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full md:col-span-2" />
          </div>
        </div>
      ) : isStockError ? (
        <div className="p-12 bg-red-50 rounded-lg text-center">
          <div className="text-red-600 text-lg mb-4">Failed to load stock data</div>
          <p className="text-gray-600 mb-6">
            {stockError instanceof Error ? stockError.message : "An unknown error occurred"}
          </p>
          <Button onClick={() => setLocation("/market-trends")} variant="outline">
            Return to Market Trends
          </Button>
        </div>
      ) : stockData && stockData.error ? (
        <div className="p-12 bg-red-50 rounded-lg text-center">
          <div className="text-red-600 text-lg mb-4">Stock data error</div>
          <p className="text-gray-600 mb-6">{stockData.error}</p>
          <Button onClick={() => setLocation("/market-trends")} variant="outline">
            Return to Market Trends
          </Button>
        </div>
      ) : stockData ? (
        <>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold">{stockData.name}</h1>
                <div className="text-gray-500">{stockData.symbol} • {companyDetails?.exchange}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-3xl font-bold">${stockData.price.toFixed(2)}</div>
                <div className={`flex items-center ${stockData.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stockData.change > 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    {stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="h-80">
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
                          tickCount={7}
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
                        <Legend />
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
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No chart data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Overview</CardTitle>
                <CardDescription>Key information about {stockData.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyDetails?.description && (
                    <div className="text-sm text-gray-600 mb-4">
                      {companyDetails.description}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Industry</div>
                      <div className="font-medium">{companyDetails?.industry || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Sector</div>
                      <div className="font-medium">{companyDetails?.sector || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Market Cap</div>
                      <div className="font-medium">
                        {companyDetails?.marketCap ? formatLargeNumber(companyDetails.marketCap) : "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">P/E Ratio</div>
                      <div className="font-medium">{companyDetails?.peRatio || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Employees</div>
                      <div className="font-medium">
                        {companyDetails?.employees ? companyDetails.employees.toLocaleString() : "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Founded</div>
                      <div className="font-medium">{companyDetails?.yearFounded || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-between">
                  {companyDetails?.website && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={companyDetails.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="mr-2 h-4 w-4" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Latest News</CardTitle>
                <CardDescription>Recent articles about {stockData.name}</CardDescription>
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
                  </div>
                ) : isNewsError ? (
                  <div className="p-8 text-center bg-red-50 rounded-md">
                    <div className="text-red-500 mb-2">Unable to load news data</div>
                    <p className="text-sm text-gray-500">Please try again later</p>
                  </div>
                ) : companyNews && companyNews.length > 0 ? (
                  <div className="space-y-4">
                    {companyNews.slice(0, 3).map((article, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium hover:text-primary-600 transition-colors"
                        >
                          <h3 className="font-medium mb-1 line-clamp-2">{article.title}</h3>
                        </a>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {article.description || "No description available"}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="mr-2">{formatTimeAgo(article.publishedAt)}</span>
                            <span className="text-xs text-gray-400">• {article.source}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No news articles available</p>
                    <p className="text-sm text-gray-400 mt-2">Check back later for updates</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t">
                <Button variant="outline" className="w-full" asChild>
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(stockData.name)}+news`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Newspaper className="mr-2 h-4 w-4" />
                    View More News
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </>
      ) : (
        <div className="p-12 bg-gray-50 rounded-lg text-center">
          <div className="text-lg mb-4">No stock symbol provided</div>
          <p className="text-gray-600 mb-6">
            Please return to the Market Trends page and select a stock
          </p>
          <Button onClick={() => setLocation("/market-trends")} variant="outline">
            Return to Market Trends
          </Button>
        </div>
      )}
    </div>
  );
};

export default StockProfile;
import fetch from "node-fetch";

// Get Polygon API key from environment variables
const API_KEY = process.env.POLYGON_API_KEY || '';
const BASE_URL = "https://api.polygon.io";

// Cache mechanism to reduce API calls
const API_CACHE = new Map<string, { data: any, timestamp: number }>(); 
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Error types for better classification and handling
export enum PolygonAPIErrorType {
  API_KEY_MISSING = 'api_key_missing',
  API_KEY_INVALID = 'api_key_invalid',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_SYMBOL = 'invalid_symbol',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

// Custom error class for PolygonAPI
export class PolygonAPIError extends Error {
  type: PolygonAPIErrorType;
  
  constructor(message: string, type: PolygonAPIErrorType) {
    super(message);
    this.name = 'PolygonAPIError';
    this.type = type;
  }
}

// Check if API key is available
if (!API_KEY) {
  console.warn("WARNING: POLYGON_API_KEY environment variable is not set. Stock data API will not work properly.");
}

// Validate API key and handle common error scenarios
function validateApiKey(): void {
  if (!API_KEY) {
    throw new PolygonAPIError(
      'Polygon API key is not set. Please configure the API key to access stock data.',
      PolygonAPIErrorType.API_KEY_MISSING
    );
  }
}

export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockData {
  symbol: string;
  name?: string;
  currency: string;
  price?: number;
  change?: number;
  changePercent?: number;
  timeSeries?: StockDataPoint[];
  error?: string;
}

// Wrapper function to handle API requests with proper error classification
async function fetchPolygonEndpoint(url: string, endpointName: string): Promise<any> {
  try {
    validateApiKey();
    
    // Check cache first to reduce API calls
    const cacheKey = url;
    const now = Date.now();
    const cachedResult = API_CACHE.get(cacheKey);
    
    if (cachedResult && (now - cachedResult.timestamp < CACHE_DURATION)) {
      console.log(`Using cached Polygon data for ${endpointName}`);
      return cachedResult.data;
    }
    
    console.log(`Fetching real-time ${endpointName} from Polygon API`);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    // Handle HTTP error statuses
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new PolygonAPIError(
          'Invalid or unauthorized API key',
          PolygonAPIErrorType.API_KEY_INVALID
        );
      } else if (response.status === 429) {
        throw new PolygonAPIError(
          'API rate limit exceeded. Please try again later',
          PolygonAPIErrorType.RATE_LIMIT_EXCEEDED
        );
      } else if (response.status >= 500) {
        throw new PolygonAPIError(
          'Polygon service is currently unavailable',
          PolygonAPIErrorType.SERVICE_UNAVAILABLE
        );
      } else {
        throw new PolygonAPIError(
          `HTTP error ${response.status} when fetching ${endpointName}`,
          PolygonAPIErrorType.UNKNOWN_ERROR
        );
      }
    }
    
    const data = await response.json();
    
    // Check for API error messages in the response
    if (!data.status || data.status !== 'OK') {
      if (data.error) {
        throw new PolygonAPIError(
          data.error,
          PolygonAPIErrorType.UNKNOWN_ERROR
        );
      }
    }
    
    // Cache the successful response
    API_CACHE.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    console.log(`Caching Polygon data for ${endpointName}`);
    
    return data;
  } catch (error) {
    // Re-throw PolygonAPIError instances
    if (error instanceof PolygonAPIError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new PolygonAPIError(
        'Network error when connecting to Polygon API',
        PolygonAPIErrorType.NETWORK_ERROR
      );
    }
    
    // Default error handling
    throw new PolygonAPIError(
      `Error fetching ${endpointName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      PolygonAPIErrorType.UNKNOWN_ERROR
    );
  }
}

// Get company details including name
export async function getCompanyDetails(symbol: string): Promise<any> {
  const url = `${BASE_URL}/v3/reference/tickers/${symbol.toUpperCase()}?apiKey=${API_KEY}`;
  const data = await fetchPolygonEndpoint(url, 'company details');
  return data.results;
}

// Get real-time stock quote
export async function getStockQuote(symbol: string): Promise<any> {
  const url = `${BASE_URL}/v2/aggs/ticker/${symbol.toUpperCase()}/prev?apiKey=${API_KEY}`;
  const data = await fetchPolygonEndpoint(url, 'stock quote');
  return data.results && data.results.length > 0 ? data.results[0] : null;
}

// Get stock time series data (daily)
export async function getStockTimeSeries(symbol: string): Promise<any> {
  // Get data for the last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  // Format dates as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const url = `${BASE_URL}/v2/aggs/ticker/${symbol.toUpperCase()}/range/1/day/${formatDate(startDate)}/${formatDate(endDate)}?apiKey=${API_KEY}&limit=50`;
  const data = await fetchPolygonEndpoint(url, 'time series');
  return data.results || [];
}

// Get real-time stock data combining all the necessary information
export async function getRealTimeStockData(symbol: string): Promise<StockData> {
  try {
    // Validate inputs
    if (!symbol) {
      return {
        symbol: '',
        currency: "USD",
        error: "Stock symbol is required"
      };
    }
    
    // Clean and format the symbol
    const formattedSymbol = symbol.trim().toUpperCase();
    
    // Check for cached complete result
    const cacheKey = `complete_stock_data_${formattedSymbol}`;
    const cachedStockData = API_CACHE.get(cacheKey);
    
    if (cachedStockData && (Date.now() - cachedStockData.timestamp < CACHE_DURATION)) {
      console.log(`Using cached complete Polygon data for ${formattedSymbol}`);
      return cachedStockData.data as StockData;
    }
    
    // Fetch all required data
    const [quote, timeSeries, companyDetails] = await Promise.all([
      getStockQuote(formattedSymbol).catch(error => {
        console.error(`Error fetching stock quote: ${error.message}`);
        return null;
      }),
      getStockTimeSeries(formattedSymbol).catch(error => {
        console.error(`Error fetching time series: ${error.message}`);
        return [];
      }),
      getCompanyDetails(formattedSymbol).catch(error => {
        console.error(`Error fetching company details: ${error.message}`);
        return null;
      })
    ]);
    
    // If we couldn't get any data, return an error
    if (!quote) {
      return {
        symbol: formattedSymbol,
        currency: "USD",
        error: "No data available for this symbol"
      };
    }
    
    // Process time series data
    const timeSeriesPoints: StockDataPoint[] = timeSeries.map((dataPoint: any) => ({
      date: new Date(dataPoint.t).toISOString().split('T')[0],
      open: dataPoint.o,
      high: dataPoint.h,
      low: dataPoint.l,
      close: dataPoint.c,
      volume: dataPoint.v
    })).sort((a: StockDataPoint, b: StockDataPoint) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Calculate change and change percent
    const price = quote.c; // Current price
    const previousClose = quote.o; // Previous close
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    // Create the final stock data result
    const stockData: StockData = {
      symbol: formattedSymbol,
      name: companyDetails ? companyDetails.name : formattedSymbol,
      currency: "USD",
      price,
      change,
      changePercent,
      timeSeries: timeSeriesPoints
    };
    
    // Cache the complete stock data result
    API_CACHE.set(cacheKey, {
      data: stockData,
      timestamp: Date.now()
    });
    console.log(`Caching complete Polygon data for ${formattedSymbol}`);
    
    return stockData;
  } catch (error) {
    console.error("Error fetching real-time stock data:", error);
    
    // Return a user-friendly error message based on the error type
    if (error instanceof PolygonAPIError) {
      let errorMessage = "Failed to fetch stock data";
      
      switch(error.type) {
        case PolygonAPIErrorType.API_KEY_MISSING:
        case PolygonAPIErrorType.API_KEY_INVALID:
          errorMessage = "API configuration issue. Please contact support.";
          break;
        case PolygonAPIErrorType.RATE_LIMIT_EXCEEDED:
          errorMessage = "Service is temporarily busy. Please try again later.";
          break;
        case PolygonAPIErrorType.INVALID_SYMBOL:
          errorMessage = `Invalid stock symbol: ${symbol}`;
          break;
        case PolygonAPIErrorType.SERVICE_UNAVAILABLE:
          errorMessage = "Stock data service is currently unavailable. Please try again later.";
          break;
        case PolygonAPIErrorType.NETWORK_ERROR:
          errorMessage = "Network error when connecting to the stock data service.";
          break;
      }
      
      return {
        symbol: symbol.toUpperCase(),
        currency: "USD",
        error: errorMessage
      };
    }
    
    return {
      symbol: symbol.toUpperCase(),
      currency: "USD",
      error: "Failed to fetch stock data"
    };
  }
}

// Get top trending stocks based on volume
export async function getTrendingStocks(): Promise<any[]> {
  try {
    const url = `${BASE_URL}/v2/snapshot/locale/us/markets/stocks/gainers?apiKey=${API_KEY}`;
    const data = await fetchPolygonEndpoint(url, 'trending stocks');
    
    return (data.tickers || []).slice(0, 5).map((ticker: any) => ({
      symbol: ticker.ticker,
      name: ticker.ticker, // We don't get names in this endpoint
      price: ticker.day.c,
      change: ticker.day.c - ticker.day.o,
      changePercent: ((ticker.day.c - ticker.day.o) / ticker.day.o) * 100
    }));
  } catch (error) {
    console.error('Error fetching trending stocks:', error);
    return [];
  }
}

// Search for stocks
export async function searchStocks(query: string): Promise<any[]> {
  try {
    if (!query || query.trim() === '') {
      return [];
    }
    
    const url = `${BASE_URL}/v3/reference/tickers?search=${encodeURIComponent(query)}&market=stocks&active=true&apiKey=${API_KEY}`;
    const data = await fetchPolygonEndpoint(url, 'stock search');
    
    return (data.results || []).slice(0, 10).map((result: any) => ({
      symbol: result.ticker,
      name: result.name
    }));
  } catch (error) {
    console.error('Error searching for stocks:', error);
    return [];
  }
}
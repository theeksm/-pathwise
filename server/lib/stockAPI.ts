import fetch from "node-fetch";

// Get Alpha Vantage API key from environment variables
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

// Cache mechanism to reduce API calls
const API_CACHE = new Map<string, { data: any, timestamp: number }>(); 
const CACHE_DURATION = 86400000; // 24 hours in milliseconds

// Error types for better classification and handling
export enum StockAPIErrorType {
  API_KEY_MISSING = 'api_key_missing',
  API_KEY_INVALID = 'api_key_invalid',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_SYMBOL = 'invalid_symbol',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

// Custom error class for StockAPI
export class StockAPIError extends Error {
  type: StockAPIErrorType;
  
  constructor(message: string, type: StockAPIErrorType) {
    super(message);
    this.name = 'StockAPIError';
    this.type = type;
  }
}

// Check if API key is available
if (!API_KEY) {
  console.warn("WARNING: ALPHA_VANTAGE_API_KEY environment variable is not set. Stock data API will not work properly.");
}

// Validate API key and handle common error scenarios
function validateApiKey(): void {
  if (!API_KEY) {
    throw new StockAPIError(
      'Alpha Vantage API key is not set. Please configure the API key to access stock data.',
      StockAPIErrorType.API_KEY_MISSING
    );
  }
}

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
  name?: string;
  currency: string;
  price?: number;
  change?: number;
  changePercent?: number;
  timeSeries?: StockDataPoint[];
  error?: string;
}

// Wrapper function to handle API requests with proper error classification
async function fetchStockEndpoint(url: string, endpointName: string): Promise<any> {
  try {
    validateApiKey();
    
    // Check cache first to reduce API calls
    const cacheKey = url;
    const now = Date.now();
    const cachedResult = API_CACHE.get(cacheKey);
    
    if (cachedResult && (now - cachedResult.timestamp < CACHE_DURATION)) {
      console.log(`Using cached data for ${endpointName}`);
      return cachedResult.data;
    }
    
    const response = await fetch(url);
    
    // Handle HTTP error statuses
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new StockAPIError(
          'Invalid or unauthorized API key',
          StockAPIErrorType.API_KEY_INVALID
        );
      } else if (response.status === 429) {
        throw new StockAPIError(
          'API rate limit exceeded. Please try again later',
          StockAPIErrorType.RATE_LIMIT_EXCEEDED
        );
      } else if (response.status >= 500) {
        throw new StockAPIError(
          'Alpha Vantage service is currently unavailable',
          StockAPIErrorType.SERVICE_UNAVAILABLE
        );
      } else {
        throw new StockAPIError(
          `HTTP error ${response.status} when fetching ${endpointName}`,
          StockAPIErrorType.UNKNOWN_ERROR
        );
      }
    }
    
    const data = await response.json();
    
    // Check for API error messages in the response
    if (data["Error Message"]) {
      // Check for common error patterns
      const errorMessage = data["Error Message"].toLowerCase();
      
      if (errorMessage.includes('invalid api call') || errorMessage.includes('invalid api key')) {
        throw new StockAPIError(
          'Invalid API key or API call format',
          StockAPIErrorType.API_KEY_INVALID
        );
      } else if (errorMessage.includes('invalid symbol')) {
        throw new StockAPIError(
          'Invalid stock symbol provided',
          StockAPIErrorType.INVALID_SYMBOL
        );
      } else {
        throw new StockAPIError(
          data["Error Message"],
          StockAPIErrorType.UNKNOWN_ERROR
        );
      }
    }
    
    // Check for rate limit messages
    if (data["Note"] && data["Note"].toLowerCase().includes('call frequency')) {
      throw new StockAPIError(
        'API call frequency exceeded. Please try again later',
        StockAPIErrorType.RATE_LIMIT_EXCEEDED
      );
    }
    
    // Cache the successful response
    API_CACHE.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    console.log(`Caching data for ${endpointName}`);
    
    return data;
  } catch (error) {
    // Re-throw StockAPIError instances
    if (error instanceof StockAPIError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new StockAPIError(
        'Network error when connecting to Alpha Vantage API',
        StockAPIErrorType.NETWORK_ERROR
      );
    }
    
    // Default error handling
    throw new StockAPIError(
      `Error fetching ${endpointName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      StockAPIErrorType.UNKNOWN_ERROR
    );
  }
}

export async function getStockData(symbol: string): Promise<StockData> {
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
      console.log(`Using cached complete stock data for ${formattedSymbol}`);
      return cachedStockData.data as StockData;
    }
    
    // Get stock quote
    const quoteUrl = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${formattedSymbol}&apikey=${API_KEY}`;
    const quoteData = await fetchStockEndpoint(quoteUrl, 'stock quote');
    
    // Get time series data
    const timeSeriesUrl = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${formattedSymbol}&outputsize=compact&apikey=${API_KEY}`;
    const timeSeriesData = await fetchStockEndpoint(timeSeriesUrl, 'time series');
    
    // Get company overview for the name
    const overviewUrl = `${BASE_URL}?function=OVERVIEW&symbol=${formattedSymbol}&apikey=${API_KEY}`;
    const overviewData = await fetchStockEndpoint(overviewUrl, 'company overview');
    
    // Verify we have actual data
    if (!quoteData["Global Quote"] || Object.keys(quoteData["Global Quote"]).length === 0) {
      return {
        symbol: formattedSymbol,
        currency: "USD",
        error: "No data available for this symbol"
      };
    }
    
    // Extract quote data
    const quote = quoteData["Global Quote"] || {};
    const price = parseFloat(quote["05. price"] || "0");
    const change = parseFloat(quote["09. change"] || "0");
    const changePercent = parseFloat((quote["10. change percent"] || "0%").replace('%', ''));
    
    // Extract time series data
    const timeSeries = timeSeriesData["Time Series (Daily)"] || {};
    const timeSeriesPoints: StockDataPoint[] = Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        volume: parseInt(values["5. volume"])
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Get last 30 days
    
    return {
      symbol: formattedSymbol,
      name: overviewData["Name"] || formattedSymbol,
      currency: "USD",
      price,
      change,
      changePercent,
      timeSeries: timeSeriesPoints
    };
  } catch (error) {
    console.error("Error fetching stock data:", error);
    
    // Return a user-friendly error message based on the error type
    if (error instanceof StockAPIError) {
      let errorMessage = "Failed to fetch stock data";
      
      switch(error.type) {
        case StockAPIErrorType.API_KEY_MISSING:
        case StockAPIErrorType.API_KEY_INVALID:
          errorMessage = "API configuration issue. Please contact support.";
          break;
        case StockAPIErrorType.RATE_LIMIT_EXCEEDED:
          errorMessage = "Service is temporarily busy. Please try again later.";
          break;
        case StockAPIErrorType.INVALID_SYMBOL:
          errorMessage = `Invalid stock symbol: ${symbol}`;
          break;
        case StockAPIErrorType.SERVICE_UNAVAILABLE:
          errorMessage = "Stock data service is currently unavailable. Please try again later.";
          break;
        case StockAPIErrorType.NETWORK_ERROR:
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

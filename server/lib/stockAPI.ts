import fetch from "node-fetch";

// Get Alpha Vantage API key from environment variables
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

// Check if API key is available
if (!API_KEY) {
  console.warn("WARNING: ALPHA_VANTAGE_API_KEY environment variable is not set. Stock data API will not work properly.");
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

export async function getStockData(symbol: string): Promise<StockData> {
  try {
    // Get stock quote
    const quoteUrl = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();
    
    // Get time series data
    const timeSeriesUrl = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`;
    const timeSeriesResponse = await fetch(timeSeriesUrl);
    const timeSeriesData = await timeSeriesResponse.json();
    
    // Get company overview for the name
    const overviewUrl = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
    const overviewResponse = await fetch(overviewUrl);
    const overviewData = await overviewResponse.json();
    
    // Check for all possible error messages from Alpha Vantage API
    if (quoteData["Error Message"] || 
        timeSeriesData["Error Message"] || 
        overviewData["Error Message"] ||
        quoteData["Information"] ||
        timeSeriesData["Information"] ||
        overviewData["Information"] ||
        quoteData["Note"] ||
        timeSeriesData["Note"] ||
        overviewData["Note"]) {
      
      return {
        symbol,
        currency: "USD",
        error: quoteData["Error Message"] || 
               timeSeriesData["Error Message"] || 
               overviewData["Error Message"] ||
               quoteData["Information"] ||
               timeSeriesData["Information"] ||
               overviewData["Information"] ||
               quoteData["Note"] ||
               timeSeriesData["Note"] ||
               overviewData["Note"] ||
               "API limit reached or invalid API key"
      };
    }
    
    // Verify we have actual data
    if (!quoteData["Global Quote"] || Object.keys(quoteData["Global Quote"]).length === 0) {
      return {
        symbol,
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
      symbol,
      name: overviewData["Name"] || symbol,
      currency: "USD",
      price,
      change,
      changePercent,
      timeSeries: timeSeriesPoints
    };
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return {
      symbol,
      currency: "USD",
      error: "Failed to fetch stock data"
    };
  }
}

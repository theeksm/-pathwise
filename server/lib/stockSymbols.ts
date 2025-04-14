import fetch from "node-fetch";
import { StockAPIError, StockAPIErrorType } from "./stockAPI";

// A subset of popular stock symbols and company names to use for auto-suggestions
// This is a small default list that will be used if the API call fails or is unavailable
const DEFAULT_STOCK_SYMBOLS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "DIS", name: "The Walt Disney Company" },
  { symbol: "PYPL", name: "PayPal Holdings Inc." },
  { symbol: "INTC", name: "Intel Corporation" },
  { symbol: "CSCO", name: "Cisco Systems Inc." },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "PEP", name: "PepsiCo Inc." },
  { symbol: "CMCSA", name: "Comcast Corporation" },
  { symbol: "AMD", name: "Advanced Micro Devices Inc." },
  { symbol: "T", name: "AT&T Inc." },
  { symbol: "VZ", name: "Verizon Communications Inc." },
  { symbol: "CRM", name: "Salesforce Inc." }
];

export interface StockSymbol {
  symbol: string;
  name: string;
}

/**
 * Search for stock symbols based on a query string
 * This uses the Alpha Vantage API to search for stocks
 * @param query The search query string
 * @returns A list of matching stock symbols
 */
export async function searchStockSymbols(query: string): Promise<StockSymbol[]> {
  // If no query is provided, return the default list
  if (!query || query.trim().length === 0) {
    return DEFAULT_STOCK_SYMBOLS;
  }

  const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${API_KEY}`;

  try {
    // Validate API key first
    if (!API_KEY) {
      console.warn("Missing Alpha Vantage API key, using default stock symbol list");
      return filterDefaultSymbols(query);
    }

    const response = await fetch(searchUrl);
    
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
      } else {
        throw new StockAPIError(
          `HTTP error ${response.status} when searching for stocks`,
          StockAPIErrorType.UNKNOWN_ERROR
        );
      }
    }

    const data = await response.json();
    
    // Check for proper response format
    if (!data.bestMatches) {
      // If the API doesn't return expected results, fall back to default filtering
      console.warn("Invalid response from Alpha Vantage stock search API");
      return filterDefaultSymbols(query);
    }

    // Map the API results to our StockSymbol interface
    return data.bestMatches.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name']
    }));
  } catch (error) {
    console.error("Error searching for stock symbols:", error);
    // If there's any error, fall back to default list filtering
    return filterDefaultSymbols(query);
  }
}

/**
 * Filter the default list of stock symbols based on a query string
 * @param query The search query string
 * @returns A filtered list of stock symbols
 */
function filterDefaultSymbols(query: string): StockSymbol[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  return DEFAULT_STOCK_SYMBOLS.filter(stock => 
    stock.symbol.toLowerCase().includes(normalizedQuery) || 
    stock.name.toLowerCase().includes(normalizedQuery)
  );
}
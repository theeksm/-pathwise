import fetch from "node-fetch";

// Get News API key from environment variables
const API_KEY = process.env.NEWS_API_KEY || '';
const BASE_URL = "https://newsapi.org/v2";

// Cache mechanism to reduce API calls
const API_CACHE = new Map<string, { data: any, timestamp: number }>(); 
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Error types for better classification and handling
export enum NewsAPIErrorType {
  API_KEY_MISSING = 'api_key_missing',
  API_KEY_INVALID = 'api_key_invalid',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  PARAMETER_ERROR = 'parameter_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

// Custom error class for NewsAPI
export class NewsAPIError extends Error {
  type: NewsAPIErrorType;
  
  constructor(message: string, type: NewsAPIErrorType) {
    super(message);
    this.name = 'NewsAPIError';
    this.type = type;
  }
}

// Check if API key is available
if (!API_KEY) {
  console.warn("WARNING: NEWS_API_KEY environment variable is not set. News API will not work properly.");
}

// Validate API key and handle common error scenarios
function validateApiKey(): void {
  if (!API_KEY) {
    throw new NewsAPIError(
      'News API key is not set. Please configure the API key to access news data.',
      NewsAPIErrorType.API_KEY_MISSING
    );
  }
}

export interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  content?: string;
  imageUrl?: string;
  category?: string;
}

// Wrapper function to handle API requests with proper error classification
async function fetchNewsEndpoint(url: string, endpointName: string): Promise<any> {
  try {
    validateApiKey();
    
    // Check cache first to reduce API calls
    const cacheKey = url;
    const now = Date.now();
    const cachedResult = API_CACHE.get(cacheKey);
    
    if (cachedResult && (now - cachedResult.timestamp < CACHE_DURATION)) {
      console.log(`Using cached News API data for ${endpointName}`);
      return cachedResult.data;
    }
    
    console.log(`Fetching real-time ${endpointName} from News API`);
    const headers: HeadersInit = {
      'X-Api-Key': API_KEY || ''
    };
    const response = await fetch(url, { headers });
    
    // Handle HTTP error statuses
    if (!response.ok) {
      if (response.status === 401) {
        throw new NewsAPIError(
          'Invalid API key',
          NewsAPIErrorType.API_KEY_INVALID
        );
      } else if (response.status === 429) {
        throw new NewsAPIError(
          'API rate limit exceeded. Please try again later',
          NewsAPIErrorType.RATE_LIMIT_EXCEEDED
        );
      } else if (response.status === 400) {
        throw new NewsAPIError(
          'Invalid parameters in the request',
          NewsAPIErrorType.PARAMETER_ERROR
        );
      } else if (response.status >= 500) {
        throw new NewsAPIError(
          'News API service is currently unavailable',
          NewsAPIErrorType.SERVICE_UNAVAILABLE
        );
      } else {
        throw new NewsAPIError(
          `HTTP error ${response.status} when fetching ${endpointName}`,
          NewsAPIErrorType.UNKNOWN_ERROR
        );
      }
    }
    
    const data = await response.json();
    
    // Check for API error responses
    if (data.status === 'error') {
      throw new NewsAPIError(
        data.message || 'Unknown error from News API',
        NewsAPIErrorType.UNKNOWN_ERROR
      );
    }
    
    // Cache the successful response
    API_CACHE.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    console.log(`Caching News API data for ${endpointName}`);
    
    return data;
  } catch (error) {
    // Re-throw NewsAPIError instances
    if (error instanceof NewsAPIError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new NewsAPIError(
        'Network error when connecting to News API',
        NewsAPIErrorType.NETWORK_ERROR
      );
    }
    
    // Default error handling
    throw new NewsAPIError(
      `Error fetching ${endpointName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      NewsAPIErrorType.UNKNOWN_ERROR
    );
  }
}

// Get top tech news
export async function getTechNews(): Promise<NewsArticle[]> {
  try {
    // Get tech news from the last 7 days
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const fromDate = date.toISOString().split('T')[0];
    
    // Build the URL with parameters
    const url = `${BASE_URL}/everything?q=technology+OR+tech+industry&language=en&sortBy=publishedAt&from=${fromDate}&pageSize=10`;
    
    const data = await fetchNewsEndpoint(url, 'tech news');
    
    // Process the articles
    return (data.articles || []).map((article: any) => ({
      title: article.title,
      description: article.description,
      source: article.source.name,
      url: article.url,
      publishedAt: article.publishedAt,
      content: article.content,
      imageUrl: article.urlToImage,
      category: 'Tech News'
    }));
  } catch (error) {
    console.error('Error fetching tech news:', error);
    return [];
  }
}

// Get tech job market news
export async function getTechJobMarketNews(): Promise<NewsArticle[]> {
  try {
    // Get job market news from the last 7 days
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const fromDate = date.toISOString().split('T')[0];
    
    // Build the URL with parameters
    const url = `${BASE_URL}/everything?q=(tech+OR+technology)+AND+(jobs+OR+hiring+OR+employment)&language=en&sortBy=publishedAt&from=${fromDate}&pageSize=5`;
    
    const data = await fetchNewsEndpoint(url, 'tech job market news');
    
    // Process the articles
    return (data.articles || []).map((article: any) => ({
      title: article.title,
      description: article.description,
      source: article.source.name,
      url: article.url,
      publishedAt: article.publishedAt,
      content: article.content,
      imageUrl: article.urlToImage,
      category: 'Tech Jobs'
    }));
  } catch (error) {
    console.error('Error fetching tech job market news:', error);
    return [];
  }
}

// Get all tech-related news
export async function getAllTechNews(): Promise<NewsArticle[]> {
  try {
    const [techNews, jobMarketNews] = await Promise.all([
      getTechNews().catch(error => {
        console.error('Error fetching tech news:', error);
        return [];
      }),
      getTechJobMarketNews().catch(error => {
        console.error('Error fetching job market news:', error);
        return [];
      })
    ]);
    
    // Combine and sort by publish date (newest first)
    return [...techNews, ...jobMarketNews]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching all tech news:', error);
    return [];
  }
}
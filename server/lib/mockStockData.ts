import { DEFAULT_STOCK_SYMBOLS } from './stockSymbols';

// Generate mock time series for common stocks
const generateMockTimeSeries = (symbol: string, days: number = 30) => {
  // Seed the random number with symbol to get consistent but different results for each stock
  const symbolSeed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Base price depends on the symbol to make this somewhat realistic
  let basePrice = 50 + (symbolSeed % 200);
  
  // Well-known stocks get more realistic base prices
  if (symbol === 'AAPL') basePrice = 180;
  if (symbol === 'MSFT') basePrice = 350;
  if (symbol === 'GOOGL') basePrice = 140;
  if (symbol === 'AMZN') basePrice = 160;
  if (symbol === 'META') basePrice = 480;
  if (symbol === 'TSLA') basePrice = 170;
  if (symbol === 'NVDA') basePrice = 850;
  
  // Generate time series data
  const timeSeries = [];
  const now = new Date();
  
  // Starting volatility - will be used to make the price movements seem realistic
  const volatility = 0.02; 
  
  // Mock some trends based on symbol
  let trend = 0;
  const lastDigit = parseInt(symbolSeed.toString().slice(-1));
  if (lastDigit < 3) trend = -0.001; // Downward trend
  else if (lastDigit > 7) trend = 0.001; // Upward trend
  
  // Generate data points for the last 'days' days
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Price change with some randomness, trend, and volatility
    const changePercent = (Math.random() - 0.5) * volatility + trend;
    basePrice = basePrice * (1 + changePercent);
    
    // Calculate other values based on the close price
    const close = basePrice;
    const open = close * (1 + (Math.random() - 0.5) * 0.01);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(1000000 + Math.random() * 10000000);
    
    timeSeries.push({
      date: formatDate(date),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });
  }
  
  return timeSeries;
};

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get a company name for a symbol
function getCompanyName(symbol: string): string {
  const found = DEFAULT_STOCK_SYMBOLS.find((s: { symbol: string; name: string }) => s.symbol === symbol);
  return found ? found.name : `${symbol} Inc.`;
}

// Get dummy stock data for a symbol when the API fails
export function getMockStockData(symbol: string) {
  const formattedSymbol = symbol.toUpperCase();
  const timeSeries = generateMockTimeSeries(formattedSymbol);
  
  // Calculate price, change, and change percent based on the last two days of time series
  const lastDay = timeSeries[timeSeries.length - 1];
  const dayBefore = timeSeries[timeSeries.length - 2];
  
  const price = lastDay.close;
  const change = price - dayBefore.close;
  const changePercent = (change / dayBefore.close) * 100;
  
  return {
    symbol: formattedSymbol,
    name: getCompanyName(formattedSymbol),
    currency: "USD",
    price,
    change,
    changePercent,
    timeSeries
  };
}
export interface Outcome {
  id: string;
  name: string; // "Yes" or "No"
  price: number; // Current price (probability) between 0 and 1
}

export interface MarketHistoryPoint {
  date: string;
  price: number;
}

export interface Market {
  id: string;
  question: string;
  description: string;
  image: string;
  category: 'Crypto' | 'Politics' | 'Sports' | 'Business' | 'Pop Culture';
  volume: number; // Total volume in USD
  endDate: string;
  outcomes: Outcome[]; // Usually [Yes, No]
  history: MarketHistoryPoint[];
}

export interface Position {
  marketId: string;
  outcomeId: string; // "Yes" or "No"
  shares: number;
  avgPrice: number;
  currentValue: number;
}

export interface NotificationPreferences {
  marketAlerts: boolean;
  priceChanges: boolean;
}

export interface User {
  address: string | null;
  balance: number; // USDC balance
  positions: Position[];
  notificationPreferences: NotificationPreferences;
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  isAi?: boolean;
}

export interface TradeActivity {
  id: string;
  user: string;
  type: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  amount: number;
  timestamp: string;
}

export interface MarketSentiment {
  score: number; // 0 to 100 (0 = Bearish, 100 = Bullish)
  summary: string;
  bullishFactors: string[];
  bearishFactors: string[];
}
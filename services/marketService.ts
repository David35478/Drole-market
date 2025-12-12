import { Market, User, Position, Comment, NotificationPreferences } from '../types';
import { MOCK_MARKETS } from '../constants';

// Keys for persistence
const STORAGE_KEYS = {
  USER: 'drole_user_v1',
  MARKETS: 'drole_markets_v1',
  COMMENTS: 'drole_comments_v1'
};

// Simulated database state
let markets: Market[] = [...MOCK_MARKETS];
let user: User = {
  address: null,
  balance: 0,
  positions: [],
  notificationPreferences: {
    marketAlerts: true,
    priceChanges: false
  }
};
let comments: Record<string, Comment[]> = {};

// Load state from local storage on init
try {
  const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
  if (storedUser) {
    user = JSON.parse(storedUser);
  }

  const storedMarkets = localStorage.getItem(STORAGE_KEYS.MARKETS);
  if (storedMarkets) {
    // Merge stored markets with mock structure to ensure types match (optional safety)
    markets = JSON.parse(storedMarkets);
  }

  const storedComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
  if (storedComments) {
    comments = JSON.parse(storedComments);
  }
} catch (e) {
  console.warn("Failed to load persistence data", e);
}

// Helper to save state
const saveState = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    // We only save markets if we want to persist price changes/new markets
    localStorage.setItem(STORAGE_KEYS.MARKETS, JSON.stringify(markets));
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  } catch (e) {
    console.warn("Failed to save state", e);
  }
};

// Listeners for updates (simulating websocket/polling)
type Listener = () => void;
const listeners: Set<Listener> = new Set();

const notify = () => {
  listeners.forEach(l => l());
};

// Simulation Logic
const simulateTrading = () => {
  markets = markets.map(market => {
    // 30% chance to update any given market per tick
    if (Math.random() > 0.3) return market;

    const outcomeIndex = 0; // YES outcome
    const currentPrice = market.outcomes[outcomeIndex].price;
    
    // Random fluctuation between -2% and +2%
    const change = (Math.random() - 0.5) * 0.04;
    let newPrice = currentPrice + change;
    
    // Clamp between 1% and 99%
    newPrice = Math.max(0.01, Math.min(0.99, newPrice));
    
    // Update YES/NO
    const newOutcomes = [...market.outcomes];
    newOutcomes[0] = { ...newOutcomes[0], price: newPrice };
    newOutcomes[1] = { ...newOutcomes[1], price: 1 - newPrice };

    // Update History
    const newHistoryPoint = {
      date: new Date().toLocaleTimeString(),
      price: newPrice
    };
    // Keep last 50 points
    const newHistory = [...market.history, newHistoryPoint].slice(-50);

    // Update Volume occasionally
    const volumeChange = Math.floor(Math.random() * 10000);

    return {
      ...market,
      outcomes: newOutcomes,
      history: newHistory,
      volume: market.volume + volumeChange
    };
  });
  notify();
  // Don't save on every tick to avoid thrashing disk I/O, 
  // but in a real app this would be DB updates.
  // We'll save only on significant user actions or periodically.
};

// Start simulation loop
let simulationInterval: any = null;
const startSimulation = () => {
  if (!simulationInterval) {
    simulationInterval = setInterval(simulateTrading, 3000);
  }
};

export const MarketService = {
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    // Start simulation when first component subscribes
    startSimulation();
    return () => listeners.delete(listener);
  },

  getMarkets: () => markets,
  
  getMarket: (id: string) => markets.find(m => m.id === id),

  getUser: () => user,

  updateNotificationPreferences: (key: keyof NotificationPreferences, value: boolean) => {
    user.notificationPreferences = {
        ...user.notificationPreferences,
        [key]: value
    };
    saveState();
    notify();
  },

  // Comments Management
  getComments: (marketId: string): Comment[] => {
    if (!comments[marketId]) {
      const market = markets.find(m => m.id === marketId);
      // Initialize with specific mock data based on market content
      comments[marketId] = [
        { 
          id: `c1-${marketId}`, 
          user: 'MarketMaker', 
          text: `Liquidity is looking good for ${market?.category || 'this market'}.`, 
          timestamp: '09:00 AM' 
        },
        { 
          id: `c2-${marketId}`, 
          user: 'Anon', 
          text: market?.question.includes('Bitcoin') ? 'To the moon! 🚀' : 'Interesting odds... I might take a position.', 
          timestamp: '09:15 AM' 
        }
      ];
      saveState();
    }
    return comments[marketId];
  },

  addComment: (marketId: string, text: string): Comment => {
     const newComment: Comment = {
       id: Date.now().toString(),
       user: user.address ? 'You' : 'Guest',
       text,
       timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
     };
     
     if (!comments[marketId]) comments[marketId] = [];
     comments[marketId].push(newComment);
     saveState();
     return newComment;
  },

  createMarket: (data: { question: string, description: string, category: string, endDate: string, image: string }) => {
    const newMarket: Market = {
      id: Math.random().toString(36).substr(2, 9),
      question: data.question,
      description: data.description,
      image: data.image || `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
      category: data.category as any,
      volume: 0,
      endDate: new Date(data.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      outcomes: [
        { id: 'YES', name: 'Yes', price: 0.5 },
        { id: 'NO', name: 'No', price: 0.5 }
      ],
      history: [
        { date: new Date().toLocaleDateString(), price: 0.5 }
      ]
    };
    markets.unshift(newMarket); // Add to top
    saveState();
    notify();
    return newMarket.id;
  },

  connectWallet: async () => {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check for actual ethereum object (optional, for realism if user has metamask)
    let address = "0x71C...9A21";
    // @ts-ignore
    if (window.ethereum) {
      try {
        // @ts-ignore
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) address = accounts[0].slice(0, 6) + "..." + accounts[0].slice(-4);
      } catch (e) {
        console.warn("Real wallet connect failed, using mock", e);
      }
    }

    user = { ...user, address, balance: user.balance > 0 ? user.balance : 1000.00 }; // Keep balance if already set, else default 1000
    saveState();
    notify();
  },

  disconnectWallet: () => {
    // We keep the balance in state to simulate a persistent wallet, 
    // but in a real app, disconnecting clears the session.
    // For this demo, let's clear the session but maybe keep the data in localStorage for next connect?
    // Actually, let's just nullify the address.
    user = { 
        ...user,
        address: null
    };
    saveState();
    notify();
  },

  buyShares: (marketId: string, outcomeId: string, amountUSD: number) => {
    if (!user.address) throw new Error("Wallet not connected");
    if (user.balance < amountUSD) throw new Error("Insufficient balance");

    const market = markets.find(m => m.id === marketId);
    if (!market) throw new Error("Market not found");

    const outcomeIndex = market.outcomes.findIndex(o => o.id === outcomeId);
    if (outcomeIndex === -1) throw new Error("Invalid outcome");
    
    const outcome = market.outcomes[outcomeIndex];
    const sharesBought = amountUSD / outcome.price;

    // Deduct balance
    user.balance -= amountUSD;

    // Update or Create Position
    const existingPosIndex = user.positions.findIndex(p => p.marketId === marketId && p.outcomeId === outcomeId);
    if (existingPosIndex > -1) {
      const p = user.positions[existingPosIndex];
      const totalCost = (p.shares * p.avgPrice) + amountUSD;
      const totalShares = p.shares + sharesBought;
      user.positions[existingPosIndex] = {
        ...p,
        shares: totalShares,
        avgPrice: totalCost / totalShares,
        currentValue: totalShares * outcome.price
      };
    } else {
      user.positions.push({
        marketId,
        outcomeId,
        shares: sharesBought,
        avgPrice: outcome.price,
        currentValue: sharesBought * outcome.price
      });
    }

    // Simulate price impact (very simple: buying YES increases YES price)
    const impact = amountUSD * 0.00001;
    const newPrice = Math.min(0.99, outcome.price + impact);
    const inverseNewPrice = 1 - newPrice; // Assuming binary market

    // Update market state
    const newOutcomes = [...market.outcomes];
    newOutcomes[outcomeIndex] = { ...outcome, price: newPrice };
    newOutcomes[outcomeIndex === 0 ? 1 : 0] = { ...market.outcomes[outcomeIndex === 0 ? 1 : 0], price: inverseNewPrice };

    // Update Market
    markets = markets.map(m => m.id === marketId ? { ...m, outcomes: newOutcomes, volume: m.volume + amountUSD } : m);
    
    saveState();
    notify();
  },

  sellShares: (marketId: string, outcomeId: string, percent: number) => {
     // percent 0-1
     if (!user.address) throw new Error("Wallet not connected");
     
     const posIndex = user.positions.findIndex(p => p.marketId === marketId && p.outcomeId === outcomeId);
     if (posIndex === -1) throw new Error("No position found");

     const pos = user.positions[posIndex];
     const market = markets.find(m => m.id === marketId);
     if(!market) throw new Error("Market not found");
     
     const outcome = market.outcomes.find(o => o.id === outcomeId);
     if(!outcome) throw new Error("Outcome error");

     const sharesToSell = pos.shares * percent;
     const returnAmount = sharesToSell * outcome.price;

     user.balance += returnAmount;

     // Update position
     const remainingShares = pos.shares - sharesToSell;
     if (remainingShares < 0.0001) {
         user.positions.splice(posIndex, 1);
     } else {
         user.positions[posIndex] = {
             ...pos,
             shares: remainingShares,
             currentValue: remainingShares * outcome.price
         };
     }

     saveState();
     notify();
  }
};        { 
          id: `c2-${marketId}`, 
          user: 'Anon', 
          text: market?.question.includes('Bitcoin') ? 'To the moon! 🚀' : 'Interesting odds... I might take a position.', 
          timestamp: '09:15 AM' 
        }
      ];
    }
    return comments[marketId];
  },

  addComment: (marketId: string, text: string): Comment => {
     const newComment: Comment = {
       id: Date.now().toString(),
       user: user.address ? 'You' : 'Guest',
       text,
       timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
     };
     
     if (!comments[marketId]) comments[marketId] = [];
     comments[marketId].push(newComment);
     return newComment;
  },

  createMarket: (data: { question: string, description: string, category: string, endDate: string, image: string }) => {
    const newMarket: Market = {
      id: Math.random().toString(36).substr(2, 9),
      question: data.question,
      description: data.description,
      image: data.image || `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
      category: data.category as any,
      volume: 0,
      endDate: new Date(data.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      outcomes: [
        { id: 'YES', name: 'Yes', price: 0.5 },
        { id: 'NO', name: 'No', price: 0.5 }
      ],
      history: [
        { date: new Date().toLocaleDateString(), price: 0.5 }
      ]
    };
    markets.unshift(newMarket); // Add to top
    notify();
    return newMarket.id;
  },

  connectWallet: async () => {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check for actual ethereum object (optional, for realism if user has metamask)
    let address = "0x71C...9A21";
    // @ts-ignore
    if (window.ethereum) {
      try {
        // @ts-ignore
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) address = accounts[0].slice(0, 6) + "..." + accounts[0].slice(-4);
      } catch (e) {
        console.warn("Real wallet connect failed, using mock", e);
      }
    }

    user = { ...user, address, balance: 1000.00 }; // Give 1000 mock USDC on connect
    notify();
  },

  disconnectWallet: () => {
    user = { 
        address: null, 
        balance: 0, 
        positions: [],
        notificationPreferences: user.notificationPreferences 
    };
    notify();
  },

  buyShares: (marketId: string, outcomeId: string, amountUSD: number) => {
    if (!user.address) throw new Error("Wallet not connected");
    if (user.balance < amountUSD) throw new Error("Insufficient balance");

    const market = markets.find(m => m.id === marketId);
    if (!market) throw new Error("Market not found");

    const outcomeIndex = market.outcomes.findIndex(o => o.id === outcomeId);
    if (outcomeIndex === -1) throw new Error("Invalid outcome");
    
    const outcome = market.outcomes[outcomeIndex];
    const sharesBought = amountUSD / outcome.price;

    // Deduct balance
    user.balance -= amountUSD;

    // Update or Create Position
    const existingPosIndex = user.positions.findIndex(p => p.marketId === marketId && p.outcomeId === outcomeId);
    if (existingPosIndex > -1) {
      const p = user.positions[existingPosIndex];
      const totalCost = (p.shares * p.avgPrice) + amountUSD;
      const totalShares = p.shares + sharesBought;
      user.positions[existingPosIndex] = {
        ...p,
        shares: totalShares,
        avgPrice: totalCost / totalShares,
        currentValue: totalShares * outcome.price
      };
    } else {
      user.positions.push({
        marketId,
        outcomeId,
        shares: sharesBought,
        avgPrice: outcome.price,
        currentValue: sharesBought * outcome.price
      });
    }

    // Simulate price impact (very simple: buying YES increases YES price)
    const impact = amountUSD * 0.00001;
    const newPrice = Math.min(0.99, outcome.price + impact);
    const inverseNewPrice = 1 - newPrice; // Assuming binary market

    // Update market state
    const newOutcomes = [...market.outcomes];
    newOutcomes[outcomeIndex] = { ...outcome, price: newPrice };
    newOutcomes[outcomeIndex === 0 ? 1 : 0] = { ...market.outcomes[outcomeIndex === 0 ? 1 : 0], price: inverseNewPrice };

    // Update Market
    markets = markets.map(m => m.id === marketId ? { ...m, outcomes: newOutcomes, volume: m.volume + amountUSD } : m);
    
    notify();
  },

  sellShares: (marketId: string, outcomeId: string, percent: number) => {
     // percent 0-1
     if (!user.address) throw new Error("Wallet not connected");
     
     const posIndex = user.positions.findIndex(p => p.marketId === marketId && p.outcomeId === outcomeId);
     if (posIndex === -1) throw new Error("No position found");

     const pos = user.positions[posIndex];
     const market = markets.find(m => m.id === marketId);
     if(!market) throw new Error("Market not found");
     
     const outcome = market.outcomes.find(o => o.id === outcomeId);
     if(!outcome) throw new Error("Outcome error");

     const sharesToSell = pos.shares * percent;
     const returnAmount = sharesToSell * outcome.price;

     user.balance += returnAmount;

     // Update position
     const remainingShares = pos.shares - sharesToSell;
     if (remainingShares < 0.0001) {
         user.positions.splice(posIndex, 1);
     } else {
         user.positions[posIndex] = {
             ...pos,
             shares: remainingShares,
             currentValue: remainingShares * outcome.price
         };
     }

     notify();
  }
};

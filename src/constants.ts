import { Market } from './types';

const today = new Date();

export const MOCK_MARKETS: Market[] = [
  {
    id: '1',
    question: 'Will Bitcoin hit $150k in 2025?',
    description: 'This market resolves to "Yes" if the price of Bitcoin hits $150,000.00 USD or greater on Coinbase before January 1, 2026, 11:59:59 PM ET.',
    image: 'https://picsum.photos/200/200?random=1',
    category: 'Crypto',
    volume: 18420000,
    endDate: 'Dec 31, 2025',
    outcomes: [
      { id: 'YES', name: 'Yes', price: 0.32 },
      { id: 'NO', name: 'No', price: 0.68 }
    ],
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      price: 0.2 + Math.random() * 0.2
    }))
  },
  {
    id: '2',
    question: 'Will the US Federal Reserve cut interest rates in Q3 2025?',
    description: 'This market resolves based on the official announcement from the FOMC meeting regarding the Federal Funds Rate in Q3 2025.',
    image: 'https://picsum.photos/200/200?random=2',
    category: 'Business',
    volume: 8500000,
    endDate: 'Sep 30, 2025',
    outcomes: [
      { id: 'YES', name: 'Yes', price: 0.75 },
      { id: 'NO', name: 'No', price: 0.25 }
    ],
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      price: 0.6 + Math.random() * 0.2
    }))
  },
  {
    id: '3',
    question: 'Will a human land on Mars before 2030?',
    description: 'Resolves to Yes if a human sets foot on the surface of Mars before Jan 1, 2030.',
    image: 'https://picsum.photos/200/200?random=3',
    category: 'Pop Culture',
    volume: 230000,
    endDate: 'Dec 31, 2029',
    outcomes: [
      { id: 'YES', name: 'Yes', price: 0.05 },
      { id: 'NO', name: 'No', price: 0.95 }
    ],
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      price: 0.04 + Math.random() * 0.03
    }))
  },
  {
    id: '4',
    question: 'Who will win the 2025 NBA Championship?',
    description: 'This market generally tracks the NBA finals winner for the 2024-2025 season.',
    image: 'https://picsum.photos/200/200?random=4',
    category: 'Sports',
    volume: 4500000,
    endDate: 'June 20, 2025',
    outcomes: [
      { id: 'YES', name: 'Celtics', price: 0.40 },
      { id: 'NO', name: 'Others', price: 0.60 }
    ],
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      price: 0.4 + Math.random() * 0.4
    }))
  },
  {
    id: '5',
    question: 'Will GPT-6 be released before 2026?',
    description: 'Resolves yes if OpenAI releases a model explicitly named GPT-6 or equivalent successor to GPT-5.',
    image: 'https://picsum.photos/200/200?random=5',
    category: 'Business',
    volume: 1200000,
    endDate: 'Dec 31, 2025',
    outcomes: [
      { id: 'YES', name: 'Yes', price: 0.45 },
      { id: 'NO', name: 'No', price: 0.55 }
    ],
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      price: 0.3 + Math.random() * 0.3
    }))
  }
];

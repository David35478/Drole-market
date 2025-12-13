import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MarketCard from '../components/MarketCard';
import MarketDetail from '../components/MarketDetail';
import Portfolio from '../components/Portfolio';
import CreateMarketForm from '../components/CreateMarketForm';
import { MarketService } from '../services/marketService';
import { Market, User } from '../types';
import { TrendingUp, Zap, Clock, Globe, Trophy, Briefcase, Search, SlidersHorizontal, LayoutGrid, PieChart, PlusCircle, User as UserIcon, Bookmark } from 'lucide-react';

const MAIN_TABS = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'breaking', label: 'Breaking', icon: Zap },
  { id: 'new', label: 'New', icon: Clock },
  { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
  { id: 'politics', label: 'Politics', icon: Globe },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'business', label: 'Business', icon: Briefcase },
];

const SUB_TAGS = [
  { id: 'all', label: 'All' },
  { id: 'trump', label: 'Trump' },
  { id: 'fed', label: 'Fed' },
  { id: 'crypto', label: 'Crypto' },
  { id: '2025', label: '2025' },
  { id: 'gpt', label: 'AI' },
];

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'market' | 'portfolio' | 'create'>('home');
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [selectedMainTab, setSelectedMainTab] = useState('trending');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState<'volume' | 'newest'>('volume');
  const [user, setUser] = useState<User>(MarketService.getUser());
  const [markets, setMarkets] = useState<Market[]>(MarketService.getMarkets());
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Subscribe to backend updates
    const unsubscribe = MarketService.subscribe(() => {
      setUser({ ...MarketService.getUser() });
      setMarkets([...MarketService.getMarkets()]);
    });
    return unsubscribe;
  }, []);

  // Load bookmarks on mount
  useEffect(() => {
    try {
        const stored = localStorage.getItem('poly_bookmarks');
        if (stored) {
            setBookmarkedIds(new Set(JSON.parse(stored)));
        }
    } catch (e) {
        console.error("Failed to load bookmarks", e);
    }
  }, []);

  const toggleBookmark = (id: string) => {
    const newSet = new Set(bookmarkedIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setBookmarkedIds(newSet);
    localStorage.setItem('poly_bookmarks', JSON.stringify(Array.from(newSet)));
  };

  // Hash router simulation
  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash.startsWith('#/market/')) {
            const id = hash.split('/')[2];
            setSelectedMarketId(id);
            setView('market');
        } else if (hash === '#/portfolio') {
            setView('portfolio');
        } else if (hash === '#/create') {
            setView('create');
        } else {
            setView('home');
            setSelectedMarketId(null);
        }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Init
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToMarket = (id: string) => {
    window.location.hash = `#/market/${id}`;
  };

  const filteredAndSortedMarkets = markets
    .filter(m => {
      // 1. Tab Filtering
      if (selectedMainTab === 'watchlist' && !bookmarkedIds.has(m.id)) return false;
      if (selectedMainTab === 'politics' && m.category !== 'Politics') return false;
      if (selectedMainTab === 'sports' && m.category !== 'Sports') return false;
      if (selectedMainTab === 'business' && m.category !== 'Business') return false;
      
      // 2. Tag Filtering (Strict)
      const tagTerm = selectedTag.toLowerCase();
      const matchesTag = selectedTag === 'all' || 
                         m.question.toLowerCase().includes(tagTerm) || 
                         m.category.toLowerCase().includes(tagTerm);
      
      if (!matchesTag) return false;

      // 3. Search Filtering (Broad: Question OR Description OR Category)
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return m.question.toLowerCase().includes(term) || 
             m.description.toLowerCase().includes(term) ||
             m.category.toLowerCase().includes(term);
    })
    .sort((a, b) => {
      // 1. Search Relevance Priority (Question Match > Others)
      if (searchQuery) {
        const term = searchQuery.toLowerCase();
        const aTitleMatch = a.question.toLowerCase().includes(term);
        const bTitleMatch = b.question.toLowerCase().includes(term);
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
      }

      // 2. User Selected Sort
      if (sortBy === 'volume') {
        return b.volume - a.volume;
      }
      if (sortBy === 'newest') {
        // Assuming higher ID is newer for this mock data
        return parseInt(b.id) - parseInt(a.id); 
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-poly-bg text-poly-text font-sans selection:bg-poly-blue selection:text-white pb-24 md:pb-20">
      <Navbar 
        user={user} 
        view={view}
        onSearch={setSearchQuery} 
        onMenuToggle={() => {}}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Main Content */}
        <main className="py-6 min-h-[calc(100vh-64px)]">
          {view === 'home' && (
             <div className="space-y-6 animate-fade-in">
                
                {/* 1. Main Navigation Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                  {MAIN_TABS.map(tab => {
                    const isActive = selectedMainTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedMainTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                          isActive 
                            ? 'bg-poly-card text-white border border-poly-hover shadow-lg' 
                            : 'text-poly-subtext hover:text-white hover:bg-poly-hover/50'
                        }`}
                      >
                        <tab.icon size={16} className={isActive ? 'text-poly-blue' : ''} />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* 2. Sub Filters (Tags) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                  {SUB_TAGS.map(tag => {
                    const isActive = selectedTag === tag.id;
                    return (
                      <button
                        key={tag.id}
                        onClick={() => setSelectedTag(tag.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                          isActive 
                            ? 'bg-poly-blue text-white border-poly-blue' 
                            : 'bg-transparent text-poly-subtext border-poly-hover hover:border-poly-subtext hover:text-white'
                        }`}
                      >
                        {tag.label}
                      </button>
                    )
                  })}
                </div>

                {/* 3. Search and Sort Row */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-poly-subtext">
                            <Search size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search markets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-poly-card border border-poly-hover text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-poly-blue focus:ring-1 focus:ring-poly-blue tr[...]"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-poly-subtext">
                             <SlidersHorizontal size={16} />
                        </div>
                        <select 
                             value={sortBy}
                             onChange={(e) => setSortBy(e.target.value as any)}
                             className="appearance-none bg-poly-card border border-poly-hover text-white rounded-xl py-3 pl-10 pr-8 focus:outline-none focus:border-poly-blue cursor-pointer h-full font[...]"
                        >
                            <option value="volume">24hr Volume</option>
                            <option value="newest">Newest</option>
                        </select>
                    </div>
                </div>

                {/* Market List */}
                <div className="space-y-3">
                  {filteredAndSortedMarkets.map(market => (
                    <MarketCard 
                        key={market.id} 
                        market={market} 
                        onClick={navigateToMarket} 
                        isBookmarked={bookmarkedIds.has(market.id)}
                        onToggleBookmark={() => toggleBookmark(market.id)}
                    />
                  ))}
                  {filteredAndSortedMarkets.length === 0 && (
                      <div className="text-center py-20 text-poly-subtext">
                          No markets found.
                      </div>
                  )}
                </div>
             </div>
          )}

          {view === 'market' && selectedMarketId && (
            <MarketDetail 
                marketId={selectedMarketId} 
                user={user}
                onBack={() => window.location.hash = '#/'}
            />
          )}

          {view === 'portfolio' && (
              <Portfolio user={user} markets={markets} />
          )}

          {view === 'create' && (
              <CreateMarketForm 
                onBack={() => window.location.hash = '#/'}
                onSuccess={(id) => window.location.hash = `#/market/${id}`}
              />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-poly-card/95 backdrop-blur-md border-t border-poly-hover pb-safe pt-2 px-6 flex justify-between z-50 h-16 shadow-[0_-4px_6px_-1px_rgba([...)]
         <button 
           onClick={() => window.location.hash = '#/'}
           className={`flex flex-col items-center gap-1 w-16 ${view === 'home' ? 'text-poly-blue' : 'text-poly-subtext'}`}
         >
             <LayoutGrid size={24} />
             <span className="text-[10px] font-medium">Markets</span>
         </button>
         <button 
           onClick={() => window.location.hash = '#/portfolio'}
           className={`flex flex-col items-center gap-1 w-16 ${view === 'portfolio' ? 'text-poly-blue' : 'text-poly-subtext'}`}
         >
             <PieChart size={24} />
             <span className="text-[10px] font-medium">Portfolio</span>
         </button>
         <button 
           onClick={() => window.location.hash = '#/create'}
           className={`flex flex-col items-center gap-1 w-16 ${view === 'create' ? 'text-poly-blue' : 'text-poly-subtext'}`}
         >
             <PlusCircle size={24} />
             <span className="text-[10px] font-medium">Host</span>
         </button>
         <button 
           onClick={() => {}} // Placeholder for profile/settings
           className="flex flex-col items-center gap-1 w-16 text-poly-subtext opacity-50 cursor-not-allowed"
         >
             <UserIcon size={24} />
             <span className="text-[10px] font-medium">Profile</span>
         </button>
      </div>

    </div>
  );
};

export default App;

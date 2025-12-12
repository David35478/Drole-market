import React, { useState, useEffect, useRef } from 'react';
import { Market, TradeActivity, Comment, MarketSentiment, User } from '../types';
import { getMarketSentiment } from '../services/geminiService';
import { MarketService } from '../services/marketService';
import { MessageSquare, Activity, Zap, Send, User as UserIcon, BrainCircuit, TrendingUp, TrendingDown } from 'lucide-react';

interface MarketPulseProps {
  market: Market;
  user: User;
}

const MarketPulse: React.FC<MarketPulseProps> = ({ market, user }) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'chat' | 'sentiment'>('sentiment');
  const [trades, setTrades] = useState<TradeActivity[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
  const [loadingSentiment, setLoadingSentiment] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial Data & Simulation
  useEffect(() => {
    // RESET state when market changes
    setTrades([]);
    setComments([]);
    setSentiment(null);

    // 1. Fetch Sentiment
    const fetchSentiment = async () => {
      setLoadingSentiment(true);
      const data = await getMarketSentiment(market);
      setSentiment(data);
      setLoadingSentiment(false);
    };
    fetchSentiment();

    // 2. Load Comments Specific to Market
    const loadedComments = MarketService.getComments(market.id);
    setComments(loadedComments);

    // 3. Mock Initial Trades (Fresh for this market)
    const initialTrades: TradeActivity[] = Array.from({ length: 5 }, (_, i) => ({
      id: `t-${i}-${market.id}`,
      user: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
      type: Math.random() > 0.5 ? 'BUY' : 'SELL',
      outcome: Math.random() > 0.5 ? 'YES' : 'NO',
      amount: Math.floor(Math.random() * 500) + 10,
      timestamp: new Date(Date.now() - i * 1000 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
    setTrades(initialTrades);

    // 4. Live Simulation Interval
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newTrade: TradeActivity = {
          id: `t-${Date.now()}`,
          user: `0x${Math.random().toString(16).substr(2, 4)}...`,
          type: Math.random() > 0.7 ? 'BUY' : 'SELL',
          outcome: Math.random() > 0.5 ? 'YES' : 'NO',
          amount: Math.floor(Math.random() * 200) + 10,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setTrades(prev => [newTrade, ...prev].slice(0, 20));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [market.id]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // Save to service
    const comment = MarketService.addComment(market.id, newComment);
    
    setComments(prev => [...prev, comment]);
    setNewComment('');
    
    // Auto-scroll
    setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 100);
  };

  return (
    <div className="bg-poly-card border border-poly-hover rounded-2xl overflow-hidden flex flex-col h-[500px]">
      {/* Header Tabs */}
      <div className="flex border-b border-poly-hover bg-poly-bg/50">
        <button 
          onClick={() => setActiveTab('sentiment')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${activeTab === 'sentiment' ? 'text-poly-blue bg-poly-hover/50' : 'text-poly-subtext hover:text-white'}`}
        >
          <BrainCircuit size={16} /> AI Pulse
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${activeTab === 'activity' ? 'text-poly-blue bg-poly-hover/50' : 'text-poly-subtext hover:text-white'}`}
        >
          <Activity size={16} /> Activity
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'text-poly-blue bg-poly-hover/50' : 'text-poly-subtext hover:text-white'}`}
        >
          <MessageSquare size={16} /> Chat
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={scrollRef}>
        
        {/* SENTIMENT TAB */}
        {activeTab === 'sentiment' && (
          <div className="space-y-6 animate-fade-in">
             {loadingSentiment || !sentiment ? (
                 <div className="flex flex-col items-center justify-center h-40 text-poly-subtext gap-2">
                     <BrainCircuit className="animate-pulse" size={32} />
                     <span className="text-xs">Analyzing market vibes...</span>
                 </div>
             ) : (
                 <>
                    {/* Gauge */}
                    <div className="text-center">
                        <div className="relative h-4 bg-poly-bg rounded-full overflow-hidden mb-2">
                            <div 
                                className={`absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out ${sentiment.score > 50 ? 'bg-gradient-to-r from-poly-blue to-poly-green' : 'bg-gradient-to-r from-poly-red to-orange-500'}`}
                                style={{ width: `${sentiment.score}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-poly-red">Bearish</span>
                            <span className="text-white text-lg">{sentiment.score}/100</span>
                            <span className="text-poly-green">Bullish</span>
                        </div>
                        <p className="text-sm text-poly-subtext italic">"{sentiment.summary}"</p>
                    </div>

                    {/* Factors */}
                    <div className="space-y-3">
                        <div className="bg-green-500/5 border border-green-500/20 p-3 rounded-lg">
                            <h4 className="text-xs font-bold text-green-400 uppercase mb-2 flex items-center gap-1"><TrendingUp size={14}/> Bullish Signals</h4>
                            <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                                {sentiment.bullishFactors.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                        </div>
                        <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg">
                            <h4 className="text-xs font-bold text-red-400 uppercase mb-2 flex items-center gap-1"><TrendingDown size={14}/> Bearish Risks</h4>
                            <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                                {sentiment.bearishFactors.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                        </div>
                    </div>
                 </>
             )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
           <div className="space-y-2 animate-fade-in">
              {trades.map(trade => (
                  <div key={trade.id} className="flex justify-between items-center bg-poly-bg/30 p-2 rounded border border-poly-hover/50">
                      <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-8 rounded-full ${trade.type === 'BUY' ? 'bg-poly-green' : 'bg-poly-red'}`}></div>
                          <div>
                              <div className="text-xs font-bold text-white">
                                  {trade.type} <span className={trade.outcome === 'YES' ? 'text-poly-green' : 'text-poly-red'}>{trade.outcome}</span>
                              </div>
                              <div className="text-[10px] text-poly-subtext">{trade.user}</div>
                          </div>
                      </div>
                      <div className="text-right">
                          <div className="text-sm font-mono font-medium text-white">${trade.amount}</div>
                          <div className="text-[10px] text-poly-subtext">{trade.timestamp}</div>
                      </div>
                  </div>
              ))}
           </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
            <div className="space-y-3 animate-fade-in min-h-[300px]">
                {comments.length === 0 && <div className="text-center text-xs text-poly-subtext py-10">No comments yet. Be the first!</div>}
                {comments.map(comment => (
                    <div key={comment.id} className="flex gap-2 items-start">
                        <div className="w-6 h-6 rounded-full bg-poly-hover flex items-center justify-center text-[10px] flex-shrink-0 mt-1">
                            {comment.user.charAt(0)}
                        </div>
                        <div className="bg-poly-hover/30 p-2 rounded-lg rounded-tl-none">
                            <div className="flex justify-between items-baseline gap-2 mb-0.5">
                                <span className={`text-xs font-bold ${comment.user === 'You' ? 'text-poly-blue' : 'text-gray-300'}`}>{comment.user}</span>
                                <span className="text-[10px] text-poly-subtext">{comment.timestamp}</span>
                            </div>
                            <p className="text-xs text-gray-200 leading-snug">{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Footer Input (Only for Chat) */}
      {activeTab === 'chat' && (
          <form onSubmit={handlePostComment} className="p-3 border-t border-poly-hover bg-poly-bg">
              <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user.address ? "Say something..." : "Connect wallet to chat"}
                    disabled={!user.address}
                    className="w-full bg-poly-card border border-poly-hover rounded-full py-2 pl-4 pr-10 text-xs text-white focus:outline-none focus:border-poly-blue transition-colors disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={!user.address || !newComment.trim()}
                    className="absolute right-1 p-1.5 bg-poly-blue text-white rounded-full hover:bg-blue-600 disabled:opacity-0 transition-all"
                  >
                      <Send size={12} />
                  </button>
              </div>
          </form>
      )}
    </div>
  );
};

export default MarketPulse;
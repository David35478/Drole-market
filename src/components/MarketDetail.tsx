import React, { useState, useEffect } from 'react';
import { Market, User } from '../types';
import { MarketService } from '../services/marketService';
import { analyzeMarket } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, RefreshCw, Sparkles, Info, DollarSign } from 'lucide-react';
import MarketPulse from './MarketPulse';

interface MarketDetailProps {
  marketId: string;
  user: User;
  onBack: () => void;
}

const MarketDetail: React.FC<MarketDetailProps> = ({ marketId, user, onBack }) => {
  const [market, setMarket] = useState<Market | undefined>(MarketService.getMarket(marketId));
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO'>('YES');
  const [amount, setAmount] = useState<string>('');
  const [sellPercent, setSellPercent] = useState<number>(0);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = MarketService.subscribe(() => {
      setMarket(MarketService.getMarket(marketId));
    });
    setMarket(MarketService.getMarket(marketId));
    return () => unsubscribe();
  }, [marketId]);

  if (!market) return <div className="p-8 text-center">Market not found</div>;

  const outcome = market.outcomes.find(o => o.id === selectedOutcome);
  const price = outcome?.price || 0;
  
  const numAmount = parseFloat(amount) || 0;
  const shares = numAmount / price;
  const potentialReturn = shares * 1.0; 
  const potentialProfit = potentialReturn - numAmount;
  const returnPercent = numAmount > 0 ? (potentialProfit / numAmount) * 100 : 0;

  const currentPosition = user.positions.find(p => p.marketId === market.id && p.outcomeId === selectedOutcome);

  const handleTrade = () => {
    try {
      setError(null);
      if (tradeType === 'BUY') {
        MarketService.buyShares(market.id, selectedOutcome, numAmount);
        setAmount('');
      } else {
         if (!currentPosition) throw new Error("No position to sell");
         if (sellPercent <= 0) throw new Error("Select percentage to sell");
         MarketService.sellShares(market.id, selectedOutcome, sellPercent / 100);
         setSellPercent(0);
      }
      // Provide feedback (could be toast in real app)
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeMarket(market);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-poly-subtext hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Markets
      </button>

      {/* Grid Layout: Left (Chart/Info), Right (Pulse/Trade) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Chart & Market Info */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-start gap-4">
             <img src={market.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
             <div>
               <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{market.question}</h1>
               <div className="flex gap-4 text-poly-subtext text-sm">
                 <span className="flex items-center gap-1"><DollarSign size={14}/> Vol: ${(market.volume / 1000000).toFixed(2)}m</span>
                 <span>Exp: {market.endDate}</span>
               </div>
             </div>
          </div>

          {/* Chart Section */}
          <div className="bg-poly-card rounded-2xl p-6 border border-poly-hover h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={market.history}>
                <XAxis dataKey="date" hide />
                <YAxis domain={[0, 1]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1F2E', border: '1px solid #2A2E3F', color: '#fff' }}
                  labelStyle={{ color: '#98A2B3' }}
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Probability']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={price > 0.5 ? '#12B76A' : '#2E90FA'} 
                  strokeWidth={3} 
                  dot={false} 
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Info Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-poly-card p-4 rounded-xl border border-poly-hover h-full">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Info size={18} className="text-poly-blue" />
                    Rules & Info
                </h3>
                <p className="text-poly-subtext text-sm leading-relaxed">{market.description}</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-4 rounded-xl border border-indigo-500/20 h-full">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-400" />
                    Gemini Insight
                    </h3>
                    <button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold uppercase rounded tracking-wider transition-colors disabled:opacity-50"
                    >
                    {isAnalyzing ? '...' : 'Generate'}
                    </button>
                </div>
                {analysis ? (
                    <div className="text-sm text-gray-200 leading-relaxed max-h-[150px] overflow-y-auto custom-scrollbar">
                    {analysis}
                    </div>
                ) : (
                    <p className="text-xs text-poly-subtext">Click to generate AI-powered insights about news events affecting this market.</p>
                )}
              </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Trading & Pulse */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* 1. Trading Interface */}
          <div className="bg-poly-card border border-poly-hover rounded-2xl p-5 shadow-xl">
             
             {/* Buy/Sell Tabs */}
             <div className="flex border-b border-poly-hover mb-5">
                <button 
                    onClick={() => { setTradeType('BUY'); setError(null); }}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${tradeType === 'BUY' ? 'border-poly-blue text-white' : 'border-transparent text-poly-subtext hover:text-white'}`}
                >
                    Buy
                </button>
                <button 
                    onClick={() => { setTradeType('SELL'); setError(null); }}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${tradeType === 'SELL' ? 'border-poly-blue text-white' : 'border-transparent text-poly-subtext hover:text-white'}`}
                >
                    Sell
                </button>
             </div>

             {/* Outcome Selector */}
             <div className="flex bg-poly-bg p-1 rounded-lg mb-6">
               <button 
                 onClick={() => setSelectedOutcome('YES')}
                 className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${selectedOutcome === 'YES' ? 'bg-poly-green text-white shadow-lg' : 'text-poly-subtext hover:text-white'}`}
               >
                 YES <span className="ml-1 opacity-70">{(market.outcomes[0].price * 100).toFixed(1)}%</span>
               </button>
               <button 
                 onClick={() => setSelectedOutcome('NO')}
                 className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${selectedOutcome === 'NO' ? 'bg-poly-red text-white shadow-lg' : 'text-poly-subtext hover:text-white'}`}
               >
                 NO <span className="ml-1 opacity-70">{(market.outcomes[1].price * 100).toFixed(1)}%</span>
               </button>
             </div>

             {/* Error Message */}
             {error && (
                 <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                     {error}
                 </div>
             )}

             {/* Dynamic Content based on Trade Type */}
             {tradeType === 'BUY' ? (
                <div className="space-y-4">
                    <div className="relative">
                    <span className="absolute left-3 top-3 text-poly-subtext">$</span>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-poly-bg border border-poly-hover rounded-lg py-3 pl-7 pr-4 text-white focus:outline-none focus:border-poly-blue font-mono"
                        placeholder="0.00"
                    />
                    </div>

                    {numAmount > 0 && (
                    <div className="p-3 bg-poly-bg/50 rounded-lg border border-white/5 space-y-2 text-sm">
                        <div className="flex justify-between border-t border-white/5 pt-2">
                        <span className="text-poly-green">Potential Return</span>
                        <span className="font-bold text-poly-green">+${potentialProfit.toFixed(2)} ({returnPercent.toFixed(1)}%)</span>
                        </div>
                    </div>
                    )}

                    {user.address ? (
                    <button 
                        onClick={handleTrade}
                        disabled={numAmount <= 0}
                        className={`w-full py-3.5 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedOutcome === 'YES' ? 'bg-poly-green hover:bg-green-600 shadow-green-900/20' : 'bg-poly-red hover:bg-red-600 shadow-red-900/20'
                        }`}
                    >
                        Buy {selectedOutcome}
                    </button>
                    ) : (
                    <button 
                        onClick={() => MarketService.connectWallet()}
                        className="w-full py-3.5 bg-poly-blue hover:bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20"
                    >
                        Connect Wallet to Trade
                    </button>
                    )}
                </div>
             ) : (
                 <div className="space-y-4">
                    {!currentPosition ? (
                        <div className="text-center py-8 text-poly-subtext text-sm bg-poly-bg/30 rounded-lg border border-poly-hover border-dashed">
                            You don't have any {selectedOutcome} shares to sell.
                        </div>
                    ) : (
                        <>
                            {/* Position Info */}
                            <div className="flex justify-between text-xs text-poly-subtext px-1">
                                <span>Available</span>
                                <span className="text-white font-mono">{currentPosition.shares.toFixed(2)} Shares</span>
                            </div>

                            {/* Percentage Buttons */}
                            <div className="grid grid-cols-4 gap-2">
                                {[25, 50, 75, 100].map(pct => (
                                    <button
                                        key={pct}
                                        onClick={() => setSellPercent(pct)}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${sellPercent === pct ? 'bg-poly-blue text-white border-poly-blue' : 'bg-poly-bg text-poly-subtext border-poly-hover hover:border-poly-subtext hover:text-white'}`}
                                    >
                                        {pct === 100 ? 'MAX' : `${pct}%`}
                                    </button>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="p-3 bg-poly-bg/50 rounded-lg border border-white/5 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-poly-subtext">Sell Amount</span>
                                    <span className="text-white font-mono">{(currentPosition.shares * (sellPercent/100)).toFixed(2)} Shares</span>
                                </div>
                                <div className="flex justify-between border-t border-white/5 pt-2">
                                    <span className="text-white">Estimated Return</span>
                                    <span className="font-bold text-white">${(currentPosition.shares * (sellPercent/100) * price).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            {user.address ? (
                                <button 
                                    onClick={handleTrade}
                                    disabled={sellPercent === 0}
                                    className={`w-full py-3.5 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95 bg-poly-red hover:bg-red-600 shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Sell {selectedOutcome}
                                </button>
                                ) : (
                                <button 
                                    onClick={() => MarketService.connectWallet()}
                                    className="w-full py-3.5 bg-poly-blue hover:bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20"
                                >
                                    Connect Wallet to Trade
                                </button>
                            )}
                        </>
                    )}
                 </div>
             )}

             {currentPosition && tradeType === 'BUY' && (
               <div className="mt-4 pt-4 border-t border-poly-hover">
                 <div className="flex justify-between text-xs text-poly-subtext">
                    <span>Your Position</span>
                    <span className="font-mono text-poly-green">${currentPosition.currentValue.toFixed(2)}</span>
                 </div>
               </div>
             )}
          </div>

          {/* 2. New Market Pulse Sidebar */}
          <MarketPulse market={market} user={user} />

        </div>
      </div>
    </div>
  );
};

export default MarketDetail;

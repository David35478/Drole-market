import React, { useState } from 'react';
import { User, Market } from '../types';
import { Wallet, PieChart, DollarSign, TrendingUp, TrendingDown, History, Layers } from 'lucide-react';

interface PortfolioProps {
  user: User;
  markets: Market[];
}

const Portfolio: React.FC<PortfolioProps> = ({ user, markets }) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');

  const handleExplore = () => {
    window.location.hash = '#/';
  };

  if (!user.address) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-poly-subtext animate-fade-in">
        <div className="bg-poly-card p-6 rounded-full bg-opacity-50 mb-6 border border-poly-hover">
            <Wallet size={48} className="text-poly-blue" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
        <p className="mb-6 text-center max-w-md">Connect your wallet to track your positions, view your balance, and monitor your performance.</p>
        <button 
           onClick={() => window.location.reload()} // Quick hack to trigger connect flow if implemented externally or just guidance
           className="px-6 py-2 bg-poly-blue text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
        >
            Refresh to Connect
        </button>
      </div>
    );
  }

  // Calculations
  const portfolioValue = user.positions.reduce((acc, p) => acc + p.currentValue, 0);
  const totalInvested = user.positions.reduce((acc, p) => acc + (p.shares * p.avgPrice), 0);
  const totalPnL = portfolioValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">Portfolio</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Available Balance - Dark Blue Card */}
        <div className="bg-[#1a2332] p-6 rounded-2xl border border-poly-hover/50 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Wallet size={80} />
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20">
                <Wallet size={20} />
            </div>
            <p className="text-poly-subtext text-xs font-semibold uppercase tracking-wider mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-white tracking-tight">${user.balance.toFixed(2)}</p>
        </div>

        {/* Portfolio Value */}
        <div className="bg-poly-card p-6 rounded-2xl border border-poly-hover shadow-lg group">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 border border-purple-500/20">
                <PieChart size={20} />
            </div>
            <p className="text-poly-subtext text-xs font-semibold uppercase tracking-wider mb-1">Portfolio Value</p>
            <p className="text-2xl font-bold text-white tracking-tight">${portfolioValue.toFixed(2)}</p>
        </div>

        {/* Total Invested */}
        <div className="bg-poly-card p-6 rounded-2xl border border-poly-hover shadow-lg group">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 mb-4 border border-pink-500/20">
                <DollarSign size={20} />
            </div>
            <p className="text-poly-subtext text-xs font-semibold uppercase tracking-wider mb-1">Total Invested</p>
            <p className="text-2xl font-bold text-white tracking-tight">${totalInvested.toFixed(2)}</p>
        </div>

        {/* Total P&L */}
        <div className="bg-poly-card p-6 rounded-2xl border border-poly-hover shadow-lg group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 border ${totalPnL >= 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {totalPnL >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
            <p className="text-poly-subtext text-xs font-semibold uppercase tracking-wider mb-1">Total P&L</p>
            <div className="flex items-baseline gap-2">
                <p className={`text-2xl font-bold tracking-tight ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
                </p>
                <span className={`text-sm font-medium ${totalPnL >= 0 ? 'text-green-500/60' : 'text-red-500/60'}`}>
                    ({pnlPercent.toFixed(2)}%)
                </span>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-poly-hover mb-8">
          <button 
            onClick={() => setActiveTab('positions')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'positions' ? 'text-white' : 'text-poly-subtext hover:text-white'}`}
          >
              Positions ({user.positions.length})
              {activeTab === 'positions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-poly-blue rounded-t-full shadow-[0_0_10px_rgba(46,144,250,0.5)]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-white' : 'text-poly-subtext hover:text-white'}`}
          >
              History (0)
              {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-poly-blue rounded-t-full shadow-[0_0_10px_rgba(46,144,250,0.5)]"></div>}
          </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'positions' && (
            <>
                {user.positions.length === 0 ? (
                    <div className="bg-poly-card border border-poly-hover rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-poly-hover/50 rounded-2xl flex items-center justify-center mb-6 text-poly-subtext">
                            <Layers size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Positions Yet</h3>
                        <p className="text-poly-subtext max-w-sm mb-8">Start trading on markets to build your portfolio and track your performance.</p>
                        <button 
                            onClick={handleExplore}
                            className="bg-poly-blue hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5"
                        >
                            Explore Markets
                        </button>
                    </div>
                ) : (
                    <div className="bg-poly-card border border-poly-hover rounded-2xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-poly-bg/50 text-xs uppercase text-poly-subtext border-b border-poly-hover">
                                    <tr>
                                        <th className="p-4 font-semibold tracking-wider">Market</th>
                                        <th className="p-4 font-semibold tracking-wider">Outcome</th>
                                        <th className="p-4 font-semibold tracking-wider text-right">Avg Price</th>
                                        <th className="p-4 font-semibold tracking-wider text-right">Shares</th>
                                        <th className="p-4 font-semibold tracking-wider text-right">Value</th>
                                        <th className="p-4 font-semibold tracking-wider text-right">P&L</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-poly-hover">
                                    {user.positions.map((p, idx) => {
                                        const m = markets.find(mark => mark.id === p.marketId);
                                        const outcomeName = p.outcomeId;
                                        // Simple lookup, in real app would use outcome ID reliably
                                        const marketPrice = m?.outcomes.find(o => o.id === p.outcomeId)?.price || 0;
                                        const posPnl = p.currentValue - (p.shares * p.avgPrice);
                                        const posPnlPercent = ((posPnl) / (p.shares * p.avgPrice)) * 100;
                                        
                                        return (
                                            <tr key={idx} className="hover:bg-poly-hover/30 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={m?.image} className="w-10 h-10 rounded-md object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                                                        <span className="font-medium text-white max-w-[180px] sm:max-w-xs truncate group-hover:text-poly-blue transition-colors cursor-pointer" onClick={() => window.location.hash = `#/market/${m?.id}`}>{m?.question}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${p.outcomeId === 'YES' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                        {outcomeName}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-poly-subtext font-mono text-sm text-right">{(p.avgPrice * 100).toFixed(1)}¢</td>
                                                <td className="p-4 text-white font-mono text-sm text-right">{p.shares.toFixed(2)}</td>
                                                <td className="p-4 text-white font-mono text-sm font-medium text-right">${p.currentValue.toFixed(2)}</td>
                                                <td className="p-4 font-mono text-sm text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className={posPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                            {posPnl >= 0 ? '+' : ''}{posPnl.toFixed(2)}
                                                        </span>
                                                        <span className={`text-xs ${posPnl >= 0 ? 'text-green-500/60' : 'text-red-500/60'}`}>
                                                            {posPnlPercent.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </>
        )}

        {activeTab === 'history' && (
             <div className="bg-poly-card border border-poly-hover rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-poly-hover rounded-2xl flex items-center justify-center mb-4 text-poly-subtext">
                    <History size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No History Yet</h3>
                <p className="text-poly-subtext max-w-sm">Past trades and transactions will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;

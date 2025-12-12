import React from 'react';
import { Market } from '../types';
import { Bookmark } from 'lucide-react';

interface MarketCardProps {
  market: Market;
  onClick: (id: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

const MarketCard: React.FC<MarketCardProps> = ({ market, onClick, isBookmarked, onToggleBookmark }) => {
  const yesPrice = market.outcomes.find(o => o.id === 'YES')?.price || 0;
  const noPrice = market.outcomes.find(o => o.id === 'NO')?.price || 0;
  
  const yesPercent = Math.round(yesPrice * 100);
  const noPercent = Math.round(noPrice * 100);

  return (
    <div className="bg-poly-card hover:bg-poly-hover border border-poly-hover rounded-xl p-4 transition-all duration-200 group">
      
      {/* Top Row: Image + Title + Bookmark */}
      <div className="flex gap-4 mb-4" onClick={() => onClick(market.id)} style={{cursor: 'pointer'}}>
        <img 
            src={market.image} 
            alt="market" 
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0" 
        />
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
                <h3 className="text-white font-medium text-lg leading-snug line-clamp-2 mb-1 group-hover:text-poly-blue transition-colors">
                    {market.question}
                </h3>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark();
                    }}
                    className={`flex-shrink-0 transition-colors ${isBookmarked ? 'text-poly-blue' : 'text-poly-subtext hover:text-white'}`}
                >
                    <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
            </div>
            
            <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-poly-blue/10 text-poly-blue text-xs font-bold uppercase tracking-wide">
                    {market.category}
                </span>
            </div>
        </div>
      </div>

      {/* Middle Row: Probability & Buy Buttons */}
      <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0">
              <span className="text-4xl font-bold text-white tracking-tight">{yesPercent}%</span>
              <span className="text-poly-subtext text-sm ml-1 font-medium">chance</span>
          </div>

          <div className="flex-1 flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onClick(market.id); }}
                className="flex-1 bg-poly-green hover:bg-green-600 text-white py-2 px-3 rounded-lg font-bold text-sm transition-colors text-center shadow-lg shadow-green-900/20"
              >
                  Yes {yesPercent}¢
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onClick(market.id); }}
                className="flex-1 bg-transparent border border-poly-hover hover:border-poly-red/50 text-poly-red hover:bg-poly-red/5 py-2 px-3 rounded-lg font-bold text-sm transition-colors text-center"
              >
                  No {noPercent}¢
              </button>
          </div>
      </div>

      {/* Footer: Volume & Time */}
      <div className="flex items-center justify-between text-xs text-poly-subtext font-medium border-t border-poly-hover/50 pt-3">
          <div className="flex items-center gap-1">
             <span className="text-poly-subtext">$ {(market.volume / 1000000).toFixed(1)}m Vol.</span>
          </div>
          <div className="flex items-center gap-1">
             <span>{market.endDate}</span>
          </div>
      </div>

    </div>
  );
};

export default MarketCard;
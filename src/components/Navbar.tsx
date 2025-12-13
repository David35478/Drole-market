import React, { useState } from 'react';
import { Search, Wallet, Bell, Plus, Settings } from 'lucide-react';
import { MarketService } from '../services/marketService';
import { User, NotificationPreferences } from '../types';

interface NavbarProps {
  user: User;
  view: 'home' | 'market' | 'portfolio' | 'create';
  onSearch: (term: string) => void;
  onMenuToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, view, onSearch, onMenuToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleConnect = () => {
    MarketService.connectWallet();
  };

  const handleDisconnect = () => {
    MarketService.disconnectWallet();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const togglePref = (key: keyof NotificationPreferences) => {
    MarketService.updateNotificationPreferences(key, !user.notificationPreferences[key]);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-poly-bg/95 backdrop-blur-md border-b border-poly-hover">
      <div className="flex items-center justify-between px-4 h-16 max-w-6xl mx-auto gap-4">
        
        {/* Left: Logo & Main Nav */}
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => window.location.hash = ''}>
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-white mb-0.5"></div>
                </div>
                <span className="font-bold text-lg tracking-tight hidden sm:block text-white">Drole market</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 font-medium text-sm">
                <button 
                    onClick={() => window.location.hash = '#/'} 
                    className={`transition-colors ${view === 'home' ? 'text-white' : 'text-poly-subtext hover:text-white'}`}
                >
                    Markets
                </button>
                <button 
                    onClick={() => window.location.hash = '#/portfolio'} 
                    className={`transition-colors ${view === 'portfolio' ? 'text-white' : 'text-poly-subtext hover:text-white'}`}
                >
                    Portfolio
                </button>
                <button 
                    onClick={() => window.location.hash = '#/create'} 
                    className={`transition-colors ${view === 'create' ? 'text-white' : 'text-poly-subtext hover:text-white'}`}
                >
                    Create
                </button>
            </div>
        </div>

        {/* Center: Search (Hidden on mobile) */}
        <div className="flex-1 max-w-lg hidden md:block">
           {/* Placeholder for potential top search */}
        </div>

        {/* Right: Wallet & Actions */}
        <div className="flex items-center gap-3 sm:gap-4 relative">
          <button className="text-poly-subtext hover:text-white md:hidden">
            <Search size={20} />
          </button>
          
          <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`transition-colors relative ${showNotifications ? 'text-white' : 'text-poly-subtext hover:text-white'}`}
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-poly-bg"></span>
              </button>

              {showNotifications && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 top-full mt-3 w-72 bg-poly-card border border-poly-hover rounded-xl shadow-xl p-4 z-50 animate-fade-in cursor-default" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-poly-hover">
                            <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                <Settings size={14} className="text-poly-subtext" />
                                Notification Settings
                            </h3>
                            <button onClick={() => setShowNotifications(false)} className="text-poly-subtext hover:text-white text-xs">
                                Close
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between group cursor-pointer" onClick={() => togglePref('marketAlerts')}>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-200 font-medium group-hover:text-white transition-colors">Market Alerts</span>
                                    <span className="text-[10px] text-poly-subtext leading-tight">New listings and resolution updates</span>
                                </div>
                                <div 
                                    className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out ${user.notificationPreferences.marketAlerts ? 'bg-poly-blue' : 'bg-poly-hover'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-200 ease-in-out ${user.notificationPreferences.marketAlerts ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between group cursor-pointer" onClick={() => togglePref('priceChanges')}>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-200 font-medium group-hover:text-white transition-colors">Price Changes</span>
                                    <span className="text-[10px] text-poly-subtext leading-tight">Significant volatility alerts (over 5%)</span>
                                </div>
                                <div 
                                    className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out ${user.notificationPreferences.priceChanges ? 'bg-poly-blue' : 'bg-poly-hover'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-200 ease-in-out ${user.notificationPreferences.priceChanges ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
              )}
          </div>

          {/* Mobile 'Create' shortcut if needed, or just keep desktop */}
          <button 
             onClick={() => window.location.hash = '#/create'}
             className="hidden sm:flex md:hidden bg-poly-card hover:bg-poly-hover border border-poly-hover text-white p-2 rounded-lg transition-colors"
          >
             <Plus size={20} />
          </button>

          {user.address ? (
            <div 
              onClick={handleDisconnect}
              className="flex items-center bg-poly-card border border-poly-hover rounded-full px-1 py-1 pr-4 cursor-pointer hover:border-poly-subtext transition-colors"
            >
               <div className="flex items-center gap-2 px-3 border-r border-poly-hover/50">
                  <span className="w-2 h-2 rounded-full bg-poly-green shadow-[0_0_8px_rgba(18,183,106,0.5)]"></span>
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] text-poly-subtext font-semibold uppercase">Balance</span>
                    <span className="text-sm font-bold text-white">${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
               </div>
               <div className="pl-3 text-sm font-mono text-poly-subtext">
                  {user.address}
               </div>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="bg-poly-blue hover:bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold transition-all"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

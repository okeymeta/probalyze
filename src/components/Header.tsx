import React from 'react';
import { PLATFORM_NAME } from '../constants';
import { TrendingUp, BarChart3, Wallet, LogOut, PieChart, Trophy } from 'lucide-react';

type Page = 'markets' | 'portfolio' | 'leaderboard';

interface HeaderProps {
  connectedWallet?: string;
  isAdmin?: boolean;
  onDisconnect?: () => void;
  currentPage?: Page;
  onNavigate?: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  connectedWallet, 
  isAdmin, 
  onDisconnect,
  currentPage = 'markets',
  onNavigate 
}) => {
  const formatWallet = (wallet: string) => {
    return `${wallet.substring(0, 4)}...${wallet.substring(wallet.length - 4)}`;
  };

  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'markets', label: 'Markets', icon: <BarChart3 className="w-4 h-4" /> },
    { page: 'portfolio', label: 'Portfolio', icon: <PieChart className="w-4 h-4" /> },
    { page: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <header className="w-full bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-[#2a2a3a] sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer"
              onClick={() => onNavigate?.('markets')}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold gradient-text tracking-tight">
                  {PLATFORM_NAME}
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 -mt-1 hidden sm:block">Solana's #1 Prediction Market</p>
              </div>
            </div>
            
            {/* Navigation */}
            {connectedWallet && (
              <nav className="hidden lg:flex items-center gap-1 ml-4">
                {navItems.map((item) => (
                  <button 
                    key={item.page}
                    onClick={() => onNavigate?.(item.page)}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                      currentPage === item.page
                        ? 'text-white bg-purple-600/20 border border-purple-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
            )}
          </div>
          
          {/* Wallet & Admin Badge */}
          {connectedWallet && (
            <div className="flex items-center gap-2 sm:gap-3">
              {isAdmin && (
                <span className="hidden sm:flex px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 rounded-lg text-xs sm:text-sm font-bold border border-orange-500/30 items-center gap-1.5">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                  Admin
                </span>
              )}
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600/10 to-blue-600/10 text-white rounded-lg font-mono text-xs sm:text-sm border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                <span className="hidden sm:inline">{formatWallet(connectedWallet)}</span>
                <span className="sm:hidden">{connectedWallet.substring(0, 4)}...</span>
              </div>
              {onDisconnect && (
                <button
                  onClick={onDisconnect}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-lg text-xs sm:text-sm font-medium border border-red-500/20 hover:border-red-500/40 transition-all"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Disconnect</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Mobile Navigation */}
        {connectedWallet && (
          <nav className="lg:hidden flex items-center gap-1 mt-3 pt-3 border-t border-gray-800 overflow-x-auto">
            {navItems.map((item) => (
              <button 
                key={item.page}
                onClick={() => onNavigate?.(item.page)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  currentPage === item.page
                    ? 'text-white bg-purple-600/20 border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800 border border-transparent'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
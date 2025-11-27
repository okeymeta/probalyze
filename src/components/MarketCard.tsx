import React, { useState, useEffect } from 'react';
import { Market } from '../types';
import { getUserBetsForMarket, calculatePriceChange } from '../lib/marketManager';
import { MarketChart } from './MarketChart';
import { TrendingUp, TrendingDown, BarChart3, Activity, Users, Clock, Zap, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { SETTLEMENT_FEE_PERCENTAGE } from '../constants';

interface MarketCardProps {
  market: Market;
  userWallet?: string;
  onBetClick: (market: Market) => void;
  onResolveClick?: (market: Market) => void;
  onViewMarket?: (market: Market) => void;
  isAdmin: boolean;
}

export const MarketCard: React.FC<MarketCardProps> = ({ 
  market, 
  userWallet, 
  onBetClick, 
  onResolveClick,
  onViewMarket,
  isAdmin 
}) => {
  const [showChart, setShowChart] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const totalPool = market.totalYesAmount + market.totalNoAmount;
  const yesPercentage = totalPool > 0 ? (market.totalYesAmount / totalPool) * 100 : market.initialYesPrice * 100;
  const noPercentage = 100 - yesPercentage;
  
  const priceChange = calculatePriceChange(market);

  const userBets = userWallet ? getUserBetsForMarket(market, userWallet) : [];
  const userTotalBet = userBets.reduce((sum, bet) => sum + bet.amount, 0);
  const userYesBets = userBets.filter(b => b.prediction === 'yes').reduce((sum, bet) => sum + bet.amount, 0);
  const userNoBets = userBets.filter(b => b.prediction === 'no').reduce((sum, bet) => sum + bet.amount, 0);

  // Calculate real-time potential payouts if market closes NOW
  const calculateCurrentPayout = (prediction: 'yes' | 'no') => {
    if (totalPool === 0) return 0;
    
    const userAmount = prediction === 'yes' ? userYesBets : userNoBets;
    if (userAmount === 0) return 0;
    
    const winningTotal = prediction === 'yes' ? market.totalYesAmount : market.totalNoAmount;
    if (winningTotal === 0) return 0;
    
    const share = userAmount / winningTotal;
    const grossPayout = totalPool * share;
    const settlementFee = grossPayout * (SETTLEMENT_FEE_PERCENTAGE / 100);
    const netPayout = grossPayout - settlementFee;
    
    return netPayout;
  };

  const yesWinPayout = calculateCurrentPayout('yes');
  const noWinPayout = calculateCurrentPayout('no');
  const yesProfit = yesWinPayout - userYesBets;
  const noProfit = noWinPayout - userNoBets;

  // Format time remaining
  const getTimeRemaining = () => {
    if (market.status !== 'active') return null;
    const now = Date.now();
    const msRemaining = market.closesAt - now;
    if (msRemaining <= 0) return 'Closed';
    
    const hours = Math.floor(msRemaining / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    return '<1h';
  };

  // Check if description is long enough to need "Show More"
  const isDescriptionLong = market.description.length > 100;
  const truncatedDescription = market.description.slice(0, 100);

  // Format resolve date/time
  const getResolveDisplay = () => {
    if (market.timingType === 'tbd' || !market.resolveTime) {
      return market.timingNote ? `${market.timingNote}` : 'TBD';
    }
    if (market.timingType === 'flexible') {
      return market.timingNote ? `${market.timingNote}` : `${new Date(market.resolveTime).toLocaleDateString()}`;
    }
    if (market.resolveTime && market.resolveTime > 0) {
      return new Date(market.resolveTime).toLocaleDateString();
    }
    return 'TBD';
  };

  const getStatusBadge = () => {
    if (market.status === 'active') {
      return (
        <div className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-green-500/30">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-green-400 text-xs font-bold">LIVE</span>
        </div>
      );
    } else if (market.status === 'closed') {
      return (
        <div className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-yellow-500/30">
          <span className="text-yellow-400 text-xs font-bold">CLOSED</span>
        </div>
      );
    } else if (market.status === 'resolved') {
      return (
        <div className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-500/30">
          <span className="text-blue-400 text-xs font-bold">RESOLVED</span>
        </div>
      );
    }
    return null;
  };

  const getOutcomeBadge = () => {
    if (market.marketType === 'multi-outcome') {
      return (
        <div className="bg-purple-500 px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1.5">
          <span>🗳️</span>
          Multi-Outcome
        </div>
      );
    }
    if (market.status === 'resolved' && market.outcome) {
      const outcomeText = market.outcome === 'yes' ? 'YES' : 'NO';
      const bgColor = market.outcome === 'yes' ? 'bg-green-500' : 'bg-red-500';
      return (
        <div className={`${bgColor} px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1.5`}>
          <span>🏆</span>
          {outcomeText}
        </div>
      );
    }
    return null;
  };

  const isUserWinner = () => {
    if (market.status === 'resolved' && market.outcome && userBets.length > 0) {
      return userBets.some(bet => bet.prediction === market.outcome);
    }
    return false;
  };

  const handleCardClick = () => {
    if (onViewMarket) {
      onViewMarket(market);
    }
  };

  return (
    <div 
      className="glass-card rounded-xl overflow-hidden hover:border-purple-500/40 transition-all market-card group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Market Image */}
      <div className="relative h-32 sm:h-40 overflow-hidden">
        <img 
          src={market.imageUrl} 
          alt={market.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%2313131a" width="400" height="300"/%3E%3Ctext fill="%239CA3AF" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E📊%3C/text%3E%3C/svg%3E';
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent"></div>
        
        {/* Top badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-start justify-between gap-2">
          <div className="flex gap-2">
            {getStatusBadge()}
            {/* Category Badge */}
            <div className="bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700">
              <span className="text-gray-300 text-xs font-bold uppercase">{market.category}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {getOutcomeBadge()}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gray-900/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-700">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              <span className="text-white text-xs sm:text-sm font-bold number-mono">{totalPool.toFixed(2)} SOL</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-900/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-700">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              <span className="text-white text-xs sm:text-sm font-bold">{market.bets.length}</span>
            </div>
            {market.status === 'active' && (
              <div className="flex items-center gap-1.5 bg-gray-900/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-orange-500/30">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                <span className="text-orange-300 text-xs sm:text-sm font-bold">{getTimeRemaining()}</span>
              </div>
            )}
          </div>
          {market.bets.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowChart(!showChart);
              }}
              className={`bg-gray-900/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border transition-all ${
                showChart ? 'border-purple-500 bg-purple-500/20' : 'border-gray-700 hover:border-purple-500/50'
              }`}
            >
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
            </button>
          )}
        </div>
      </div>

      {/* Chart Section */}
      {showChart && market.bets.length > 1 && (
        <div className="border-t border-gray-700/50 p-3 sm:p-4 bg-gray-900/30">
          <MarketChart market={market} height={180} />
        </div>
      )}

      {/* Market Info */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">{market.title}</h3>
        
        {/* Description with Show More */}
        <div className="mb-3">
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            {showFullDescription || !isDescriptionLong 
              ? market.description 
              : `${truncatedDescription}...`
            }
          </p>
          {isDescriptionLong && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFullDescription(!showFullDescription);
              }}
              className="flex items-center gap-1 mt-2 text-purple-400 hover:text-purple-300 text-xs font-semibold transition-colors"
            >
              {showFullDescription ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show More
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Multi-Outcome Display */}
        {market.marketType === 'multi-outcome' && market.outcomes && market.outcomes.length > 0 ? (
          <div className="space-y-2 mb-4">
            {market.outcomes.map((outcome) => {
              const outcomeTotal = outcome.totalYesAmount + outcome.totalNoAmount;
              const outcomeTotalPool = market.totalYesAmount + market.totalNoAmount;
              const outcomePercentage = outcomeTotalPool > 0 ? (outcomeTotal / outcomeTotalPool) * 100 : 0;
              
              return (
                <div key={outcome.id} className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{outcome.name}</span>
                    <span className="text-base font-bold text-purple-400">{outcomePercentage.toFixed(0)}%</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 text-xs font-bold py-2 rounded transition-all">
                      Yes
                    </button>
                    <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 text-xs font-bold py-2 rounded transition-all">
                      No
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Price Display - DexScreener style (Binary markets) */
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Yes</span>
                {priceChange > 0 && <TrendingUp className="w-3 h-3 text-green-400" />}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-green-400 percentage-badge">{yesPercentage.toFixed(0)}%</span>
                {priceChange !== 0 && (
                  <span className={`text-xs font-bold ${
                    priceChange > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
                  </span>
                )}
              </div>
              {/* Unique Yes Bettors */}
              <div className="flex items-center gap-1 mt-1">
                <Users className="w-3 h-3 text-green-400/70" />
                <span className="text-xs text-green-400/70 font-semibold">{market.uniqueYesBettors.length} traders</span>
              </div>
            </div>
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                {priceChange < 0 && <TrendingDown className="w-3 h-3 text-red-400" />}
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">No</span>
              </div>
              <div className="flex items-baseline justify-end gap-1.5">
                {priceChange !== 0 && (
                  <span className={`text-xs font-bold ${
                    priceChange < 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {priceChange < 0 ? '+' : ''}{(-priceChange).toFixed(1)}%
                  </span>
                )}
                <span className="text-2xl sm:text-3xl font-bold text-red-400 percentage-badge">{noPercentage.toFixed(0)}%</span>
              </div>
              {/* Unique No Bettors */}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-xs text-red-400/70 font-semibold">{market.uniqueNoBettors.length} traders</span>
                <Users className="w-3 h-3 text-red-400/70" />
              </div>
            </div>
          </div>
        )}

        {/* Probability Bar */}
        <div className="w-full bg-gray-800 rounded-full h-1.5 sm:h-2 overflow-hidden mb-4">
          <div 
            className="bg-linear-to-r from-green-500 to-green-400 h-full transition-all duration-500 shadow-lg shadow-green-500/30"
            style={{ width: `${yesPercentage}%` }}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-gray-700/50">
            <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">24h Volume</p>
            <p className="text-xs sm:text-sm font-bold text-white number-mono">{market.volume24h.toFixed(2)} SOL</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-gray-700/50">
            <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Total Bets</p>
            <p className="text-xs sm:text-sm font-bold text-white">{market.bets.length}</p>
          </div>
        </div>

        {/* User's Position with REAL-TIME PAYOUT */}
        {userTotalBet > 0 && market.status === 'active' && (
          <div className="space-y-3 mb-4">
            {/* Current Position */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-semibold text-xs sm:text-sm">Your Position</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                {userYesBets > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">YES:</span>
                    <span className="text-green-400 font-bold number-mono">{userYesBets.toFixed(4)} SOL</span>
                  </div>
                )}
                {userNoBets > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">NO:</span>
                    <span className="text-red-400 font-bold number-mono">{userNoBets.toFixed(4)} SOL</span>
                  </div>
                )}
              </div>
            </div>

            {/* REAL-TIME PAYOUT IF MARKET CLOSES NOW */}
            <div className="bg-linear-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40 rounded-lg p-3 animate-pulse-glow">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 font-bold text-xs sm:text-sm">If Market Closes NOW</span>
              </div>
              <div className="space-y-2">
                {userYesBets > 0 && (
                  <div className="bg-gray-900/50 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-xs">If YES wins:</span>
                      <span className={`text-sm font-bold number-mono ${yesProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {yesProfit > 0 ? '+' : ''}{yesProfit.toFixed(4)} SOL
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">Total payout:</span>
                      <span className="text-white font-bold text-sm number-mono">{yesWinPayout.toFixed(4)} SOL</span>
                    </div>
                  </div>
                )}
                {userNoBets > 0 && (
                  <div className="bg-gray-900/50 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-xs">If NO wins:</span>
                      <span className={`text-sm font-bold number-mono ${noProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {noProfit > 0 ? '+' : ''}{noProfit.toFixed(4)} SOL
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">Total payout:</span>
                      <span className="text-white font-bold text-sm number-mono">{noWinPayout.toFixed(4)} SOL</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-blue-500/30">
                <p className="text-xs text-blue-300/70 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-blue-400 rounded-full animate-pulse"></span>
                  Live calculation updates with every bet
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User's Position - RESOLVED */}
        {userTotalBet > 0 && market.status === 'resolved' && (
          <div className={`rounded-lg p-3 mb-4 border ${
            isUserWinner() 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-purple-500/10 border-purple-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              {isUserWinner() && <span className="text-base sm:text-lg">🎉</span>}
              <span className="text-white font-semibold text-xs sm:text-sm">Your Position</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              {userYesBets > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">YES:</span>
                  <span className="text-green-400 font-bold number-mono">{userYesBets.toFixed(4)} SOL</span>
                </div>
              )}
              {userNoBets > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">NO:</span>
                  <span className="text-red-400 font-bold number-mono">{userNoBets.toFixed(4)} SOL</span>
                </div>
              )}
            </div>
            {isUserWinner() && (
              <div className="mt-2 text-green-400 font-bold text-xs flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                You won! Payout distributed.
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* View Charts Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onViewMarket) onViewMarket(market);
            }}
            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all text-sm sm:text-base"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Charts</span>
          </button>
          
          {market.status === 'active' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBetClick(market);
              }}
              className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2.5 sm:py-3 px-4 rounded-lg transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 text-sm sm:text-base"
            >
              Trade Now
            </button>
          )}
          
          {isAdmin && market.status === 'active' && onResolveClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolveClick(market);
              }}
              className="flex-1 bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-2.5 sm:py-3 px-4 rounded-lg transition-all text-sm sm:text-base"
            >
              Resolve
            </button>
          )}
        </div>

        {/* Market Metadata */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700/50 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs text-gray-500">
          <span>Created {new Date(market.createdAt).toLocaleDateString()}</span>
          {market.status === 'active' && (
            <span className="text-blue-400">Resolves {getResolveDisplay()}</span>
          )}
          {market.platformFeesCollected > 0 && (
            <span className="text-purple-400 font-semibold number-mono">
              Fees: {market.platformFeesCollected.toFixed(4)} SOL
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
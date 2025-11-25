import React, { useEffect, useState } from 'react';
import { Trophy, Medal, TrendingUp, TrendingDown, BarChart3, RefreshCw, Crown, Flame, Target, Wallet } from 'lucide-react';
import { loadMarkets, loadBalances } from '../lib/marketManager';
import { Market, UserBalance } from '../types';

interface LeaderboardUser {
  rank: number;
  walletAddress: string;
  balance: number;
  totalVolume: number;
  totalWinnings: number;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  activeBets: number;
  profit: number;
  winRate: number;
  roi: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[];
  totalTraders: number;
  sortBy: string;
}

interface LeaderboardPageProps {
  currentUserWallet?: string;
}

type SortOption = 'winnings' | 'volume' | 'profit' | 'winrate' | 'bets';

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ currentUserWallet }) => {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('winnings');

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load from S3 storage instead of API
      const [markets, balances] = await Promise.all([
        loadMarkets(),
        loadBalances()
      ]);

      // Build leaderboard from market bets and balances
      const userStats: Record<string, LeaderboardUser> = {};

      // Process all bets from all markets
      for (const market of markets) {
        for (const bet of market.bets) {
          const wallet = bet.walletAddress;
          
          if (!userStats[wallet]) {
            const userBalance = balances[wallet] || {
              balance: 0,
              totalDeposited: 0,
              totalWithdrawn: 0,
              totalWinnings: 0
            };
            
            userStats[wallet] = {
              rank: 0,
              walletAddress: wallet,
              balance: userBalance.balance,
              totalVolume: 0,
              totalWinnings: userBalance.totalWinnings,
              totalBets: 0,
              wonBets: 0,
              lostBets: 0,
              activeBets: 0,
              profit: 0,
              winRate: 0,
              roi: 0
            };
          }

          userStats[wallet].totalBets++;
          userStats[wallet].totalVolume += bet.amount;

          if (market.status === 'resolved' && market.outcome) {
            if (bet.prediction === market.outcome) {
              userStats[wallet].wonBets++;
            } else {
              userStats[wallet].lostBets++;
            }
          } else if (market.status === 'active' || market.status === 'closed') {
            userStats[wallet].activeBets++;
          }
        }
      }

      // Calculate derived metrics
      const leaderboardArray = Object.values(userStats).map(user => {
        const totalSettled = user.wonBets + user.lostBets;
        user.winRate = totalSettled > 0 ? (user.wonBets / totalSettled) * 100 : 0;
        user.profit = user.totalWinnings - user.totalVolume;
        user.roi = user.totalVolume > 0 ? (user.profit / user.totalVolume) * 100 : 0;
        return user;
      });

      // Sort based on the requested criteria
      let sortedData = leaderboardArray;
      switch (sortBy) {
        case 'volume':
          sortedData = leaderboardArray.sort((a, b) => b.totalVolume - a.totalVolume);
          break;
        case 'profit':
          sortedData = leaderboardArray.sort((a, b) => b.profit - a.profit);
          break;
        case 'winrate':
          sortedData = leaderboardArray.sort((a, b) => b.winRate - a.winRate);
          break;
        case 'bets':
          sortedData = leaderboardArray.sort((a, b) => b.totalBets - a.totalBets);
          break;
        case 'winnings':
        default:
          sortedData = leaderboardArray.sort((a, b) => b.totalWinnings - a.totalWinnings);
          break;
      }

      // Filter out users with no activity and add rank
      const activeUsers = sortedData
        .filter(u => u.totalBets > 0 || u.totalVolume > 0)
        .slice(0, 50)
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      setData({
        leaderboard: activeUsers,
        totalTraders: activeUsers.length,
        sortBy
      });
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatSOL = (amount: number) => `${amount.toFixed(4)} SOL`;
  const formatWallet = (wallet: string) => `${wallet.substring(0, 4)}...${wallet.substring(wallet.length - 4)}`;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'winnings', label: 'Total Winnings', icon: <Trophy className="w-4 h-4" /> },
    { value: 'volume', label: 'Trading Volume', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'profit', label: 'Profit/Loss', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'winrate', label: 'Win Rate', icon: <Target className="w-4 h-4" /> },
    { value: 'bets', label: 'Total Bets', icon: <Flame className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-800 rounded-lg w-1/3"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-gray-800 rounded-lg w-24"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-8">
        <div className="glass-card rounded-xl p-8 text-center">
          <Trophy className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Leaderboard</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const currentUserRank = data.leaderboard.find(u => u.walletAddress === currentUserWallet);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-gray-400">Top traders on the platform • {data.totalTraders} active traders</p>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all border border-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Current User Rank Card */}
      {currentUserRank && (
        <div className="glass-card rounded-xl p-6 mb-8 border-l-4 border-purple-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                {getRankIcon(currentUserRank.rank)}
              </div>
              <div>
                <p className="text-sm text-gray-400">Your Rank</p>
                <p className="text-2xl font-bold text-white">#{currentUserRank.rank} of {data.totalTraders}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">Winnings</p>
                <p className="text-lg font-bold text-green-400">{formatSOL(currentUserRank.totalWinnings)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                <p className="text-lg font-bold text-blue-400">{currentUserRank.winRate.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">Volume</p>
                <p className="text-lg font-bold text-purple-400">{formatSOL(currentUserRank.totalVolume)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === option.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {data.leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <div className="glass-card rounded-xl p-6 border border-gray-400/30 mt-8">
            <div className="text-center">
              <Medal className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-mono mb-2">{formatWallet(data.leaderboard[1].walletAddress)}</p>
              <p className="text-xl font-bold text-white mb-1">{formatSOL(data.leaderboard[1].totalWinnings)}</p>
              <p className="text-xs text-gray-500">{data.leaderboard[1].totalBets} bets</p>
            </div>
          </div>

          {/* 1st Place */}
          <div className="glass-card rounded-xl p-6 border-2 border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-transparent">
            <div className="text-center">
              <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <p className="text-sm text-yellow-400 font-mono mb-2">{formatWallet(data.leaderboard[0].walletAddress)}</p>
              <p className="text-2xl font-bold text-white mb-1">{formatSOL(data.leaderboard[0].totalWinnings)}</p>
              <p className="text-xs text-gray-500">{data.leaderboard[0].totalBets} bets</p>
              <div className="mt-3 px-3 py-1 bg-yellow-500/20 rounded-full inline-block">
                <span className="text-xs font-bold text-yellow-400">🏆 #1 Trader</span>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="glass-card rounded-xl p-6 border border-amber-600/30 mt-8">
            <div className="text-center">
              <Medal className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-mono mb-2">{formatWallet(data.leaderboard[2].walletAddress)}</p>
              <p className="text-xl font-bold text-white mb-1">{formatSOL(data.leaderboard[2].totalWinnings)}</p>
              <p className="text-xs text-gray-500">{data.leaderboard[2].totalBets} bets</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Rank</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Trader</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-400">Winnings</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-400">Volume</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-400">P/L</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">Win Rate</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">Bets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data.leaderboard.map((user) => {
                const isCurrentUser = user.walletAddress === currentUserWallet;
                const isProfitable = user.profit >= 0;

                return (
                  <tr 
                    key={user.walletAddress} 
                    className={`transition-colors ${
                      isCurrentUser 
                        ? 'bg-purple-600/10 border-l-2 border-purple-500' 
                        : 'hover:bg-gray-800/30'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(user.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-mono text-white">
                            {formatWallet(user.walletAddress)}
                            {isCurrentUser && (
                              <span className="ml-2 px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded text-xs font-sans">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.activeBets > 0 && `${user.activeBets} active`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-green-400">{formatSOL(user.totalWinnings)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-blue-400">{formatSOL(user.totalVolume)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-semibold flex items-center justify-end gap-1 ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                        {isProfitable ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isProfitable ? '+' : ''}{formatSOL(user.profit)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                            style={{ width: `${Math.min(user.winRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-300">{user.winRate.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm font-medium text-gray-300">{user.totalBets}</span>
                        <span className="text-xs text-gray-500">
                          ({user.wonBets}W/{user.lostBets}L)
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {data.leaderboard.length === 0 && (
          <div className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No traders yet</h3>
            <p className="text-gray-500">Be the first to trade and claim the top spot!</p>
          </div>
        )}
      </div>
    </div>
  );
};
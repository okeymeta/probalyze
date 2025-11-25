import React, { useEffect, useState } from 'react';
import { loadPlatformStats, loadMarkets } from '../lib/marketManager';
import { PlatformStats, Market } from '../types';
import { TrendingUp, DollarSign, Users, Activity, Wallet, BarChart3 } from 'lucide-react';

interface AdminDashboardProps {
  onCreateMarket: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onCreateMarket }) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [platformStats, allMarkets] = await Promise.all([
        loadPlatformStats(),
        loadMarkets()
      ]);
      setStats(platformStats);
      setMarkets(allMarkets);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-400">
        Failed to load platform statistics
      </div>
    );
  }

  const formatSOL = (amount: number) => {
    return `${amount.toFixed(4)} SOL`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toString();
  };

  const activeMarkets = markets.filter(m => m.status === 'active');
  const resolvedMarkets = markets.filter(m => m.status === 'resolved');

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
          <p className="text-gray-400 mt-1">Platform overview and management</p>
        </div>
        <button
          onClick={onCreateMarket}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Create Market
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs text-green-400 font-semibold">+{stats.last24hFees > 0 ? formatSOL(stats.last24hFees) : '0 SOL'} (24h)</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Total Revenue</h3>
          <p className="text-3xl font-bold text-white mt-1">{formatSOL(stats.totalFees)}</p>
          <p className="text-xs text-gray-500 mt-2">Platform fees collected</p>
        </div>

        {/* Total Pool Money */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-blue-400 font-semibold">Active pools</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Total Pool Money</h3>
          <p className="text-3xl font-bold text-white mt-1">{formatSOL(stats.totalPoolMoney)}</p>
          <p className="text-xs text-gray-500 mt-2">Locked in active markets</p>
        </div>

        {/* Total Volume */}
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-xs text-green-400 font-semibold">+{formatSOL(stats.last24hVolume)} (24h)</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Total Volume</h3>
          <p className="text-3xl font-bold text-white mt-1">{formatSOL(stats.totalVolume)}</p>
          <p className="text-xs text-gray-500 mt-2">All-time trading volume</p>
        </div>

        {/* Users & Markets */}
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-700/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Users className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-xs text-orange-400 font-semibold">{stats.activeMarkets} active</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Platform Activity</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            <span className="text-sm text-gray-400">users</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{markets.length} total markets</p>
        </div>
      </div>

      {/* Markets Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Markets */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-bold text-white">Active Markets</h3>
            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">
              {activeMarkets.length}
            </span>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {activeMarkets.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No active markets</p>
            ) : (
              activeMarkets.map(market => {
                const totalVolume = market.totalYesAmount + market.totalNoAmount;
                const yesPercentage = totalVolume > 0 ? (market.totalYesAmount / totalVolume) * 100 : 50;
                
                return (
                  <div key={market.id} className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                    <h4 className="text-white font-semibold text-sm mb-2 line-clamp-1">{market.title}</h4>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-green-400">Yes: {yesPercentage.toFixed(1)}%</span>
                      <span className="text-red-400">No: {(100 - yesPercentage).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-500"
                        style={{ width: `${yesPercentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>Volume: {formatSOL(totalVolume)}</span>
                      <span>Bets: {market.bets.length}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Platform Stats</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Average Market Size</span>
              <span className="text-white font-semibold">
                {activeMarkets.length > 0 
                  ? formatSOL(stats.totalPoolMoney / activeMarkets.length)
                  : '0 SOL'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Active Markets</span>
              <span className="text-white font-semibold">{activeMarkets.length}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Resolved Markets</span>
              <span className="text-white font-semibold">{resolvedMarkets.length}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Total Bets Placed</span>
              <span className="text-white font-semibold">
                {markets.reduce((acc, m) => acc + m.bets.length, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Platform Fee Rate</span>
              <span className="text-white font-semibold">2% + 3% settlement</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-400">Total Users</span>
              <span className="text-white font-semibold">{stats.totalUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="text-white font-bold mb-1">Platform Performance</h4>
            <p className="text-gray-400 text-sm">
              Your platform has generated <span className="text-purple-400 font-semibold">{formatSOL(stats.totalFees)}</span> in fees
              with <span className="text-blue-400 font-semibold">{formatSOL(stats.totalVolume)}</span> total trading volume.
              Keep creating engaging markets to maximize revenue!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { PLATFORM_NAME, ADMIN_WALLET_ADDRESS } from '../constants';

interface PlatformStats {
  totalFeesCollected: number;
  totalVolume: number;
  totalMarkets: number;
  totalUsers: number;
  totalBets: number;
  poolBalance: number;
  lastUpdated: string;
}

interface Market {
  id: number;
  title: string;
  status: string;
  totalYesAmount: number;
  totalNoAmount: number;
  volume24h: number;
  createdAt: string;
  category: string;
}

interface ProbalyzeAdminProps {
  adminWallet: string;
  onClose: () => void;
}

export const ProbalyzeAdmin: React.FC<ProbalyzeAdminProps> = ({ adminWallet, onClose }) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'markets' | 'create'>('overview');
  
  // Create market form state
  const [newMarket, setNewMarket] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'crypto'
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, marketsRes] = await Promise.all([
        fetch('/api/platform-stats'),
        fetch('/api/markets?limit=50&sort=createdAt&order=desc')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (marketsRes.ok) {
        const marketsData = await marketsRes.json();
        setMarkets(marketsData);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarket.title.trim()) {
      alert('Please enter a market title');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/markets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMarket,
          createdBy: adminWallet
        })
      });

      if (response.ok) {
        alert('Market created successfully!');
        setNewMarket({
          title: '',
          description: '',
          imageUrl: '',
          category: 'crypto'
        });
        setActiveTab('markets');
        await loadData();
      } else {
        const error = await response.json();
        alert(`Failed to create market: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const handleResolveMarket = async (marketId: number, outcome: 'yes' | 'no') => {
    if (!confirm(`Are you sure you want to resolve this market as "${outcome.toUpperCase()}"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/markets/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketId, outcome })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Market resolved! ${result.totalBetsSettled} bets settled. Total payouts: ${result.totalPayouts.toFixed(2)} SOL`);
        await loadData();
      } else {
        const error = await response.json();
        alert(`Failed to resolve: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#13131a] p-8 rounded-xl border border-[#2a2a3a]">
          <div className="animate-pulse text-white">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#13131a] rounded-xl border border-[#6366f1] shadow-2xl w-full max-w-6xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a3a]">
          <div>
            <h2 className="text-2xl font-bold text-white">{PLATFORM_NAME} Admin Panel</h2>
            <p className="text-sm text-[#a1a1aa] mt-1">Platform Management & Analytics</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#a1a1aa] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-6 pb-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-[#6366f1] text-white'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#1a1a24]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('markets')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'markets'
                ? 'bg-[#6366f1] text-white'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#1a1a24]'
            }`}
          >
            Markets
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'create'
                ? 'bg-[#6366f1] text-white'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#1a1a24]'
            }`}
          >
            Create Market
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Revenue & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/5 border border-[#22c55e]/30 rounded-xl p-6">
                  <div className="text-sm text-[#22c55e] mb-2 font-medium">Total Revenue (Fees)</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stats.totalFeesCollected.toFixed(2)} SOL
                  </div>
                  <div className="text-xs text-[#a1a1aa]">Platform earnings</div>
                </div>
                <div className="bg-gradient-to-br from-[#6366f1]/20 to-[#6366f1]/5 border border-[#6366f1]/30 rounded-xl p-6">
                  <div className="text-sm text-[#6366f1] mb-2 font-medium">Total Pool Value</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stats.poolBalance.toFixed(2)} SOL
                  </div>
                  <div className="text-xs text-[#a1a1aa]">Locked in markets</div>
                </div>
                <div className="bg-gradient-to-br from-[#8b5cf6]/20 to-[#8b5cf6]/5 border border-[#8b5cf6]/30 rounded-xl p-6">
                  <div className="text-sm text-[#8b5cf6] mb-2 font-medium">Total Volume</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stats.totalVolume.toFixed(2)} SOL
                  </div>
                  <div className="text-xs text-[#a1a1aa]">All-time traded</div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-4">
                  <div className="text-2xl font-bold text-white mb-1">{stats.totalMarkets}</div>
                  <div className="text-sm text-[#a1a1aa]">Total Markets</div>
                </div>
                <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-4">
                  <div className="text-2xl font-bold text-white mb-1">{stats.totalUsers}</div>
                  <div className="text-sm text-[#a1a1aa]">Total Users</div>
                </div>
                <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-4">
                  <div className="text-2xl font-bold text-white mb-1">{stats.totalBets}</div>
                  <div className="text-sm text-[#a1a1aa]">Total Bets</div>
                </div>
                <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-4">
                  <div className="text-2xl font-bold text-[#22c55e] mb-1">2%</div>
                  <div className="text-sm text-[#a1a1aa]">Fee Rate</div>
                </div>
              </div>

              {/* Platform Health */}
              <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Platform Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#a1a1aa]">Average Bet Size</span>
                    <span className="text-white font-semibold">
                      {stats.totalBets > 0 ? (stats.totalVolume / stats.totalBets).toFixed(2) : '0.00'} SOL
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#a1a1aa]">Revenue Per Market</span>
                    <span className="text-white font-semibold">
                      {stats.totalMarkets > 0 ? (stats.totalFeesCollected / stats.totalMarkets).toFixed(2) : '0.00'} SOL
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#a1a1aa]">Active Markets</span>
                    <span className="text-white font-semibold">
                      {markets.filter(m => m.status === 'active').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'markets' && (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {markets.map(market => {
                const totalPool = market.totalYesAmount + market.totalNoAmount;
                return (
                  <div
                    key={market.id}
                    className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-4 hover:border-[#6366f1] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            market.status === 'active' ? 'bg-[#22c55e]/20 text-[#22c55e]' :
                            market.status === 'resolved' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' :
                            'bg-[#71717a]/20 text-[#71717a]'
                          }`}>
                            {market.status.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-[#6366f1]/20 text-[#6366f1]">
                            {market.category}
                          </span>
                        </div>
                        <h4 className="text-white font-semibold text-sm mb-2">{market.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-[#a1a1aa]">
                          <span>Pool: {totalPool.toFixed(2)} SOL</span>
                          <span>24h Vol: {market.volume24h.toFixed(2)} SOL</span>
                          <span>ID: {market.id}</span>
                        </div>
                      </div>
                      {market.status === 'active' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolveMarket(market.id, 'yes')}
                            className="px-3 py-1 bg-[#22c55e]/20 hover:bg-[#22c55e]/30 text-[#22c55e] rounded font-medium text-sm transition-colors"
                          >
                            Resolve YES
                          </button>
                          <button
                            onClick={() => handleResolveMarket(market.id, 'no')}
                            className="px-3 py-1 bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#ef4444] rounded font-medium text-sm transition-colors"
                          >
                            Resolve NO
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleCreateMarket} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Market Question *
                </label>
                <input
                  type="text"
                  value={newMarket.title}
                  onChange={(e) => setNewMarket({ ...newMarket, title: e.target.value })}
                  placeholder="Will Bitcoin reach $100,000 by 2024?"
                  className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-3 text-white placeholder-[#71717a] focus:border-[#6366f1] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Description
                </label>
                <textarea
                  value={newMarket.description}
                  onChange={(e) => setNewMarket({ ...newMarket, description: e.target.value })}
                  placeholder="Market resolves YES if Bitcoin trades at or above $100,000..."
                  rows={4}
                  className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-3 text-white placeholder-[#71717a] focus:border-[#6366f1] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newMarket.imageUrl}
                  onChange={(e) => setNewMarket({ ...newMarket, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-3 text-white placeholder-[#71717a] focus:border-[#6366f1] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Category *
                </label>
                <select
                  value={newMarket.category}
                  onChange={(e) => setNewMarket({ ...newMarket, category: e.target.value })}
                  className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-3 text-white focus:border-[#6366f1] focus:outline-none"
                  required
                >
                  <option value="crypto">Crypto</option>
                  <option value="sports">Sports</option>
                  <option value="politics">Politics</option>
                  <option value="technology">Technology</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-[#6366f1]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating Market...' : 'Create Market'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

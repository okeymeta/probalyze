import React, { useEffect, useState } from 'react';
import { PLATFORM_NAME, PLATFORM_TAGLINE } from '../constants';

interface Market {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  yesPrice: number;
  noPrice: number;
  volume24h: number;
  totalYesAmount: number;
  totalNoAmount: number;
  status: string;
  category: string;
}

interface ProbalyzeLandingProps {
  onConnect: () => void;
}

export const ProbalyzeLanding: React.FC<ProbalyzeLandingProps> = ({ onConnect }) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      const response = await fetch('/api/markets?status=active&limit=12&sort=volume24h&order=desc');
      if (response.ok) {
        const data = await response.json();
        setMarkets(data);
      }
    } catch (error) {
      console.error('Error loading markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'crypto', 'sports', 'politics', 'technology'];
  const filteredMarkets = selectedCategory === 'all' 
    ? markets 
    : markets.filter(m => m.category === selectedCategory);

  return (
    <div className="w-full min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
            {PLATFORM_NAME}
          </h1>
          <p className="text-2xl md:text-3xl text-[#a1a1aa] mb-4 font-semibold">
            {PLATFORM_TAGLINE}
          </p>
          <p className="text-lg text-[#71717a] mb-8 max-w-2xl mx-auto">
            Trade on real-world events. Make predictions. Earn SOL.
          </p>
          <button
            onClick={onConnect}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-full shadow-lg hover:shadow-[#6366f1]/50 transition-all duration-300 transform hover:scale-105"
          >
            Connect Wallet & Start Trading
          </button>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-[#2a2a3a] bg-[#13131a]/50 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{markets.length}</div>
            <div className="text-sm text-[#a1a1aa]">Active Markets</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {markets.reduce((acc, m) => acc + m.volume24h, 0).toFixed(0)}
            </div>
            <div className="text-sm text-[#a1a1aa]">24h Volume (SOL)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {markets.reduce((acc, m) => acc + m.totalYesAmount + m.totalNoAmount, 0).toFixed(0)}
            </div>
            <div className="text-sm text-[#a1a1aa]">Total Locked (SOL)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#22c55e] mb-1">2%</div>
            <div className="text-sm text-[#a1a1aa]">Platform Fee</div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/30'
                    : 'bg-[#13131a] text-[#a1a1aa] hover:bg-[#1a1a24] hover:text-white border border-[#2a2a3a]'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Markets Grid */}
      <section className="py-8 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#13131a] rounded-xl p-6 border border-[#2a2a3a] animate-pulse">
                  <div className="h-4 bg-[#2a2a3a] rounded mb-4 w-3/4" />
                  <div className="h-20 bg-[#2a2a3a] rounded mb-4" />
                  <div className="h-4 bg-[#2a2a3a] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#71717a] text-lg">No markets found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarkets.map(market => {
                const totalVolume = market.totalYesAmount + market.totalNoAmount;
                return (
                  <div
                    key={market.id}
                    className="bg-[#13131a] rounded-xl overflow-hidden border border-[#2a2a3a] hover:border-[#6366f1] transition-all duration-300 cursor-pointer group"
                    onClick={onConnect}
                  >
                    {/* Market Image */}
                    {market.imageUrl && (
                      <div className="relative h-48 overflow-hidden bg-[#1a1a24]">
                        <img
                          src={market.imageUrl}
                          alt={market.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 bg-[#13131a]/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white border border-[#2a2a3a]">
                          {market.category}
                        </div>
                      </div>
                    )}

                    <div className="p-5">
                      {/* Title */}
                      <h3 className="text-white font-semibold mb-3 line-clamp-2 group-hover:text-[#6366f1] transition-colors">
                        {market.title}
                      </h3>

                      {/* Price Indicators */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg p-3">
                          <div className="text-xs text-[#22c55e] mb-1 font-medium">Yes</div>
                          <div className="text-lg font-bold text-white">
                            {(market.yesPrice * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-3">
                          <div className="text-xs text-[#ef4444] mb-1 font-medium">No</div>
                          <div className="text-lg font-bold text-white">
                            {(market.noPrice * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Volume Stats */}
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[#71717a]">24h Vol:</span>
                          <span className="ml-1 text-white font-semibold">
                            {market.volume24h.toFixed(1)} SOL
                          </span>
                        </div>
                        <div>
                          <span className="text-[#71717a]">Pool:</span>
                          <span className="ml-1 text-white font-semibold">
                            {totalVolume.toFixed(1)} SOL
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-[#2a2a3a] bg-[#13131a]/50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Why Probalyze?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-[#a1a1aa]">
                Built on Solana for instant trades and near-zero fees
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Fully Transparent</h3>
              <p className="text-[#a1a1aa]">
                All trades and resolutions are verifiable on-chain
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#06b6d4] to-[#22c55e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real Profits</h3>
              <p className="text-[#a1a1aa]">
                Win real SOL with accurate predictions. Low 2% platform fee
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

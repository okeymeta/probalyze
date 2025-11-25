import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Market, MarketCategory } from '../types';
import { loadMarkets } from '../lib/marketManager';
import { MarketCard } from './MarketCard';
import SpinnerIcon from './icons/SpinnerIcon';
import { RefreshCcw, Search, X, Filter, ChevronDown } from 'lucide-react';

interface MarketListProps {
  userWallet?: string;
  isAdmin: boolean;
  onBetClick: (market: Market) => void;
  onResolveClick?: (market: Market) => void;
  onViewMarket?: (market: Market) => void;
  refreshTrigger?: number;
}

const CATEGORIES: { value: MarketCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '🌐' },
  { value: 'crypto', label: 'Crypto', icon: '₿' },
  { value: 'politics', label: 'Politics', icon: '🏛️' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'economy', label: 'Economy', icon: '📈' },
  { value: 'other', label: 'Other', icon: '📌' },
];

export const MarketList: React.FC<MarketListProps> = ({ 
  userWallet, 
  isAdmin, 
  onBetClick, 
  onResolveClick,
  onViewMarket,
  refreshTrigger 
}) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Search and category filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchMarkets = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setIsRefreshing(true);
    try {
      const loadedMarkets = await loadMarkets();
      setMarkets(loadedMarkets);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching markets:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load and manual refresh trigger
  useEffect(() => {
    fetchMarkets();
  }, [refreshTrigger, fetchMarkets]);

  // Auto-refresh every 15 seconds for real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarkets(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchMarkets]);

  const handleManualRefresh = () => {
    fetchMarkets(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Filter and search markets
  const filteredMarkets = useMemo(() => {
    return markets.filter(market => {
      // Status filter
      if (filter === 'active' && market.status !== 'active') return false;
      if (filter === 'resolved' && market.status !== 'resolved') return false;
      
      // Category filter
      if (selectedCategory !== 'all' && market.category !== selectedCategory) return false;
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = market.title.toLowerCase().includes(query);
        const matchesDescription = market.description.toLowerCase().includes(query);
        const matchesCategory = market.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription && !matchesCategory) return false;
      }
      
      return true;
    });
  }, [markets, filter, selectedCategory, searchQuery]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: markets.length };
    CATEGORIES.forEach(cat => {
      if (cat.value !== 'all') {
        counts[cat.value] = markets.filter(m => m.category === cat.value).length;
      }
    });
    return counts;
  }, [markets]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <SpinnerIcon className="h-16 w-16 text-purple-400 animate-spin mb-4" />
        <p className="text-gray-400 text-lg">Loading markets...</p>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-white mb-2">No Markets Yet</h3>
        <p className="text-gray-400">
          {isAdmin ? 'Create your first prediction market to get started!' : 'Check back soon for exciting prediction markets!'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar - Always visible and responsive */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search markets by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills - Horizontal scroll on mobile, wrap on desktop */}
      <div className="mb-4">
        {/* Mobile: Show filter toggle button */}
        <div className="flex items-center gap-2 sm:hidden mb-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:border-purple-500/50 transition-all"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
          {selectedCategory !== 'all' && (
            <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-purple-400 text-sm">
              {CATEGORIES.find(c => c.value === selectedCategory)?.icon} {CATEGORIES.find(c => c.value === selectedCategory)?.label}
            </span>
          )}
        </div>

        {/* Mobile filters dropdown */}
        {showMobileFilters && (
          <div className="sm:hidden mb-4 p-3 bg-gray-800/50 border border-gray-700 rounded-xl">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Categories</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setShowMobileFilters(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="text-xs opacity-60">({categoryCounts[cat.value] || 0})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Desktop: Horizontal category pills */}
        <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 hover:border-purple-500/50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={`text-xs ${selectedCategory === cat.value ? 'text-purple-200' : 'text-gray-500'}`}>
                ({categoryCounts[cat.value] || 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter Tabs with Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="flex-1 flex gap-1 sm:gap-2 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md font-semibold text-sm sm:text-base transition-all ${
              filter === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({markets.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md font-semibold text-sm sm:text-base transition-all ${
              filter === 'active' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Active ({markets.filter(m => m.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md font-semibold text-sm sm:text-base transition-all ${
              filter === 'resolved' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Resolved ({markets.filter(m => m.status === 'resolved').length})
          </button>
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all border border-gray-700 hover:border-purple-500/50"
        >
          <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sm:inline text-sm">Refresh</span>
        </button>
      </div>

      {/* Active filters summary */}
      {(searchQuery || selectedCategory !== 'all') && (
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <span className="text-sm text-gray-400">Active filters:</span>
          {searchQuery && (
            <span className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-sm">
              <Search className="w-3 h-3" />
              "{searchQuery}"
              <button onClick={clearSearch} className="ml-1 hover:text-blue-200">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-purple-400 text-sm">
              {CATEGORIES.find(c => c.value === selectedCategory)?.icon} {CATEGORIES.find(c => c.value === selectedCategory)?.label}
              <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-purple-200">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-sm text-gray-500 hover:text-white transition-colors ml-auto"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Last Updated Indicator */}
      <div className="flex items-center justify-end gap-2 mb-4 text-xs text-gray-500">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span>Live data • Updated {lastRefresh.toLocaleTimeString()}</span>
      </div>

      {/* Markets Grid */}
      {filteredMarkets.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">No markets found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery 
              ? `No markets match "${searchQuery}"` 
              : `No ${filter !== 'all' ? filter : ''} markets in ${selectedCategory !== 'all' ? CATEGORIES.find(c => c.value === selectedCategory)?.label : 'this category'}`
            }
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setFilter('all');
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map(market => (
            <MarketCard
              key={market.id}
              market={market}
              userWallet={userWallet}
              onBetClick={onBetClick}
              onResolveClick={onResolveClick}
              onViewMarket={onViewMarket}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {filteredMarkets.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredMarkets.length} of {markets.length} markets
        </div>
      )}
    </div>
  );
};
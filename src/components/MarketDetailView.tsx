import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, TrendingUp, TrendingDown, BarChart3, Users, Clock, 
  Zap, ChevronDown, ChevronUp, Activity, Calendar, Target,
  CandlestickChart, LineChart as LineChartIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ComposedChart, Bar, Line 
} from 'recharts';
import { Market, Bet } from '../types';
import { generateChartData, getUserBetsForMarket, calculatePriceChange, loadMarkets } from '../lib/marketManager';
import { SETTLEMENT_FEE_PERCENTAGE, PLATFORM_FEE_PERCENTAGE } from '../constants';
import { CommentSection } from './CommentSection';
import { NewsSection } from './NewsSection';
import { RulesSection } from './RulesSection';

interface MarketDetailViewProps {
  market: Market;
  userWallet?: string;
  onBack: () => void;
  onBetClick: (market: Market) => void;
  onResolveClick?: (market: Market) => void;
  isAdmin: boolean;
}

type ChartType = 'area' | 'candlestick';
type TimeFrame = '1H' | '4H' | '1D' | 'ALL';

export const MarketDetailView: React.FC<MarketDetailViewProps> = ({
  market: initialMarket,
  userWallet,
  onBack,
  onBetClick,
  onResolveClick,
  isAdmin
}) => {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('ALL');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [market, setMarket] = useState<Market>(initialMarket);

  // Reload market data in real-time when refreshKey changes
  useEffect(() => {
    const reloadMarket = async () => {
      const markets = await loadMarkets();
      const updatedMarket = markets.find(m => m.id === initialMarket.id);
      if (updatedMarket) {
        setMarket(updatedMarket);
      }
    };
    if (refreshKey > 0) {
      reloadMarket();
    }
  }, [refreshKey, initialMarket.id]);

  const totalPool = market.totalYesAmount + market.totalNoAmount;
  const yesPercentage = totalPool > 0 ? (market.totalYesAmount / totalPool) * 100 : market.initialYesPrice * 100;
  const noPercentage = 100 - yesPercentage;
  const priceChange = calculatePriceChange(market);

  const userBets = userWallet ? getUserBetsForMarket(market, userWallet) : [];
  const userYesBets = userBets.filter(b => b.prediction === 'yes').reduce((sum, bet) => sum + bet.amount, 0);
  const userNoBets = userBets.filter(b => b.prediction === 'no').reduce((sum, bet) => sum + bet.amount, 0);
  const userTotalBet = userYesBets + userNoBets;

  // Generate chart data
  const chartData = useMemo(() => {
    const data = generateChartData(market);
    
    // Filter by timeframe
    const now = Date.now();
    const timeFrameMs: Record<TimeFrame, number> = {
      '1H': 60 * 60 * 1000,
      '4H': 4 * 60 * 60 * 1000,
      '1D': 24 * 60 * 60 * 1000,
      'ALL': Infinity
    };

    const filteredData = data.filter(point => 
      timeFrame === 'ALL' || (now - point.timestamp) <= timeFrameMs[timeFrame]
    );

    return filteredData.map((point, index, arr) => {
      const prevPoint = arr[index - 1];
      return {
        time: new Date(point.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        date: new Date(point.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        timestamp: point.timestamp,
        yes: (point.yesPrice * 100).toFixed(1),
        no: (point.noPrice * 100).toFixed(1),
        yesRaw: point.yesPrice * 100,
        noRaw: point.noPrice * 100,
        volume: point.volume,
        // Candlestick data
        open: prevPoint ? prevPoint.yesPrice * 100 : point.yesPrice * 100,
        close: point.yesPrice * 100,
        high: Math.max(prevPoint ? prevPoint.yesPrice * 100 : point.yesPrice * 100, point.yesPrice * 100) + 2,
        low: Math.min(prevPoint ? prevPoint.yesPrice * 100 : point.yesPrice * 100, point.yesPrice * 100) - 2,
      };
    });
  }, [market, timeFrame]);

  // Generate candlestick data aggregated
  const candlestickData = useMemo(() => {
    if (chartData.length < 2) return [];
    
    const bucketSize = timeFrame === '1H' ? 5 : timeFrame === '4H' ? 15 : timeFrame === '1D' ? 60 : 120; // minutes
    const buckets: any[] = [];
    
    let currentBucket: any = null;
    
    chartData.forEach((point, i) => {
      const bucketIndex = Math.floor(i / Math.max(1, Math.floor(chartData.length / 20)));
      
      if (!currentBucket || bucketIndex !== currentBucket.index) {
        if (currentBucket) {
          buckets.push(currentBucket);
        }
        currentBucket = {
          index: bucketIndex,
          time: point.time,
          date: point.date,
          open: point.yesRaw,
          close: point.yesRaw,
          high: point.yesRaw,
          low: point.yesRaw,
          volume: point.volume
        };
      } else {
        currentBucket.close = point.yesRaw;
        currentBucket.high = Math.max(currentBucket.high, point.yesRaw);
        currentBucket.low = Math.min(currentBucket.low, point.yesRaw);
        currentBucket.volume = point.volume;
      }
    });
    
    if (currentBucket) {
      buckets.push(currentBucket);
    }
    
    return buckets.map(b => ({
      ...b,
      color: b.close >= b.open ? '#22c55e' : '#ef4444',
      bodyHeight: Math.abs(b.close - b.open),
      bodyY: Math.min(b.open, b.close),
    }));
  }, [chartData, timeFrame]);

  // Calculate potential payouts
  const calculateCurrentPayout = (prediction: 'yes' | 'no') => {
    if (totalPool === 0) return 0;
    const userAmount = prediction === 'yes' ? userYesBets : userNoBets;
    if (userAmount === 0) return 0;
    const winningTotal = prediction === 'yes' ? market.totalYesAmount : market.totalNoAmount;
    if (winningTotal === 0) return 0;
    const share = userAmount / winningTotal;
    const grossPayout = totalPool * share;
    const settlementFee = grossPayout * (SETTLEMENT_FEE_PERCENTAGE / 100);
    return grossPayout - settlementFee;
  };

  const yesWinPayout = calculateCurrentPayout('yes');
  const noWinPayout = calculateCurrentPayout('no');

  const getTimeRemaining = () => {
    if (market.status !== 'active') return null;
    
    // If no closesAt time is set, market is still open
    if (!market.closesAt || market.closesAt === 0) return 'Open';
    
    const now = Date.now();
    const msRemaining = market.closesAt - now;
    if (msRemaining <= 0) return 'Closed';
    
    const hours = Math.floor(msRemaining / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const mins = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours % 24}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getResolveDisplay = () => {
    if (market.timingType === 'tbd' || !market.resolveTime) {
      return market.timingNote ? `${market.timingNote}` : 'TBD';
    }
    if (market.timingType === 'flexible') {
      return market.timingNote ? `${market.timingNote}` : `${new Date(market.resolveTime).toLocaleDateString()}`;
    }
    return new Date(market.resolveTime).toLocaleDateString();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-gray-400 mb-2">{data.date} {data.time}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-green-400 text-sm">Yes:</span>
              <span className="text-white font-bold text-sm">{data.yes || data.close?.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-red-400 text-sm">No:</span>
              <span className="text-white font-bold text-sm">{data.no || (100 - data.close)?.toFixed(1)}%</span>
            </div>
            {chartType === 'candlestick' && (
              <>
                <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-600">
                  <span className="text-gray-400 text-xs">Open:</span>
                  <span className="text-white text-xs">{data.open?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-400 text-xs">High:</span>
                  <span className="text-green-400 text-xs">{data.high?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-400 text-xs">Low:</span>
                  <span className="text-red-400 text-xs">{data.low?.toFixed(1)}%</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-600">
              <span className="text-gray-400 text-xs">Volume:</span>
              <span className="text-blue-400 font-semibold text-xs">{data.volume?.toFixed(2)} SOL</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CandlestickBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;
    
    const isGreen = payload.close >= payload.open;
    const color = isGreen ? '#22c55e' : '#ef4444';
    const candleWidth = Math.max(width * 0.6, 4);
    const wickWidth = 1;
    
    const bodyTop = Math.min(payload.open, payload.close);
    const bodyBottom = Math.max(payload.open, payload.close);
    const bodyHeight = bodyBottom - bodyTop;
    
    // Scale values to chart coordinates
    const yScale = (val: number) => y + ((100 - val) / 100) * height;
    
    return (
      <g>
        {/* Wick */}
        <line
          x1={x + width / 2}
          y1={yScale(payload.high)}
          x2={x + width / 2}
          y2={yScale(payload.low)}
          stroke={color}
          strokeWidth={wickWidth}
        />
        {/* Body */}
        <rect
          x={x + (width - candleWidth) / 2}
          y={yScale(bodyBottom)}
          width={candleWidth}
          height={Math.max(yScale(bodyTop) - yScale(bodyBottom), 2)}
          fill={isGreen ? color : 'transparent'}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    );
  };

  // Recent bets
  const recentBets = [...market.bets].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Back to Markets</span>
      </button>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Header */}
          <div className="glass-card rounded-xl p-6">
            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {market.status === 'active' && (
                <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-lg border border-green-500/30">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-400 text-xs font-bold">LIVE</span>
                </div>
              )}
              {market.status === 'resolved' && (
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  market.outcome === 'yes' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  🏆 {market.outcome?.toUpperCase()} WON
                </div>
              )}
              <div className="bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-600">
                <span className="text-gray-300 text-xs font-bold uppercase">{market.category}</span>
              </div>
              {market.status === 'active' && (
                <div className="flex items-center gap-1.5 bg-orange-500/20 px-3 py-1.5 rounded-lg border border-orange-500/30">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span className="text-orange-300 text-xs font-bold">{getTimeRemaining()}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">{market.title}</h1>

            {/* Description */}
            <div className="mb-4">
              <p className="text-gray-400 leading-relaxed">
                {showFullDescription || market.description.length <= 200 
                  ? market.description 
                  : `${market.description.slice(0, 200)}...`
                }
              </p>
              {market.description.length > 200 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="flex items-center gap-1 mt-2 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors"
                >
                  {showFullDescription ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show More
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Binary Market Price Display */}
            {(!market.marketType || market.marketType === 'simple') && (
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 uppercase font-bold">Yes</span>
                    {priceChange > 0 && <TrendingUp className="w-4 h-4 text-green-400" />}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-green-400">{yesPercentage.toFixed(1)}%</span>
                    {priceChange !== 0 && (
                      <span className={`text-sm font-bold ${priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3 text-green-400/70" />
                    <span className="text-xs text-green-400/70">{market.uniqueYesBettors.length} traders</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    {priceChange < 0 && <TrendingDown className="w-4 h-4 text-red-400" />}
                    <span className="text-xs text-gray-500 uppercase font-bold">No</span>
                  </div>
                  <div className="flex items-baseline justify-end gap-2">
                    <span className="text-4xl font-bold text-red-400">{noPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs text-red-400/70">{market.uniqueNoBettors.length} traders</span>
                    <Users className="w-3 h-3 text-red-400/70" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Outcome Candidates Display */}
          {(market.marketType === 'multi-outcome' || (market.outcomes && market.outcomes.length > 0)) && market.outcomes && market.outcomes.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                🗳️ All Candidates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {market.outcomes.map((outcome) => {
                  const outcomeTotal = outcome.totalYesAmount + outcome.totalNoAmount;
                  const outcomeTotalPool = market.totalYesAmount + market.totalNoAmount;
                  const outcomePercentage = outcomeTotalPool > 0 ? (outcomeTotal / outcomeTotalPool) * 100 : 0;
                  
                  return (
                    <div key={outcome.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all">
                      {outcome.imageUrl && (
                        <img 
                          src={outcome.imageUrl} 
                          alt={outcome.name}
                          className="w-full h-40 rounded-lg object-cover mb-3"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      )}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-bold text-white">{outcome.name}</h4>
                          <span className="text-lg font-bold text-purple-400">{outcomePercentage.toFixed(1)}%</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          <div>YES: {outcome.totalYesAmount.toFixed(2)} SOL</div>
                          <div>NO: {outcome.totalNoAmount.toFixed(2)} SOL</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const marketWithOutcome = { ...market };
                            (marketWithOutcome as any).selectedOutcomeId = outcome.id;
                            (onBetClick as any)(marketWithOutcome, outcome.id, 'yes');
                          }}
                          className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 text-sm font-bold py-2 rounded transition-all"
                        >
                          YES
                        </button>
                        <button
                          onClick={() => {
                            const marketWithOutcome = { ...market };
                            (marketWithOutcome as any).selectedOutcomeId = outcome.id;
                            (onBetClick as any)(marketWithOutcome, outcome.id, 'no');
                          }}
                          className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 text-sm font-bold py-2 rounded transition-all"
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chart Section */}
          <div className="glass-card rounded-xl p-6">
            {/* Chart Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChartType('area')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                    chartType === 'area' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <LineChartIcon className="w-4 h-4" />
                  Area
                </button>
                <button
                  onClick={() => setChartType('candlestick')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                    chartType === 'candlestick' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <CandlestickChart className="w-4 h-4" />
                  Candles
                </button>
              </div>
              
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                {(['1H', '4H', '1D', 'ALL'] as TimeFrame[]).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeFrame(tf)}
                    className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
                      timeFrame === tf 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            {chartData.length < 2 ? (
              <div className="flex items-center justify-center h-[400px] bg-gray-800/30 border border-gray-700 rounded-lg">
                <div className="text-center">
                  <div className="text-5xl mb-3">📊</div>
                  <p className="text-gray-400 text-lg">No trading activity yet</p>
                  <p className="text-gray-500 text-sm mt-1">Chart will appear after first trades</p>
                </div>
              </div>
            ) : (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorYesDetail" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorNoDetail" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#9ca3af" 
                        style={{ fontSize: '11px' }}
                        tick={{ fill: '#9ca3af' }}
                      />
                      <YAxis 
                        stroke="#9ca3af" 
                        style={{ fontSize: '11px' }}
                        tick={{ fill: '#9ca3af' }}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="yesRaw" 
                        name="Yes"
                        stroke="#22c55e" 
                        strokeWidth={2}
                        fill="url(#colorYesDetail)" 
                        dot={false}
                        activeDot={{ r: 6, fill: '#22c55e' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="noRaw"
                        name="No" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        fill="url(#colorNoDetail)" 
                        dot={false}
                        activeDot={{ r: 6, fill: '#ef4444' }}
                      />
                    </AreaChart>
                  ) : (
                    <ComposedChart data={candlestickData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#9ca3af" 
                        style={{ fontSize: '11px' }}
                        tick={{ fill: '#9ca3af' }}
                      />
                      <YAxis 
                        stroke="#9ca3af" 
                        style={{ fontSize: '11px' }}
                        tick={{ fill: '#9ca3af' }}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="close" 
                        shape={<CandlestickBar />}
                        isAnimationActive={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="close" 
                        stroke="#a855f7" 
                        strokeWidth={1}
                        dot={false}
                        strokeDasharray="5 5"
                      />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent Trades */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Recent Trades
            </h3>
            {recentBets.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No trades yet</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {recentBets.map((bet, index) => (
                  <div 
                    key={bet.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${bet.prediction === 'yes' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <span className={`font-bold text-sm ${bet.prediction === 'yes' ? 'text-green-400' : 'text-red-400'}`}>
                          {bet.prediction.toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">
                          {bet.walletAddress.slice(0, 4)}...{bet.walletAddress.slice(-4)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">{bet.amount.toFixed(4)} SOL</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(bet.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Trading Panel */}
        <div className="space-y-6">
          {/* Market Stats */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Market Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm">Total Pool</span>
                </div>
                <span className="text-white font-bold">{totalPool.toFixed(4)} SOL</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400 text-sm">24h Volume</span>
                </div>
                <span className="text-white font-bold">{market.volume24h.toFixed(4)} SOL</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-sm">Total Trades</span>
                </div>
                <span className="text-white font-bold">{market.bets.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-400 text-sm">Resolve Date</span>
                </div>
                <span className="text-white font-bold text-sm">
                  {getResolveDisplay()}
                </span>
              </div>
            </div>
          </div>

          {/* User Position */}
          {userTotalBet > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Your Position
              </h3>
              
              <div className="space-y-3 mb-4">
                {userYesBets > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <span className="text-green-400 font-semibold">YES</span>
                    <span className="text-white font-bold">{userYesBets.toFixed(4)} SOL</span>
                  </div>
                )}
                {userNoBets > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <span className="text-red-400 font-semibold">NO</span>
                    <span className="text-white font-bold">{userNoBets.toFixed(4)} SOL</span>
                  </div>
                )}
              </div>

              {market.status === 'active' && (
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 font-bold text-sm">Potential Payout</span>
                  </div>
                  {userYesBets > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">If YES wins:</span>
                      <span className="text-green-400 font-bold">{yesWinPayout.toFixed(4)} SOL</span>
                    </div>
                  )}
                  {userNoBets > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">If NO wins:</span>
                      <span className="text-green-400 font-bold">{noWinPayout.toFixed(4)} SOL</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Trade Button */}
          {market.status === 'active' && (
            <button
              onClick={() => onBetClick(market)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 text-lg"
            >
              🚀 Place Trade
            </button>
          )}

          {/* Admin Resolve */}
          {isAdmin && market.status === 'active' && onResolveClick && (
            <button
              onClick={() => onResolveClick(market)}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all text-lg"
            >
              ⚖️ Resolve Market
            </button>
          )}

          {/* Fee Info */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Fee Structure</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Platform Fee</span>
                <span className="text-white font-semibold">{PLATFORM_FEE_PERCENTAGE}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Settlement Fee</span>
                <span className="text-white font-semibold">{SETTLEMENT_FEE_PERCENTAGE}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-700">
                Platform fee is charged on each bet. Settlement fee is charged on winnings when market resolves.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* News, Rules, Comments Sections */}
      <div className="mt-8 space-y-6">
        <NewsSection market={market} />
        <RulesSection market={market} />
        <CommentSection 
          market={market} 
          userWallet={userWallet} 
          onCommentAdded={() => setRefreshKey(prev => prev + 1)}
        />
      </div>
    </div>
  );
};

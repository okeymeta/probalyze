import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Market, ChartDataPoint } from '../types';
import { generateChartData } from '../lib/marketManager';

interface MarketChartProps {
  market: Market;
  height?: number;
}

export const MarketChart: React.FC<MarketChartProps> = ({ market, height = 300 }) => {
  const chartData = useMemo(() => {
    const data = generateChartData(market);
    
    // Format data for recharts
    return data.map(point => ({
      time: new Date(point.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      timestamp: point.timestamp,
      yes: (point.yesPrice * 100).toFixed(1),
      no: (point.noPrice * 100).toFixed(1),
      yesRaw: point.yesPrice,
      noRaw: point.noPrice,
      volume: point.volume
    }));
  }, [market]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-gray-400 mb-2">{data.time}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-green-400 text-sm">Yes:</span>
              <span className="text-white font-bold text-sm">{data.yes}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-red-400 text-sm">No:</span>
              <span className="text-white font-bold text-sm">{data.no}%</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-600">
              <span className="text-gray-400 text-xs">Volume:</span>
              <span className="text-blue-400 font-semibold text-xs">{data.volume.toFixed(2)} SOL</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length < 2) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-800/30 border border-gray-700 rounded-lg"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-400 text-sm">No trading activity yet</p>
          <p className="text-gray-500 text-xs mt-1">Chart will appear after first bet</p>
        </div>
      </div>
    );
  }

  const lastDataPoint = chartData[chartData.length - 1];
  const yesPrice = parseFloat(lastDataPoint.yes);
  const noPrice = parseFloat(lastDataPoint.no);

  return (
    <div className="w-full">
      {/* Current Prices */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-400 text-sm">Yes</span>
            <span className="text-green-400 font-bold text-lg">{yesPrice}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-400 text-sm">No</span>
            <span className="text-red-400 font-bold text-lg">{noPrice}%</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">24h Volume</p>
          <p className="text-sm font-semibold text-blue-400">{market.volume24h.toFixed(2)} SOL</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart 
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorYes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorNo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af" 
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis 
            stroke="#9ca3af" 
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9ca3af' }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="yes" 
            stroke="#22c55e" 
            strokeWidth={2}
            fill="url(#colorYes)" 
            dot={false}
            activeDot={{ r: 6, fill: '#22c55e' }}
          />
          <Area 
            type="monotone" 
            dataKey="no" 
            stroke="#ef4444" 
            strokeWidth={2}
            fill="url(#colorNo)" 
            dot={false}
            activeDot={{ r: 6, fill: '#ef4444' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, BarChart3, RefreshCw, ArrowUpRight, ArrowDownRight, LogOut, Send } from 'lucide-react';
import { loadMarkets, getUserBalance, sellPosition, updateUserBalance } from '../lib/marketManager';
import { Market, Bet, UserBalance } from '../types';

interface PortfolioBet {
  id: string;
  marketId: string;
  amount: number;
  prediction: string;
  priceAtBet: number;
  potentialPayout: number;
  actualPayout: number | null;
  timestamp: number;
  isSettled: boolean;
  outcomeId?: string;
  outcomeName?: string;
  market: {
    id: string;
    title: string;
    status: string;
    closesAt: number | null;
    totalYesAmount: number;
    totalNoAmount: number;
  };
}

interface PortfolioData {
  user: UserBalance;
  portfolio: {
    totalInvested: number;
    totalReturns: number;
    unrealizedValue: number;
    profitLoss: number;
    totalBets: number;
    activeBets: number;
    settledBets: number;
  };
  bets: PortfolioBet[];
}

interface PortfolioPageProps {
  walletAddress: string;
  onMarketClick?: (marketId: string) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ walletAddress, onMarketClick }) => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'settled'>('all');
  const [sellLoading, setSellLoading] = useState<string | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, [walletAddress]);

  const fetchPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load from S3 storage instead of API
      const [markets, userBalance] = await Promise.all([
        loadMarkets(),
        getUserBalance(walletAddress)
      ]);

      // Extract user's bets from all markets
      const userBets: PortfolioBet[] = [];

      for (const market of markets) {
        const marketBets = market.bets.filter(bet => bet.walletAddress === walletAddress);

        for (const bet of marketBets) {
          const totalPool = market.totalYesAmount + market.totalNoAmount;
          const winningPool = bet.prediction === 'yes' ? market.totalYesAmount : market.totalNoAmount;
          const potentialPayout = winningPool > 0 ? (bet.amount / winningPool) * totalPool : bet.amount;

          let actualPayout: number | null = null;
          let isSettled = market.status === 'resolved';


          if (isSettled) {
            let isWinner = false;

            // Handle multi-outcome markets
            if (market.marketType === 'multi-outcome' && market.outcomes) {
              const winningOutcome = (market as any).resolvedOutcomeId;
              if (bet.outcomeId && bet.outcomeId === winningOutcome && bet.prediction === 'yes') {
                isWinner = true;
              }
            }
            // Handle binary markets
            else if (market.outcome) {
              if (bet.prediction === market.outcome) {
                isWinner = true;
              }
            }

            if (isWinner) {

              // Winner - calculate payout
              actualPayout = potentialPayout * 0.97; // After 3% settlement fee
            } else {
              // Loser - lost the bet
              actualPayout = 0;
            }
          }

          const outcomeName = bet.outcomeId && market.outcomes
            ? market.outcomes.find(o => o.id === bet.outcomeId)?.name
            : undefined;

          userBets.push({
            id: bet.id,
            marketId: market.id,
            amount: bet.amount,
            prediction: bet.prediction,
            priceAtBet: bet.prediction === 'yes'
              ? market.totalYesAmount / (market.totalYesAmount + market.totalNoAmount || 1)
              : market.totalNoAmount / (market.totalYesAmount + market.totalNoAmount || 1),
            potentialPayout,
            actualPayout,
            timestamp: bet.timestamp,
            isSettled,
            outcomeId: bet.outcomeId,
            outcomeName,
            market: {
              id: market.id,
              title: market.title,
              status: market.status,
              closesAt: market.closesAt,
              totalYesAmount: market.totalYesAmount,
              totalNoAmount: market.totalNoAmount
            }
          });
        }
      }

      // Calculate portfolio metrics
      let totalInvested = 0;
      let totalReturns = 0;
      let unrealizedValue = 0;
      let settledBetsCount = 0;
      let activeBetsCount = 0;

      for (const bet of userBets) {
        totalInvested += bet.amount;

        if (bet.isSettled) {
          settledBetsCount++;
          totalReturns += bet.actualPayout || 0;
        } else {
          activeBetsCount++;
          unrealizedValue += bet.potentialPayout || 0;
        }
      }

      const profitLoss = totalReturns - totalInvested;

      setData({
        user: userBalance,
        portfolio: {
          totalInvested,
          totalReturns,
          unrealizedValue,
          profitLoss,
          totalBets: userBets.length,
          activeBets: activeBetsCount,
          settledBets: settledBetsCount
        },
        bets: userBets.sort((a, b) => b.timestamp - a.timestamp)
      });
    } catch (err) {
      console.error('Portfolio fetch error:', err);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const formatSOL = (amount: number) => `${amount.toFixed(4)} SOL`;
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const filteredBets = data?.bets.filter(bet => {
    if (filter === 'active') return !bet.isSettled;
    if (filter === 'settled') return bet.isSettled;
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-800 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-8">
        <div className="glass-card rounded-xl p-8 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Portfolio</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchPortfolio}
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

  const { portfolio, bets, user } = data;
  const isProfitable = portfolio.profitLoss >= 0;
  const winRate = portfolio.settledBets > 0
    ? ((bets.filter(b => b.isSettled && (b.actualPayout || 0) > 0).length / portfolio.settledBets) * 100).toFixed(1)
    : '0';

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Portfolio</h1>
          <p className="text-gray-400">Track your predictions and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWithdraw(!showWithdraw)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
          >
            <Send className="w-4 h-4" />
            Withdraw
          </button>
          <button
            onClick={fetchPortfolio}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all border border-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="mb-8 glass-card rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-lg font-bold text-white mb-4">Send to Your Wallet</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Amount (SOL)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                max={data?.user.balance || 0}
                step="0.01"
                className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Available: {formatSOL(data?.user.balance || 0)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setIsWithdrawing(true);
                  try {
                    const amount = parseFloat(withdrawAmount);
                    if (!amount || amount <= 0) {
                      setError('Please enter a valid amount');
                      return;
                    }
                    if (amount > (data?.user.balance || 0)) {
                      setError('Insufficient balance');
                      return;
                    }
                    // Simulate sending to wallet - in production, integrate with Solana
                    await updateUserBalance(walletAddress, -amount, 'withdraw');
                    await fetchPortfolio();
                    setWithdrawAmount('');
                    setShowWithdraw(false);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Withdrawal failed');
                  } finally {
                    setIsWithdrawing(false);
                  }
                }}
                disabled={isWithdrawing || !withdrawAmount}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-all"
              >
                {isWithdrawing ? 'Sending...' : 'Send to Wallet'}
              </button>
              <button
                onClick={() => {
                  setShowWithdraw(false);
                  setWithdrawAmount('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Balance Card */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-gray-400">Available Balance</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatSOL(user.balance)}</p>
        </div>

        {/* Total Invested */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-gray-400">Total Invested</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatSOL(portfolio.totalInvested)}</p>
        </div>

        {/* P/L Card */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${isProfitable ? 'bg-green-600/20' : 'bg-red-600/20'} rounded-lg flex items-center justify-center`}>
              {isProfitable ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <span className="text-sm text-gray-400">Net Profit/Loss</span>
          </div>
          <p className={`text-2xl font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
            {isProfitable ? '+' : ''}{formatSOL(portfolio.profitLoss)}
          </p>
        </div>

        {/* Win Rate */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-sm text-gray-400">Win Rate</span>
          </div>
          <p className="text-2xl font-bold text-white">{winRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{portfolio.settledBets} settled bets</p>
        </div>
      </div>

      {/* Active Positions Summary */}
      {portfolio.activeBets > 0 && (
        <div className="glass-card rounded-xl p-6 mb-8 border-l-4 border-purple-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Active Positions</h3>
              <p className="text-gray-400 text-sm">
                You have {portfolio.activeBets} active bet{portfolio.activeBets > 1 ? 's' : ''} with potential payout of{' '}
                <span className="text-green-400 font-semibold">{formatSOL(portfolio.unrealizedValue)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400 font-medium">Awaiting resolution</span>
            </div>
          </div>
        </div>
      )}

      {/* Bets Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold text-white">Your Bets</h2>
            <div className="flex items-center gap-2">
              {(['all', 'active', 'settled'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'active' && portfolio.activeBets > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-purple-500/30 rounded text-xs">
                      {portfolio.activeBets}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredBets.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No {filter !== 'all' ? filter : ''} bets found</h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? "Start trading on prediction markets to build your portfolio!"
                : `You don't have any ${filter} bets at the moment.`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Market</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Position</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-400">Amount</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-400">Potential/Actual</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredBets.map((bet) => {
                  const isWin = bet.isSettled && (bet.actualPayout || 0) > 0;
                  const isLoss = bet.isSettled && bet.actualPayout === 0;

                  return (
                    <tr
                      key={bet.id}
                      className="hover:bg-gray-800/30 transition-colors cursor-pointer"
                      onClick={() => onMarketClick?.(bet.marketId)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                            M
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white line-clamp-1 max-w-[200px]">
                              {bet.market.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${bet.prediction === 'yes'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                          {bet.prediction === 'yes' ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {bet.prediction.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-white">{formatSOL(bet.amount)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {bet.isSettled ? (
                          <span className={`text-sm font-semibold ${isWin ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-gray-400'}`}>
                            {formatSOL(bet.actualPayout || 0)}
                          </span>
                        ) : (
                          <span className="text-sm text-blue-400 font-medium">
                            {formatSOL(bet.potentialPayout)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {bet.isSettled ? (
                          isWin ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                              <CheckCircle className="w-3 h-3" /> Won
                            </span>
                          ) : isLoss ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">
                              <XCircle className="w-3 h-3" /> Lost
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-semibold">
                              Refunded
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold">
                            <Clock className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-gray-500">{formatDate(bet.timestamp)}</span>
                          {!bet.isSettled && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                setSellLoading(bet.id);
                                try {
                                  const result = await sellPosition(bet.marketId, bet.id, walletAddress);
                                  if (result.success) {
                                    await fetchPortfolio();
                                  } else {
                                    setError(result.error || 'Failed to exit position');
                                  }
                                } finally {
                                  setSellLoading(null);
                                }
                              }}
                              disabled={sellLoading === bet.id}
                              className="text-xs px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded transition-all disabled:opacity-50 flex items-center gap-1"
                              title="Exit early at current market price"
                            >
                              <LogOut className="w-3 h-3" />
                              {sellLoading === bet.id ? 'Exiting...' : 'Exit'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
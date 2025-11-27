import React, { useState } from 'react';
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Market, PredictionOption, SolanaProvider } from '../types';
import { placeBet, calculatePotentialPayout, getWalletBetsInMarket, copyTrade } from '../lib/marketManager';
import { PLATFORM_WALLET_ADDRESS, MINIMUM_BET_AMOUNT, TRANSACTION_FEE_LAMPORTS, PLATFORM_FEE_PERCENTAGE, SETTLEMENT_FEE_PERCENTAGE } from '../constants';
import SpinnerIcon from './icons/SpinnerIcon';
import { Copy, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface BettingModalProps {
  market: Market;
  provider: SolanaProvider;
  userWallet: string;
  onClose: () => void;
  onBetPlaced: () => void;
  outcomeId?: string; // For multi-outcome markets
}

export const BettingModal: React.FC<BettingModalProps> = ({ 
  market, 
  provider, 
  userWallet, 
  onClose, 
  onBetPlaced,
  outcomeId
}) => {
  const [prediction, setPrediction] = useState<PredictionOption>('yes');
  const [amount, setAmount] = useState<string>('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCopyTrade, setShowCopyTrade] = useState(false);
  const [targetWallet, setTargetWallet] = useState<string>('');

  const handleBet = async () => {
    const betAmount = parseFloat(amount);
    
    if (isNaN(betAmount) || betAmount < MINIMUM_BET_AMOUNT) {
      setError(`Minimum bet is ${MINIMUM_BET_AMOUNT} SOL`);
      return;
    }

    setIsPlacing(true);
    setError(null);

    try {
      const connection = new Connection('https://solana-rpc.publicnode.com', 'confirmed');
      const userPublicKey = new PublicKey(userWallet);
      
      // Check balance
      const balance = await connection.getBalance(userPublicKey);
      const requiredLamports = betAmount * LAMPORTS_PER_SOL + TRANSACTION_FEE_LAMPORTS;
      
      if (balance < requiredLamports) {
        setError(`Insufficient balance. Need ${(requiredLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        setIsPlacing(false);
        return;
      }

      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash('confirmed');

      // Create transfer transaction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: PLATFORM_WALLET_ADDRESS,
        lamports: Math.floor(betAmount * LAMPORTS_PER_SOL),
      });

      const transaction = new Transaction({
        feePayer: userPublicKey,
        recentBlockhash: blockhash
      }).add(transferInstruction);

      // Sign and send transaction
      const signedTx = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        { 
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 3
        }
      );

      // Wait for confirmation
      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight: (await connection.getLatestBlockhash('confirmed')).lastValidBlockHeight
        },
        'confirmed'
      );

      // Record bet in storage
      const result = await placeBet(market.id, userWallet, betAmount, prediction, signature, outcomeId);

      if (result.success) {
        onBetPlaced();
        onClose();
      } else {
        setError(result.error || 'Failed to record bet');
      }
    } catch (err) {
      console.error('Betting error:', err);
      if (err instanceof Error) {
        if (err.message.includes('User rejected')) {
          setError('Transaction cancelled');
        } else {
          setError(`Transaction failed: ${err.message}`);
        }
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsPlacing(false);
    }
  };

  const handleCopyTrade = async () => {
    if (!targetWallet || targetWallet === userWallet) {
      setError('Please enter a valid wallet address different from yours');
      return;
    }

    // Validate wallet address format
    try {
      new PublicKey(targetWallet);
    } catch {
      setError('Invalid wallet address format');
      return;
    }

    // Check if target wallet has bets in this market
    const targetBets = getWalletBetsInMarket(market, targetWallet);
    if (targetBets.length === 0) {
      setError('Target wallet has no bets in this market');
      return;
    }

    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount < MINIMUM_BET_AMOUNT) {
      setError(`Minimum amount is ${MINIMUM_BET_AMOUNT} SOL`);
      return;
    }

    setIsPlacing(true);
    setError(null);

    try {
      const connection = new Connection('https://solana-rpc.publicnode.com', 'confirmed');
      const userPublicKey = new PublicKey(userWallet);
      
      // Check balance
      const balance = await connection.getBalance(userPublicKey);
      const requiredLamports = betAmount * LAMPORTS_PER_SOL + TRANSACTION_FEE_LAMPORTS;
      
      if (balance < requiredLamports) {
        setError(`Insufficient balance. Need ${(requiredLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        setIsPlacing(false);
        return;
      }

      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash('confirmed');

      // Create transfer transaction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: PLATFORM_WALLET_ADDRESS,
        lamports: Math.floor(betAmount * LAMPORTS_PER_SOL),
      });

      const transaction = new Transaction({
        feePayer: userPublicKey,
        recentBlockhash: blockhash
      }).add(transferInstruction);

      // Sign and send transaction
      const signedTx = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        { 
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 3
        }
      );

      // Wait for confirmation
      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight: (await connection.getLatestBlockhash('confirmed')).lastValidBlockHeight
        },
        'confirmed'
      );

      // Execute copy trade
      const result = await copyTrade(market.id, userWallet, targetWallet, signature);

      if (result.success) {
        onBetPlaced();
        onClose();
      } else {
        setError(result.error || 'Failed to copy trade');
      }
    } catch (err) {
      console.error('Copy trade error:', err);
      if (err instanceof Error) {
        if (err.message.includes('User rejected')) {
          setError('Transaction cancelled');
        } else {
          setError(`Transaction failed: ${err.message}`);
        }
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsPlacing(false);
    }
  };

  const potentialPayout = amount ? calculatePotentialPayout(market, parseFloat(amount) || 0, prediction) : 0;
  const potentialReturn = potentialPayout - (parseFloat(amount) || 0);
  const roi = amount && parseFloat(amount) > 0 ? ((potentialReturn / parseFloat(amount)) * 100) : 0;

  // Calculate detailed breakdown for real-time display
  const betAmount = parseFloat(amount) || 0;
  const platformFee = betAmount * (PLATFORM_FEE_PERCENTAGE / 100);
  const netBetAmount = betAmount - platformFee;
  
  // Calculate what pool would look like with this bet
  const newTotalYes = market.totalYesAmount + (prediction === 'yes' ? netBetAmount : 0);
  const newTotalNo = market.totalNoAmount + (prediction === 'no' ? netBetAmount : 0);
  const newTotalPool = newTotalYes + newTotalNo;
  
  // Calculate share of winning pool
  const winningPoolTotal = prediction === 'yes' ? newTotalYes : newTotalNo;
  const userShareOfWinningPool = winningPoolTotal > 0 ? (netBetAmount / winningPoolTotal) * 100 : 0;
  
  // Calculate gross payout before settlement fee
  const grossPayout = winningPoolTotal > 0 ? (newTotalPool / winningPoolTotal) * netBetAmount : netBetAmount;
  const settlementFee = grossPayout * (SETTLEMENT_FEE_PERCENTAGE / 100);
  const finalPayout = grossPayout - settlementFee;

  // Get top traders for copy trading suggestions
  const getTopTraders = () => {
    const traderStats = new Map<string, { total: number; wins: number; bets: number }>();
    
    market.bets.forEach(bet => {
      if (bet.walletAddress === userWallet) return;
      
      const stats = traderStats.get(bet.walletAddress) || { total: 0, wins: 0, bets: 0 };
      stats.total += bet.amount;
      stats.bets += 1;
      traderStats.set(bet.walletAddress, stats);
    });

    return Array.from(traderStats.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 3);
  };

  const topTraders = getTopTraders();
  const selectedOutcome = outcomeId ? market.outcomes?.find(o => o.id === outcomeId) : null;
  const isMultiOutcome = market.marketType === 'multi-outcome' && outcomeId;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-lg shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4 sm:mb-6 gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Place Your Bet</h2>
            <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">{market.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl sm:text-2xl shrink-0 p-1">&times;</button>
        </div>

        {/* Trading Details - Personalized Info */}
        <div className={`rounded-lg p-4 mb-4 sm:mb-6 border-2 ${
          isMultiOutcome 
            ? 'bg-purple-500/10 border-purple-500' 
            : 'bg-blue-500/10 border-blue-500'
        }`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Market Type</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                isMultiOutcome
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'bg-blue-500/20 text-blue-300'
              }`}>
                {isMultiOutcome ? '🗳️ Multi-Outcome' : '📊 Binary'}
              </span>
            </div>
            {isMultiOutcome && selectedOutcome && (
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Trading On</span>
                <span className="text-white font-bold text-sm">{selectedOutcome.name}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Your Prediction</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                prediction === 'yes'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {prediction === 'yes' ? '👍 YES' : '👎 NO'}
              </span>
            </div>
            {amount && parseFloat(amount) >= MINIMUM_BET_AMOUNT && (
              <div className="border-t border-gray-600 pt-2 mt-2 flex items-center justify-between">
                <span className="text-gray-300 text-sm">Potential Profit</span>
                <span className={`text-base font-bold ${
                  potentialReturn > 0 ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {potentialReturn > 0 ? '+' : ''}{potentialReturn.toFixed(4)} SOL
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle between Manual and Copy Trade */}
        <div className="flex gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => setShowCopyTrade(false)}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all text-sm sm:text-base ${
              !showCopyTrade
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Manual Bet
          </button>
          <button
            onClick={() => setShowCopyTrade(true)}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
              showCopyTrade
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy Trade</span>
            <span className="sm:hidden">Copy</span>
          </button>
        </div>

        {!showCopyTrade ? (
          <>
            {/* Manual Betting */}
            {/* Prediction Selection */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-3 font-semibold">Your Prediction</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPrediction('yes')}
                  className={`py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                    prediction === 'yes'
                      ? 'bg-green-600 text-white ring-2 ring-green-400'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  👍 YES
                </button>
                <button
                  onClick={() => setPrediction('no')}
                  className={`py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                    prediction === 'no'
                      ? 'bg-red-600 text-white ring-2 ring-red-400'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  👎 NO
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-semibold">Bet Amount (SOL)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min: ${MINIMUM_BET_AMOUNT} SOL`}
                step="0.01"
                min={MINIMUM_BET_AMOUNT}
                className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
              />
            </div>

            {/* Real-Time Payout Preview - IF MARKET CLOSES NOW */}
            {amount && parseFloat(amount) >= MINIMUM_BET_AMOUNT && (
              <div className="space-y-4 mb-6">
                {/* Main Payout Card - Prominent Display */}
                <div className={`rounded-xl p-5 border-2 ${
                  prediction === 'yes' 
                    ? 'bg-green-500/10 border-green-500 shadow-lg shadow-green-500/20' 
                    : 'bg-red-500/10 border-red-500 shadow-lg shadow-red-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className={`w-5 h-5 ${prediction === 'yes' ? 'text-green-400' : 'text-red-400'}`} />
                    <h3 className="text-white font-bold text-lg">If Market Closes Now & You Win</h3>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 mb-3">
                    <div className="text-center">
                      <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">You Would Receive</div>
                      <div className={`text-4xl font-bold number-mono ${
                        prediction === 'yes' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {finalPayout.toFixed(4)} SOL
                      </div>
                      <div className={`text-sm mt-2 font-semibold ${
                        potentialReturn > 0 ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {potentialReturn > 0 ? '+' : ''}{potentialReturn.toFixed(4)} SOL profit ({roi > 0 ? '+' : ''}{roi.toFixed(1)}% ROI)
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Your Share of Winning Pool:</span>
                      <span className="text-white font-bold">{userShareOfWinningPool.toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Current Market Odds:</span>
                      <span className="text-white font-mono">
                        {prediction === 'yes' 
                          ? `${((newTotalYes / newTotalPool) * 100).toFixed(1)}% Yes`
                          : `${((newTotalNo / newTotalPool) * 100).toFixed(1)}% No`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown - Expandable */}
                <details className="bg-gray-900/50 rounded-lg border border-gray-700">
                  <summary className="cursor-pointer px-4 py-3 text-sm text-gray-300 hover:text-white font-semibold">
                    📊 See Detailed Breakdown
                  </summary>
                  <div className="px-4 pb-4 space-y-2 text-sm border-t border-gray-700 pt-3 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Your Bet:</span>
                      <span className="text-white font-mono">{betAmount.toFixed(4)} SOL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform Fee (2.5%):</span>
                      <span className="text-red-400 font-mono">-{platformFee.toFixed(4)} SOL</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
                      <span className="text-gray-300">Net Bet Amount:</span>
                      <span className="text-white font-mono">{netBetAmount.toFixed(4)} SOL</span>
                    </div>
                    <div className="my-3 border-t border-gray-700 pt-3">
                      <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">If You Win:</div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Prize Pool:</span>
                        <span className="text-blue-400 font-mono">{newTotalPool.toFixed(4)} SOL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Your Share ({userShareOfWinningPool.toFixed(2)}%):</span>
                        <span className="text-white font-mono">{grossPayout.toFixed(4)} SOL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Settlement Fee (3%):</span>
                        <span className="text-red-400 font-mono">-{settlementFee.toFixed(4)} SOL</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-gray-700 pt-2 mt-2">
                        <span className={prediction === 'yes' ? 'text-green-400' : 'text-red-400'}>Final Payout:</span>
                        <span className={`font-mono ${prediction === 'yes' ? 'text-green-400' : 'text-red-400'}`}>
                          {finalPayout.toFixed(4)} SOL
                        </span>
                      </div>
                    </div>
                  </div>
                </details>

                {/* Important Notice */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 text-lg">ℹ️</span>
                    <div className="text-xs text-blue-300">
                      <strong>Live Calculation:</strong> These numbers update in real-time based on current market conditions. 
                      Actual payout may vary if other bets are placed before market resolves. You only get paid if your prediction wins.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleBet}
              disabled={isPlacing || !amount || parseFloat(amount) < MINIMUM_BET_AMOUNT}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPlacing ? (
                <>
                  <SpinnerIcon className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `🚀 Place Bet`
              )}
            </button>
          </>
        ) : (
          <>
            {/* Copy Trading */}
            <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <strong>Copy Trading:</strong> Replicate another trader's bet proportions in this market. Your bet will be split between YES/NO following their strategy.
                </div>
              </div>
            </div>

            {/* Top Traders */}
            {topTraders.length > 0 && (
              <div className="mb-6">
                <label className="block text-gray-300 mb-3 font-semibold">Top Traders in This Market</label>
                <div className="space-y-2">
                  {topTraders.map(([wallet, stats]) => (
                    <button
                      key={wallet}
                      onClick={() => setTargetWallet(wallet)}
                      className={`w-full p-3 rounded-lg border transition-all text-left ${
                        targetWallet === wallet
                          ? 'bg-blue-600/30 border-blue-500'
                          : 'bg-gray-700 border-gray-600 hover:border-blue-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-mono text-sm">
                            {wallet.slice(0, 4)}...{wallet.slice(-4)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {stats.bets} bet{stats.bets !== 1 ? 's' : ''} • {stats.total.toFixed(4)} SOL
                          </div>
                        </div>
                        <Copy className="w-4 h-4 text-blue-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Wallet Input */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-semibold">Or Enter Wallet Address</label>
              <input
                type="text"
                value={targetWallet}
                onChange={(e) => setTargetWallet(e.target.value)}
                placeholder="Enter wallet address to copy"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-semibold">Your Copy Amount (SOL)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min: ${MINIMUM_BET_AMOUNT} SOL`}
                step="0.01"
                min={MINIMUM_BET_AMOUNT}
                className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              <p className="text-xs text-gray-500 mt-2">
                Your bet will be split proportionally to match the target wallet's strategy
              </p>
            </div>

            <button
              onClick={handleCopyTrade}
              disabled={isPlacing || !amount || !targetWallet || parseFloat(amount) < MINIMUM_BET_AMOUNT}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPlacing ? (
                <>
                  <SpinnerIcon className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Trade
                </>
              )}
            </button>
          </>
        )}

        {/* Current Odds */}
        <div className="bg-gray-900 rounded-lg p-4 mt-6">
          <div className="text-sm text-gray-400 mb-2">Current Market</div>
          <div className="flex justify-between text-sm">
            <div className="text-green-400">
              <span className="font-semibold">YES:</span> {market.totalYesAmount.toFixed(4)} SOL
            </div>
            <div className="text-red-400">
              <span className="font-semibold">NO:</span> {market.totalNoAmount.toFixed(4)} SOL
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mt-4 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
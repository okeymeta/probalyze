import React, { useEffect, useState } from 'react';
import { getUserBalance, updateUserBalance } from '../lib/marketManager';
import { UserBalance, SolanaProvider } from '../types';
import { Wallet, TrendingUp, TrendingDown, Award, Plus, Info, Zap, ArrowDownToLine, X, Loader2, AlertCircle, Check } from 'lucide-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PLATFORM_WALLET_ADDRESS, PLATFORM_FEE_PERCENTAGE, SETTLEMENT_FEE_PERCENTAGE } from '../constants';

interface UserBalanceWidgetProps {
  walletAddress: string;
  provider?: SolanaProvider | null;
}

// Solana network fee (roughly 5000 lamports = 0.000005 SOL)
const ESTIMATED_GAS_FEE_SOL = 0.000005;
// Platform deposit fee percentage
const DEPOSIT_FEE_PERCENTAGE = 0;

// Use multiple RPC endpoints with fallback
const RPC_ENDPOINTS = [
  'https://solana-rpc.publicnode.com',
  'https://solana-mainnet.g.alchemy.com/v2/demo',
  'https://rpc.ankr.com/solana',
  'https://api.mainnet-beta.solana.com',
];

const getConnection = async (): Promise<Connection> => {
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const connection = new Connection(endpoint, 'confirmed');
      // Test if the endpoint works
      await connection.getLatestBlockhash();
      return connection;
    } catch (err) {
      console.warn(`RPC endpoint ${endpoint} failed, trying next...`);
    }
  }
  // Fallback to publicnode
  return new Connection('https://solana-rpc.publicnode.com', 'confirmed');
};

export const UserBalanceWidget: React.FC<UserBalanceWidgetProps> = ({ walletAddress, provider }) => {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    loadBalance();
    const interval = setInterval(loadBalance, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [walletAddress]);

  useEffect(() => {
    if (showDepositModal && provider) {
      fetchWalletBalance();
    }
  }, [showDepositModal, provider]);

  const loadBalance = async () => {
    try {
      const userBalance = await getUserBalance(walletAddress);
      setBalance(userBalance);
    } catch (err) {
      console.error('Error loading balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const connection = await getConnection();
      const publicKey = new PublicKey(walletAddress);
      const lamports = await connection.getBalance(publicKey);
      setWalletBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
      setWalletBalance(null);
    }
  };

  const handleDeposit = async () => {
    if (!provider || !depositAmount) return;
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositError('Please enter a valid amount');
      return;
    }

    if (amount < 0.01) {
      setDepositError('Minimum deposit is 0.01 SOL');
      return;
    }

    if (walletBalance !== null && amount > walletBalance - ESTIMATED_GAS_FEE_SOL) {
      setDepositError('Insufficient wallet balance (including gas fee)');
      return;
    }

    setIsDepositing(true);
    setDepositError(null);

    try {
      const connection = await getConnection();
      const fromPublicKey = new PublicKey(walletAddress);
      
      // Create transaction to send SOL to platform wallet
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: PLATFORM_WALLET_ADDRESS,
          lamports: Math.floor(amount * LAMPORTS_PER_SOL),
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPublicKey;

      // Sign and send transaction
      const { signature } = await provider.signAndSendTransaction(transaction);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      // Update user balance in system
      await updateUserBalance(walletAddress, amount, 'deposit');
      
      // Refresh balances
      await loadBalance();
      await fetchWalletBalance();

      setDepositSuccess(true);
      setDepositAmount('');
      
      // Auto close after success
      setTimeout(() => {
        setShowDepositModal(false);
        setDepositSuccess(false);
      }, 2000);

    } catch (err) {
      console.error('Deposit error:', err);
      if (err instanceof Error) {
        if (err.message.includes('User rejected')) {
          setDepositError('Transaction cancelled by user');
        } else {
          setDepositError(err.message);
        }
      } else {
        setDepositError('Failed to process deposit. Please try again.');
      }
    } finally {
      setIsDepositing(false);
    }
  };

  const calculateFeeBreakdown = () => {
    const amount = parseFloat(depositAmount) || 0;
    const gasFee = ESTIMATED_GAS_FEE_SOL;
    const platformDepositFee = amount * (DEPOSIT_FEE_PERCENTAGE / 100);
    const netDeposit = amount - platformDepositFee;
    const totalCost = amount + gasFee;
    
    return {
      amount,
      gasFee,
      platformDepositFee,
      netDeposit,
      totalCost
    };
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  if (!balance) return null;

  const formatSOL = (amount: number) => {
    return `${amount.toFixed(4)} SOL`;
  };

  const netProfitLoss = balance.totalWinnings - balance.totalDeposited;
  const isProfitable = netProfitLoss >= 0;
  const fees = calculateFeeBreakdown();

  return (
    <>
      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Your Balance</h3>
        </div>

        {/* Main Balance */}
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-1">Available Balance</p>
          <p className="text-4xl font-bold text-white">{formatSOL(balance.balance)}</p>
        </div>

        {/* Deposit Button */}
        <button
          onClick={() => setShowDepositModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 mb-4"
        >
          <Plus className="w-5 h-5" />
          <span>Deposit SOL</span>
          <ArrowDownToLine className="w-4 h-4" />
        </button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Deposited</span>
            </div>
            <p className="text-sm font-semibold text-white">{formatSOL(balance.totalDeposited)}</p>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Winnings</span>
            </div>
            <p className="text-sm font-semibold text-white">{formatSOL(balance.totalWinnings)}</p>
          </div>
        </div>

        {/* Profit/Loss */}
        <div className={`rounded-lg p-4 ${isProfitable ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isProfitable ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm text-gray-300">Net P/L</span>
            </div>
            <span className={`text-lg font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
              {isProfitable ? '+' : ''}{formatSOL(netProfitLoss)}
            </span>
          </div>
        </div>

        {/* Fee Info */}
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400 font-semibold">Fee Structure</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Platform Fee (per bet)</span>
              <span className="text-gray-300">{PLATFORM_FEE_PERCENTAGE}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Settlement Fee (on wins)</span>
              <span className="text-gray-300">{SETTLEMENT_FEE_PERCENTAGE}%</span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-gray-500 mt-3 text-center">
          Updated {new Date(balance.lastUpdated).toLocaleTimeString()}
        </p>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                  <ArrowDownToLine className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Deposit SOL</h3>
                  <p className="text-xs text-gray-400">Add funds to your trading balance</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositError(null);
                  setDepositSuccess(false);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {depositSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Deposit Successful!</h4>
                <p className="text-gray-400">Your balance has been updated.</p>
              </div>
            ) : (
              <>
                {/* Wallet Balance */}
                {walletBalance !== null && (
                  <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Wallet Balance</span>
                      <span className="text-white font-bold">{walletBalance.toFixed(4)} SOL</span>
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Amount to Deposit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value);
                        setDepositError(null);
                      }}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-green-500 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">SOL</span>
                  </div>
                  {/* Quick amounts */}
                  <div className="flex gap-2 mt-2">
                    {[0.1, 0.5, 1, 5].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setDepositAmount(amount.toString())}
                        className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold rounded-md transition-colors"
                      >
                        {amount} SOL
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fee Breakdown */}
                {fees.amount > 0 && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-bold text-blue-300">Fee Breakdown</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Deposit Amount</span>
                        <span className="text-white font-semibold">{fees.amount.toFixed(4)} SOL</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">Network Gas Fee</span>
                          <span className="text-xs text-gray-500">(Solana)</span>
                        </div>
                        <span className="text-orange-400 font-semibold">~{fees.gasFee.toFixed(6)} SOL</span>
                      </div>
                      {DEPOSIT_FEE_PERCENTAGE > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Platform Fee ({DEPOSIT_FEE_PERCENTAGE}%)</span>
                          <span className="text-yellow-400 font-semibold">{fees.platformDepositFee.toFixed(4)} SOL</span>
                        </div>
                      )}
                      <div className="border-t border-gray-600 pt-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 font-semibold">Total Cost</span>
                          <span className="text-white font-bold">{fees.totalCost.toFixed(4)} SOL</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-green-400 font-semibold">You'll Receive</span>
                          <span className="text-green-400 font-bold">{fees.netDeposit.toFixed(4)} SOL</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trading Fees Info */}
                <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-400 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      When trading: {PLATFORM_FEE_PERCENTAGE}% platform fee per bet, {SETTLEMENT_FEE_PERCENTAGE}% settlement fee on winnings.
                    </span>
                  </p>
                </div>

                {/* Error Message */}
                {depositError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-red-400 text-sm">{depositError}</span>
                  </div>
                )}

                {/* Deposit Button */}
                <button
                  onClick={handleDeposit}
                  disabled={isDepositing || !depositAmount || parseFloat(depositAmount) <= 0}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg"
                >
                  {isDepositing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="w-5 h-5" />
                      <span>Confirm Deposit</span>
                    </>
                  )}
                </button>

                {/* Security Note */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  🔒 Secure transaction via Solana blockchain
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
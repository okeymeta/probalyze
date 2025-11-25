import { PublicKey, Transaction } from '@solana/web3.js';

// Define the interface for the Solana wallet provider injected into the window
export interface SolanaProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  publicKey: PublicKey | null;
  connect: (options?: { onlyIfTrusted: boolean }) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (
    transaction: Transaction,
    options?: unknown
  ) => Promise<{ signature: string }>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
}

export interface Testimonial {
    quote: string;
    author: string;
    role: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
}

// Prediction Market Types
export type MarketStatus = 'active' | 'closed' | 'resolved';
export type PredictionOption = 'yes' | 'no';
export type MarketCategory = 'crypto' | 'politics' | 'sports' | 'entertainment' | 'technology' | 'economy' | 'other';

export interface Bet {
  id: string;
  walletAddress: string;
  amount: number; // in SOL
  prediction: PredictionOption;
  timestamp: number;
  transactionSignature: string;
  platformFee: number; // Platform fee collected
}

export interface Market {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: MarketCategory;
  initialYesPrice: number; // Starting probability for Yes (0-1, e.g., 0.5 = 50%)
  createdAt: number;
  closesAt: number; // When market stops accepting bets
  resolveTime: number; // When admin will resolve the market
  resolvedAt: number | null;
  status: MarketStatus;
  outcome: PredictionOption | null;
  totalYesAmount: number;
  totalNoAmount: number;
  bets: Bet[];
  createdBy: string; // admin wallet address
  volume24h: number;
  platformFeesCollected: number;
  uniqueYesBettors: string[]; // Array of wallet addresses who bet Yes
  uniqueNoBettors: string[]; // Array of wallet addresses who bet No
}

export interface MarketData {
  markets: Market[];
  lastUpdated: number;
}

export interface ChartDataPoint {
  timestamp: number;
  yesPrice: number;
  noPrice: number;
  volume: number;
}

export interface UserBalance {
  walletAddress: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalWinnings: number;
  lastUpdated: number;
}

export interface PlatformStats {
  totalVolume: number;
  totalFees: number;
  totalUsers: number;
  activeMarkets: number;
  totalPoolMoney: number;
  last24hVolume: number;
  last24hFees: number;
}

export interface UserAgreement {
  walletAddress: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  timestamp: number;
}

export interface CopyTradeAction {
  id: string;
  copierWallet: string;
  targetWallet: string;
  marketId: string;
  amount: number;
  prediction: PredictionOption;
  timestamp: number;
  transactionSignature: string;
}
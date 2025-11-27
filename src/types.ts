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
export type MarketCategory = 'crypto' | 'politics' | 'sports' | 'entertainment' | 'technology' | 'economy' | 'finance' | 'weather' | 'science' | 'elections' | 'esports' | 'ai' | 'other';
export type MarketType = 'simple' | 'multi-outcome';
export type TimingType = 'fixed' | 'flexible' | 'tbd';

export interface Bet {
  id: string;
  walletAddress: string;
  amount: number; // in SOL
  prediction: PredictionOption;
  timestamp: number;
  transactionSignature: string;
  platformFee: number; // Platform fee collected
  outcomeId?: string; // For multi-outcome markets, links bet to specific outcome
}

export interface MarketOutcome {
  id: string;
  name: string;
  imageUrl?: string;
  totalYesAmount: number;
  totalNoAmount: number;
  yesPrice: number;
  noPrice: number;
  uniqueYesBettors: string[];
  uniqueNoBettors: string[];
  isWinner?: boolean;
}

export interface MarketNews {
  id: string;
  content: string;
  link?: string;
  createdAt: number;
  createdBy: string;
}

export interface MarketComment {
  id: string;
  walletAddress: string;
  content: string;
  timestamp: number;
  likes: string[];
  parentId?: string;
}

export interface MarketRule {
  id: string;
  content: string;
  order: number;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: MarketCategory;
  marketType: MarketType;
  initialYesPrice: number;
  createdAt: number;
  closesAt: number | null;
  resolveTime: number | null;
  timingType: TimingType;
  timingNote?: string;
  resolvedAt: number | null;
  status: MarketStatus;
  outcome: PredictionOption | null;
  totalYesAmount: number;
  totalNoAmount: number;
  bets: Bet[];
  createdBy: string;
  volume24h: number;
  totalVolume: number;
  platformFeesCollected: number;
  uniqueYesBettors: string[];
  uniqueNoBettors: string[];
  outcomes?: MarketOutcome[];
  winningOutcomeId?: string;
  news: MarketNews[];
  comments: MarketComment[];
  rules: MarketRule[];
  lastEditedAt?: number;
  lastEditedBy?: string;
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
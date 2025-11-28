import { PublicKey } from '@solana/web3.js';
import { Testimonial } from './types';

// The wallet address where all staked SOL will be sent (pool wallet)
export const PLATFORM_WALLET_ADDRESS = new PublicKey('2dEqAfP7J8TLG7apsR2CSv6Y6kcs36tZVSqrYjCB48ZC');

// Admin wallet address - only this wallet can create and close markets
export const ADMIN_WALLET_ADDRESS = '2dEqAfP7J8TLG7apsR2CSv6Y6kcs36tZVSqrYjCB48ZC';

// Transaction fee
export const TRANSACTION_FEE_LAMPORTS = 10000;

// Minimum bet amount in SOL
export const MINIMUM_BET_AMOUNT = 0.01;

// Platform fee percentage (charged on each bet) - 2.5%
export const PLATFORM_FEE_PERCENTAGE = 2.5;

// Settlement fee percentage (charged on winnings when market resolves) - 3%
export const SETTLEMENT_FEE_PERCENTAGE = 3;

// Platform name
export const PLATFORM_NAME = 'Probalyze';
export const PLATFORM_TAGLINE = 'Predict. Trade. Profit.';
export const PLATFORM_DESCRIPTION = 'The world\'s most advanced prediction market platform on Solana. Real-time charts, transparent fees, instant settlements.';

// Task & Earning related (legacy/unused)
export const ESTIMATED_APY = 50;
export const REWARD_PER_TASK = 0.1;

export const TESTIMONIALS: Testimonial[] = [
    {
        quote: "Probalyze has the best UX I've seen in prediction markets. Clean, fast, and profitable.",
        author: "CryptoTrader_",
        role: "Professional Trader"
    },
    {
        quote: "Made 15 SOL in my first week. The platform fees are fair and the markets are always liquid.",
        author: "PredictPro",
        role: "Market Analyst"
    },
    {
        quote: "Finally a Polymarket alternative on Solana. The speed and low fees make it so much better.",
        author: "SolanaMaxi",
        role: "DeFi Enthusiast"
    },
    {
        quote: "The charts and analytics are incredible. I can see exactly how markets are moving in real-time.",
        author: "DataDriven",
        role: "Quant Trader"
    },
    {
        quote: "I trust Probalyze more than any other platform. The admin is transparent and markets resolve fairly.",
        author: "TrustTheProcess",
        role: "Long-term User"
    },
    {
        quote: "Best prediction market platform period. The UI beats Polymarket hands down.",
        author: "MarketMaker99",
        role: "Liquidity Provider"
    }
];
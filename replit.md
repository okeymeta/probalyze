# Probalyze - Decentralized Prediction Markets

## Overview

Probalyze is a decentralized prediction market platform on Solana, enabling users to trade on real-world event outcomes using a pooled betting model. It functions similarly to Polymarket, offering YES/NO betting with dynamic pricing. The platform includes real-time market charts, portfolio tracking, leaderboards, and administrative controls for market creation and resolution. All data is stored in S3-compatible storage, with optional Turso database integration. The platform aims to provide a robust and user-friendly experience for prediction market enthusiasts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite.
**UI/UX**: Tailwind CSS v4, custom design tokens, Space Grotesk and JetBrains Mono fonts, glassmorphism effects, and shadcn/ui components, inspired by professional trading interfaces.
**State Management**: React hooks with local component state; data fetched on-demand.
**Routing**: Single-page application with manual page state management.
**Chart Visualization**: Recharts library for market price charts (area and candlestick) using real-time bet data.
**Multi-Outcome Markets**: Supports multiple candidates with independent YES/NO betting from market cards and detailed views, fully backward compatible with binary markets.

### Trading System

**Multi-Outcome Trading Flow**: Users place bets on specific candidates, recorded with an `outcomeId`, updating user balances and market pools.
**Binary Trading Flow**: Standard YES/NO bets for simple markets.
**Key Design Decision**: Centralized wallet for fund collection simplifies transactions but places trust in the admin for resolution and payouts.

### Blockchain Integration

**Solana Web3.js**: Direct integration for wallet operations and transactions.
**Wallet Support**: Multi-wallet support (Phantom, Solflare, Backpack, Brave).
**Transaction Flow**: Bets involve SOL transfers from user to platform wallet, incurring a 2.5% platform fee and a 3% settlement fee on winnings. Minimum bet is 0.01 SOL.

### Data Storage Architecture

**Primary Storage**: S3-compatible storage (Supabase S3) for JSON-based data: `markets.json`, `balances.json`, `platform-stats.json`, `user-agreements.json`, `copy-trades.json`.
**Bet Structure**: Includes `outcomeId` for multi-outcome market support.
**Database Schema**: Optional relational database layer (Drizzle + Turso) is defined but not actively used, favoring direct S3 storage for simplicity.

### Market Resolution System

**Admin-Only Control**: Market creation and resolution are restricted to a hardcoded admin wallet.
**Market Types**: Supports Binary (YES/NO) and Multi-Outcome markets with various timing types (Fixed, Flexible, TBD).
**Resolution Process**: Admin selects winning outcome, system calculates proportional payouts, deducts settlement fees, updates user balances, and marks the market as resolved. Refunds are issued for markets with only one bettor.

### Authentication & Authorization

**Wallet-Based Auth**: Users identified by Solana wallet addresses.
**Admin Verification**: Wallet address matching against a hardcoded admin address.
**Terms Acceptance**: Local storage tracks user agreement to terms.

### Comments & Real-Time Updates

**Comment System**: Users can post, like/unlike, and delete comments on markets, with real-time updates.
**Real-Time Features**: Instant display of comments, likes, and market data reloading.

### Image Management

**Supabase Storage**: Market images uploaded to Supabase buckets. Fallback to LocalStorage if not configured.

## External Dependencies

### Third-Party Services

**Supabase**: S3-compatible object storage for data and images, configured via environment variables.
**Turso Database**: SQLite-compatible database via libSQL, configured via environment variables, but not actively used.
**Google Gemini AI**: Used for generating market descriptions (Gemini 2.5 Flash model) and task generation, configured via environment variables.

### Blockchain Dependencies

**Solana RPC Endpoints**: Multiple fallback endpoints for robust connectivity.
**Wallet Providers**: Browser-injected Solana wallet providers.

### Development Tools

**Build System**: Vite 6 with React plugin.
**Code Quality**: ESLint (TypeScript support, strict mode disabled).
**Deployment**: Configured for Vercel.
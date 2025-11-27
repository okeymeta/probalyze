# Probalyze - Decentralized Prediction Markets

## Overview

Probalyze is a decentralized prediction market platform built on Solana, allowing users to trade on real-world event outcomes. The platform operates similarly to Polymarket, where users place bets on YES/NO outcomes with dynamic pricing based on market demand. The system uses a pooled betting model where all funds are collected in a platform wallet, and winners receive proportional payouts based on their share of the winning side.

The application features real-time market charts, portfolio tracking, leaderboards, and comprehensive admin controls for market creation and resolution. All market data and user balances are stored in S3-compatible storage (Supabase), with optional Turso database integration via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite as the bundler.

**UI Framework**: Tailwind CSS v4 with custom design tokens inspired by DexScreener's professional trading interface. The design system uses:
- Custom CSS variables for theming (dark mode focused)
- Space Grotesk and JetBrains Mono fonts for a modern, technical aesthetic
- Glassmorphism effects and gradient overlays
- shadcn/ui component library for consistent UI primitives

**State Management**: React hooks with local component state. No global state management library is used - data is fetched on-demand and passed through props.

**Routing**: Single-page application with manual page state management (no React Router). Navigation between Markets, Portfolio, and Leaderboard pages is handled via a `currentPage` state variable.

**Chart Visualization**: Recharts library for rendering market price charts with area and candlestick views, including volume indicators and real-time price updates.

### Blockchain Integration

**Solana Web3.js**: Direct integration with Solana blockchain for wallet operations and transactions.

**Wallet Support**: Multi-wallet support including Phantom, Solflare, Backpack, and Brave wallets through the browser's injected providers.

**Transaction Flow**:
- Users connect wallets via browser extensions
- Bets are placed by transferring SOL from user wallet to platform wallet
- Platform fee (2.5%) charged on each bet
- Settlement fee (3%) charged on winnings when markets resolve
- Minimum bet amount enforced at 0.01 SOL

**Key Design Decision**: The platform uses a centralized wallet for fund collection rather than smart contracts. This simplifies transaction logic but requires trust in the admin wallet for proper market resolution and payout distribution.

### Data Storage Architecture

**Primary Storage**: S3-compatible storage (Supabase S3) for JSON-based data persistence.

**Storage Files**:
- `markets.json` - All market data including bets, prices, and status
- `balances.json` - User balance tracking for deposits/withdrawals
- `platform-stats.json` - Global platform statistics
- `user-agreements.json` - Terms of service acceptance tracking
- `copy-trades.json` - Copy trading action history

**Database Schema** (Drizzle + Turso): Optional relational database layer defined but not actively used in the current implementation. Schema includes:
- `users` table - Wallet addresses and balance tracking
- `markets` table - Market metadata and state
- `bets` table - Individual bet records
- `platform_stats` table - Aggregated statistics

**Rationale**: The JSON file approach provides simplicity and direct S3 compatibility, avoiding the need for database infrastructure. However, this creates scaling limitations and potential race conditions with concurrent writes.

### Market Resolution System

**Admin-Only Control**: Only the admin wallet (hardcoded address) can create and resolve markets.

**Resolution Process**:
1. Admin selects winning outcome (YES/NO)
2. System calculates winner payouts based on proportional pool distribution
3. Settlement fee deducted from winnings
4. User balances updated in storage
5. Market status changed to "resolved"

**Refund Logic**: Markets with only one bettor are automatically refunded to prevent guaranteed losses.

### Authentication & Authorization

**Wallet-Based Auth**: No traditional authentication - users are identified solely by their Solana wallet addresses.

**Admin Verification**: Admin privileges checked by comparing connected wallet address to hardcoded `ADMIN_WALLET_ADDRESS` constant.

**Terms Acceptance**: Local storage tracking of user agreement to terms and conditions before wallet connection.

### Image Management

**Supabase Storage**: Market images uploaded to Supabase storage buckets with public access.

**Fallback**: LocalStorage-based fallback when Supabase is not configured.

## External Dependencies

### Third-Party Services

**Supabase**: 
- S3-compatible object storage for market data and images
- Configured via environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Optional - falls back to localStorage if not configured

**Turso Database**:
- SQLite-compatible database via libSQL
- Configured via environment variables (`TURSO_CONNECTION_URL`, `TURSO_AUTH_TOKEN`)
- Schema managed by Drizzle ORM
- Currently defined but not actively used in favor of S3 storage

**Google Gemini AI**:
- Used for task generation feature (appears to be legacy/unused code)
- API key hardcoded in Dashboard component

### Blockchain Dependencies

**Solana RPC Endpoints**: Multiple fallback endpoints for reliability:
- `https://solana-rpc.publicnode.com` (primary)
- `https://solana-mainnet.g.alchemy.com/v2/demo`
- `https://rpc.ankr.com/solana`
- `https://api.mainnet-beta.solana.com`

**Wallet Providers**: Browser-injected Solana wallet providers (window.solana, window.solflare, etc.)

### Development Tools

**Build System**: Vite 6 with React plugin
- Custom component tagger plugin for visual editing integration
- Error reporting to parent iframe for Replit integration

**Code Quality**: ESLint with TypeScript support, though strict mode is disabled in tsconfig

**Deployment**: Configured for Vercel with SPA fallback routing
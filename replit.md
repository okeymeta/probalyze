# Probalyze - Decentralized Prediction Markets

## Overview

Probalyze is a decentralized prediction market platform built on Solana, allowing users to trade on real-world event outcomes. The platform operates similarly to Polymarket, where users place bets on YES/NO outcomes with dynamic pricing based on market demand. The system uses a pooled betting model where all funds are collected in a platform wallet, and winners receive proportional payouts based on their share of the winning side.

The application features real-time market charts, portfolio tracking, leaderboards, and comprehensive admin controls for market creation and resolution. All market data and user balances are stored in S3-compatible storage (Supabase), with optional Turso database integration via Drizzle ORM.

## Recent Updates (November 27, 2025)

**Multi-Outcome Markets & UI Enhancements:**
- Implemented multi-outcome market display with individual candidate cards showing YES/NO buttons
- Each candidate displays its percentage of the total pool
- Market cards now show candidates in a grid layout (similar to election markets with candidates like "J.D. Vance", "Gavin Newsom")
- Fixed date/time display: shows custom timing notes when admin doesn't set specific date (supports TBD, flexible, and fixed timing types)
- Real-time comment updates with likes/deletes without page refresh
- Comment system fully functional with instant UI updates

**Expanded Market Categories:**
- Added 13 categories: crypto, politics, elections, sports, entertainment, technology, economy, finance, weather, science, esports, blockchain, other
- Categories now available in AdminPanel for market creation
- Category badges display on market cards for quick identification

**Bug Fixes:**
- Fixed undefined likes array error in comment system
- Resolved LSP type errors in MarketDetailView
- Binary market display preserved for backward compatibility

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

**State Management**: React hooks with local component state plus useEffect for real-time refreshing. Data is fetched on-demand and passed through props. Market detail views automatically reload data when comments/likes are updated.

**Routing**: Single-page application with manual page state management (no React Router). Navigation between Markets, Portfolio, and Leaderboard pages is handled via a `currentPage` state variable.

**Chart Visualization**: Recharts library for rendering market price charts with area and candlestick views, including volume indicators and real-time price updates.

**Multi-Outcome Markets**: MarketCard and MarketDetailView components now support:
- Displaying multiple candidates/outcomes in a grid
- Each outcome shows name, percentage, and YES/NO buttons
- Full backward compatibility with binary (simple) markets

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
- `markets.json` - All market data including bets, prices, status, multi-outcome details
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

**Market Types**:
- **Binary (Simple)**: YES/NO outcomes
- **Multi-Outcome**: Multiple candidates/options, each with YES/NO betting

**Timing Types**:
- **Fixed**: Specific date/time
- **Flexible**: Date range with custom note
- **TBD**: To be determined, displays custom timing note

**Resolution Process**:
1. Admin selects winning outcome (YES/NO for binary, or winning outcome for multi-outcome)
2. System calculates winner payouts based on proportional pool distribution
3. Settlement fee deducted from winnings
4. User balances updated in storage
5. Market status changed to "resolved"

**Refund Logic**: Markets with only one bettor are automatically refunded to prevent guaranteed losses.

### Authentication & Authorization

**Wallet-Based Auth**: No traditional authentication - users are identified solely by their Solana wallet addresses.

**Admin Verification**: Admin privileges checked by comparing connected wallet address to hardcoded `ADMIN_WALLET_ADDRESS` constant.

**Terms Acceptance**: Local storage tracking of user agreement to terms and conditions before wallet connection.

### Comments & Real-Time Updates

**Comment System**:
- Users can post comments on active markets
- Like/unlike comments (real-time updates without refresh)
- Delete own comments
- Comment count displayed
- Real-time refresh mechanism: useEffect watches refreshKey state and automatically reloads market data from S3

**Real-Time Features**:
- Comments display instantly after posting
- Likes update without page refresh
- Delete operations reflected immediately
- Market data reloaded when refreshKey changes

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

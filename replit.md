# Probalyze - Decentralized Prediction Markets

## Overview

Probalyze is a decentralized prediction market platform built on Solana, allowing users to trade on real-world event outcomes. The platform operates similarly to Polymarket, where users place bets on YES/NO outcomes with dynamic pricing based on market demand. The system uses a pooled betting model where all funds are collected in a platform wallet, and winners receive proportional payouts based on their share of the winning side.

The application features real-time market charts, portfolio tracking, leaderboards, and comprehensive admin controls for market creation and resolution. All market data and user balances are stored in S3-compatible storage (Supabase), with optional Turso database integration via Drizzle ORM.

## Recent Updates (November 28, 2025)

**Ultra-Robust Market Loading System - Fixed Intermittent Loading Failures:**
- Increased retry logic to **6 retries with exponential backoff** (200ms+ delays) - total ~12 seconds retry window
- Implemented **localStorage fallback cache** for when S3 is unavailable or timeouts occur
- When S3 download succeeds, data is automatically cached to localStorage as backup for future fallback
- If S3 fails after all retries, system uses cached data from localStorage seamlessly
- Applied to all storage operations: download, upload, list files
- **Improved error handling**: Instead of "No Markets Yet", shows proper error UI with retry button
- Distinguishes between **actual empty state** vs **connection errors** vs **loading state**
- Shows "Connection Issue" ⚠️ when network problem detected, with "Try Again" button
- Automatic retry notifications in logs show each attempt
- Markets now load reliably even with temporary network issues

**Gemini API Configuration Fixed:**
- Removed hardcoded invalid API key from Dashboard.tsx (was causing 400 errors)
- Updated geminiManager.ts and Dashboard.tsx to properly use environment variables
- API key now correctly loaded from GEMINI_API_KEY secret (exposed as VITE_GEMINI_API_KEY for browser)
- Fixed LSP errors by adding missing constants (ESTIMATED_APY, REWARD_PER_TASK)
- Verified: "🔍 Gemini API Key Status: ✅ Loaded" in browser logs
- Market description generation now works correctly with Gemini 2.5 Flash model

**TypeScript & Build Fixes:**
- Fixed MarketDetailView.tsx type errors using proper type assertion pattern
- Updated vite.config.ts to properly expose GEMINI_API_KEY to browser via define configuration

**Multi-Outcome Market UI Improvements:**
- "Trade Now" button now disabled on multi-outcome markets - shows "Select Candidate" tooltip
- Forces users to select a specific candidate before trading (prevents accidental wrong bets)
- Binary markets still show active "Trade Now" button as before
- Clear visual feedback: disabled button is grayed out with 50% opacity

**Early Exit Fee Implementation:**
- Early exit/sell positions now charge 2.5% fee (same as platform bet fee)
- Fee deducted from exit proceeds: user gets 97.5% of proportional pool value
- Exit fees tracked in platform stats (totalFees and last24hFees)
- User sees exit confirmation: "Exited position: X SOL (Y fee deducted)"
- Market's platformFeesCollected updated to include exit fees

## Previous Updates (November 27, 2025)

**AI Description Generator - Gemini Integration:**
- Admin panel now has "Generate" button (✨ wand icon) next to market description field
- Uses Google Gemini 2.5 Flash model to auto-generate compelling market descriptions
- Generates 2-3 sentence descriptions that are professional, realistic, and context-aware
- Button only enabled when market title is entered
- Secure environment variable handling using `VITE_GOOGLE_API_KEY` prefix (GitHub-safe)
- Gracefully handles missing API key without breaking the app

**Market Status Tags - "Open" vs "Closed":**
- Fixed misleading "Closed" tag on multi-outcome markets without a set closing time
- Markets without `closesAt` time now display "Open" instead of "Closed"
- "Closed" tag only shows when admin explicitly sets a closing time and it passes
- Applied to both MarketCard and MarketDetailView components
- Prevents confusion: users see market is actively trading, not closed

**Complete Multi-Outcome Trading Implementation:**
- YES/NO buttons on each candidate are fully tradable from both market cards AND detailed views
- Users can place trades directly from market cards (no need to navigate to details)
- Users can place multiple bets on different candidates in the same market
- BettingModal now accepts `outcomeId` parameter for multi-outcome trades
- `placeBet()` function updated to accept optional `outcomeId` and automatically routes to `placeBetOnOutcome()`
- App.tsx manages outcomeId state and passes it to BettingModal
- All trades save to S3 storage with proper outcomeId linking
- User balances update correctly after each trade

**Category Updates:**
- Removed "blockchain" category
- Added "AI" category (icon: 🤖)
- Categories now: crypto, politics, elections, sports, entertainment, technology, economy, finance, weather, science, esports, AI, other
- Admin can select from all 13 categories when creating markets
- Filters display all new categories

**Date Display Fixes:**
- Fixed resolve date showing 1/1/1970 in both MarketCard and MarketDetailView
- Proper fallback logic: shows custom timing note for TBD markets, custom note for flexible timing, or formatted date for fixed timing
- Validation added: only shows date if resolveTime > 0

**Chart & Trading Data:**
- Charts use real-time market pool data from actual bets
- Candlestick charts aggregate price movements realistically
- All bets persist in S3 storage with outcomeId associations
- User portfolio reflects all trades immediately
- Multi-outcome markets properly track individual outcome performance

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

**Chart Visualization**: Recharts library for rendering market price charts with area and candlestick views, including volume indicators and real-time price updates. Charts use actual bet data from the storage for realistic price movements.

**Multi-Outcome Markets**: MarketCard and MarketDetailView components now support:
- Displaying multiple candidates/outcomes in a grid
- Each outcome shows name, percentage, and clickable YES/NO buttons
- YES/NO buttons functional from both market card AND detailed view
- Full backward compatibility with binary (simple) markets
- Proper data persistence with outcomeId tracking

### Trading System

**Multi-Outcome Trading Flow**:
1. User clicks YES/NO on a candidate (from market card or detail view)
2. BettingModal opens with `outcomeId` parameter
3. `placeBet()` is called with outcomeId
4. System routes to `placeBetOnOutcome()` for multi-outcome processing
5. Bet is recorded with outcomeId linking
6. User balance updated in S3 storage
7. Market totals and pool percentages recalculated
8. UI updates immediately with new market state

**Binary Trading Flow** (unchanged):
1. User clicks YES/NO on a simple market
2. BettingModal opens without outcomeId
3. `placeBet()` handles as simple bet (no outcomeId)
4. Bet recorded with prediction only
5. Market totals updated
6. Storage persists changes

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
- `markets.json` - All market data including bets with outcomeId, prices, status, multi-outcome details
- `balances.json` - User balance tracking for deposits/withdrawals
- `platform-stats.json` - Global platform statistics
- `user-agreements.json` - Terms of service acceptance tracking
- `copy-trades.json` - Copy trading action history

**Bet Structure with Multi-Outcome Support**:
```typescript
interface Bet {
  id: string;
  walletAddress: string;
  amount: number; // net amount after platform fee
  prediction: 'yes' | 'no';
  timestamp: number;
  transactionSignature: string;
  platformFee: number;
  outcomeId?: string; // For multi-outcome markets
}
```

**Database Schema** (Drizzle + Turso): Optional relational database layer defined but not actively used in the current implementation. Schema includes:
- `users` table - Wallet addresses and balance tracking
- `markets` table - Market metadata and state
- `bets` table - Individual bet records
- `platform_stats` table - Aggregated statistics

**Rationale**: The JSON file approach provides simplicity and direct S3 compatibility, avoiding the need for database infrastructure. The outcomeId field enables proper multi-outcome market tracking without requiring schema changes.

### Market Resolution System

**Admin-Only Control**: Only the admin wallet (hardcoded address) can create and resolve markets.

**Market Types**:
- **Binary (Simple)**: YES/NO outcomes
- **Multi-Outcome**: Multiple candidates/options, each with YES/NO betting and independent price tracking

**Timing Types**:
- **Fixed**: Specific date/time (displays formatted date)
- **Flexible**: Date range with custom note (displays custom note or date fallback)
- **TBD**: To be determined (displays custom timing note or "TBD")

**Resolution Process**:
1. Admin selects winning outcome (YES/NO for binary, or winning outcome ID for multi-outcome)
2. System calculates winner payouts based on proportional pool distribution
3. For multi-outcome: only bettors who picked YES on the winning outcome receive payouts
4. Settlement fee deducted from winnings
5. User balances updated in storage
6. Market status changed to "resolved"

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

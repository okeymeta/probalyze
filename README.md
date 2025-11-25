# 📊 SolPredict - Decentralized Prediction Markets on Solana

A fully decentralized prediction market platform built on Solana, similar to Polymarket. Users can bet on real-world events using SOL, and the admin wallet resolves markets to distribute winnings.

## 🎯 Features

- **Decentralized Betting**: Place bets on YES/NO outcomes for real-world events
- **Admin-Controlled Markets**: Only the admin wallet can create and resolve markets
- **Transparent Pool System**: All bets go to the platform wallet, winners split the pool proportionally
- **Image Support**: Upload images for each market via Supabase Storage
- **Real-Time Updates**: Live market odds and user positions
- **Multiple Wallet Support**: Works with Phantom, Solflare, Backpack, and Brave wallets
- **Solana-Powered**: Fast, low-cost transactions on the Solana blockchain

## 🚀 Getting Started

### Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Solana Wallet**: Install [Phantom](https://phantom.app) or another Solana wallet
3. **Node.js/Bun**: Make sure you have Node.js or Bun installed

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd solana-prediction-market
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Set up Supabase**

   a. Create a new project at [app.supabase.com](https://app.supabase.com)
   
   b. Go to **Settings > API** and copy:
      - Project URL
      - Anon/Public Key
   
   c. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Configure Admin Wallet**

   Open `constants.ts` and update the admin wallet address:
   ```typescript
   export const ADMIN_WALLET_ADDRESS = 'YOUR_ADMIN_WALLET_ADDRESS';
   ```

5. **Start the development server**
```bash
npm run dev
# or
bun dev
```

## 📖 How It Works

### For Regular Users

1. **Connect Wallet**: Click "Connect Wallet & Start Trading" on the landing page
2. **Browse Markets**: View all active prediction markets
3. **Place Bets**: 
   - Click "Place Bet" on any active market
   - Choose YES or NO
   - Enter your bet amount (minimum 0.01 SOL)
   - Confirm the transaction in your wallet
4. **Track Positions**: See your bets and potential payouts on each market card
5. **Win Rewards**: If your prediction is correct, you'll receive a proportional share of the total pool

### For Admin Users

When connected with the admin wallet, you'll see additional controls:

1. **Create Markets**:
   - Click "Create New Market"
   - Enter market title and description
   - Upload an image (max 10MB)
   - Submit to create the market

2. **Resolve Markets**:
   - Click "Resolve Market" on any active market
   - Select the winning outcome (YES or NO)
   - Confirm to close the market
   - Winners are automatically calculated and displayed

## 🔧 Configuration

### Platform Settings (constants.ts)

```typescript
// Admin wallet - only this wallet can create/resolve markets
export const ADMIN_WALLET_ADDRESS = '...';

// Pool wallet - all bets are sent here
export const PLATFORM_WALLET_ADDRESS = new PublicKey('...');

// Minimum bet amount
export const MINIMUM_BET_AMOUNT = 0.01; // in SOL

// Platform fee (currently not implemented)
export const PLATFORM_FEE_PERCENTAGE = 2;
```

## 💰 How Payouts Work

1. **Pool System**: All bets go to the platform wallet address
2. **Resolution**: Admin selects the winning outcome (YES or NO)
3. **Calculation**: Winners receive proportional shares of the total pool
   - If you bet 10% of the winning side, you get 10% of the entire pool
4. **Distribution**: Payout amounts are calculated and logged (manual distribution currently)

### Example

**Market**: "Will Bitcoin reach $100k by 2024?"
- Total YES bets: 100 SOL (from 10 users)
- Total NO bets: 50 SOL (from 5 users)
- **Total Pool**: 150 SOL

If outcome is **YES**:
- User who bet 10 SOL on YES = (10/100) × 150 = 15 SOL payout
- User who bet 5 SOL on YES = (5/100) × 150 = 7.5 SOL payout

## 📂 Project Structure

```
src/
├── components/
│   ├── AdminPanel.tsx      # Market creation UI (admin only)
│   ├── MarketList.tsx      # Display all markets
│   ├── MarketCard.tsx      # Individual market display
│   ├── BettingModal.tsx    # Place bet UI
│   ├── ResolveModal.tsx    # Resolve market UI (admin only)
│   └── ...
├── lib/
│   ├── marketManager.ts    # Market CRUD operations
│   ├── storageManager.ts   # Supabase storage integration
│   └── supabase.ts         # Supabase client
├── types.ts                # TypeScript types
├── constants.ts            # Configuration constants
└── App.tsx                 # Main application component
```

## 🔐 Security Notes

- **Admin Control**: Only the wallet specified in `ADMIN_WALLET_ADDRESS` can create and resolve markets
- **On-Chain Transactions**: All bets are real Solana transactions sent to the platform wallet
- **Storage**: Market data is stored in Supabase Storage as JSON files
- **Images**: Market images are stored in Supabase Storage bucket

## 🐛 Troubleshooting

### "Supabase credentials not found"
- Make sure you've created a `.env` file with valid Supabase credentials
- Restart your development server after adding environment variables

### "Cannot verify destination account"
- Check that `PLATFORM_WALLET_ADDRESS` in `constants.ts` is a valid Solana address
- Make sure the wallet exists on the network you're using

### "Failed to save market"
- Verify Supabase storage buckets are created (they auto-initialize on first run)
- Check browser console for detailed error messages
- Ensure your Supabase project has sufficient storage quota

### Markets not loading
- Open browser console and check for errors
- Verify Supabase credentials are correct
- Check that storage buckets were created successfully

## 🚧 Future Enhancements

- [ ] Automated payout distribution via smart contracts
- [ ] Multi-outcome markets (more than YES/NO)
- [ ] Time-based market closures
- [ ] Platform fee collection
- [ ] Market categories and filtering
- [ ] User statistics and leaderboard
- [ ] Social sharing features
- [ ] Mobile app

## 📝 License

MIT License - feel free to use this project for your own prediction markets!

## ⚠️ Disclaimer

This is a demonstration project. Use at your own risk. Always verify smart contract code and test thoroughly before deploying to production with real funds.
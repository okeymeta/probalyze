import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  walletAddress: text('wallet_address').notNull().unique(),
  balance: real('balance').notNull().default(0),
  totalVolume: real('total_volume').notNull().default(0),
  totalWinnings: real('total_winnings').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const markets = sqliteTable('markets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  status: text('status').notNull().default('active'),
  totalYesAmount: real('total_yes_amount').notNull().default(0),
  totalNoAmount: real('total_no_amount').notNull().default(0),
  yesPrice: real('yes_price').notNull().default(0.5),
  noPrice: real('no_price').notNull().default(0.5),
  outcome: text('outcome'),
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at').notNull(),
  closesAt: text('closes_at'),
  resolvedAt: text('resolved_at'),
  category: text('category'),
  volume24h: real('volume_24h').notNull().default(0),
});

export const bets = sqliteTable('bets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  marketId: integer('market_id').notNull().references(() => markets.id),
  userWallet: text('user_wallet').notNull(),
  amount: real('amount').notNull(),
  prediction: text('prediction').notNull(),
  priceAtBet: real('price_at_bet').notNull(),
  potentialPayout: real('potential_payout').notNull(),
  actualPayout: real('actual_payout').notNull().default(0),
  platformFee: real('platform_fee').notNull(),
  transactionSignature: text('transaction_signature'),
  timestamp: text('timestamp').notNull(),
  isSettled: integer('is_settled', { mode: 'boolean' }).notNull().default(false),
});

export const platformStats = sqliteTable('platform_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  totalFeesCollected: real('total_fees_collected').notNull().default(0),
  totalVolume: real('total_volume').notNull().default(0),
  totalMarkets: integer('total_markets').notNull().default(0),
  totalUsers: integer('total_users').notNull().default(0),
  totalBets: integer('total_bets').notNull().default(0),
  poolBalance: real('pool_balance').notNull().default(0),
  lastUpdated: text('last_updated').notNull(),
});

export const marketChartData = sqliteTable('market_chart_data', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  marketId: integer('market_id').notNull().references(() => markets.id),
  timestamp: text('timestamp').notNull(),
  yesPrice: real('yes_price').notNull(),
  noPrice: real('no_price').notNull(),
  volume: real('volume').notNull().default(0),
});
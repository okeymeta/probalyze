import { Market, MarketData, Bet, PredictionOption, MarketStatus, ChartDataPoint, UserBalance, PlatformStats, MarketCategory, UserAgreement, CopyTradeAction, MarketType, TimingType, MarketOutcome, MarketNews, MarketComment, MarketRule } from '../types'
import { uploadJSONFile, downloadJSONFile } from './s3Storage'
import { ADMIN_WALLET_ADDRESS, PLATFORM_FEE_PERCENTAGE, SETTLEMENT_FEE_PERCENTAGE } from '../constants'

const MARKETS_FILE = 'markets.json'
const BALANCES_FILE = 'balances.json'
const PLATFORM_STATS_FILE = 'platform-stats.json'
const USER_AGREEMENTS_FILE = 'user-agreements.json'
const COPY_TRADES_FILE = 'copy-trades.json'

// Track if files have been initialized
let filesInitialized = false

// Initialize empty market data
const initializeMarketData = (): MarketData => ({
  markets: [],
  lastUpdated: Date.now()
})

// Default platform stats
const getDefaultPlatformStats = (): PlatformStats => ({
  totalVolume: 0,
  totalFees: 0,
  totalUsers: 0,
  activeMarkets: 0,
  totalPoolMoney: 0,
  last24hVolume: 0,
  last24hFees: 0
})

// Initialize all storage files if they don't exist
export const initializeStorageFiles = async (): Promise<void> => {
  if (filesInitialized) return
  
  try {
    // Check and create markets.json
    const markets = await downloadJSONFile(MARKETS_FILE)
    if (markets === null) {
      console.log('Creating initial markets.json file...')
      await uploadJSONFile(MARKETS_FILE, initializeMarketData())
    }

    // Check and create balances.json
    const balances = await downloadJSONFile(BALANCES_FILE)
    if (balances === null) {
      console.log('Creating initial balances.json file...')
      await uploadJSONFile(BALANCES_FILE, {})
    }

    // Check and create platform-stats.json
    const stats = await downloadJSONFile(PLATFORM_STATS_FILE)
    if (stats === null) {
      console.log('Creating initial platform-stats.json file...')
      await uploadJSONFile(PLATFORM_STATS_FILE, getDefaultPlatformStats())
    }

    // Check and create user-agreements.json
    const agreements = await downloadJSONFile(USER_AGREEMENTS_FILE)
    if (agreements === null) {
      console.log('Creating initial user-agreements.json file...')
      await uploadJSONFile(USER_AGREEMENTS_FILE, {})
    }

    // Check and create copy-trades.json
    const copyTrades = await downloadJSONFile(COPY_TRADES_FILE)
    if (copyTrades === null) {
      console.log('Creating initial copy-trades.json file...')
      await uploadJSONFile(COPY_TRADES_FILE, { trades: [] })
    }

    filesInitialized = true
    console.log('✅ All storage files initialized')
  } catch (err) {
    console.error('Error initializing storage files:', err)
  }
}

// Load all markets from storage
export const loadMarkets = async (): Promise<Market[]> => {
  try {
    // Ensure files are initialized
    if (!filesInitialized) {
      await initializeStorageFiles()
    }
    
    const data = await downloadJSONFile(MARKETS_FILE)
    if (!data || !data.markets) {
      return []
    }
    return data.markets
  } catch (err) {
    console.error('Error loading markets:', err)
    return []
  }
}

// Save markets to storage
export const saveMarkets = async (markets: Market[]): Promise<boolean> => {
  try {
    const marketData: MarketData = {
      markets,
      lastUpdated: Date.now()
    }
    const result = await uploadJSONFile(MARKETS_FILE, marketData)
    return result.error === null
  } catch (err) {
    console.error('Error saving markets:', err)
    return false
  }
}

// Load user balances
export const loadBalances = async (): Promise<Record<string, UserBalance>> => {
  try {
    // Ensure files are initialized
    if (!filesInitialized) {
      await initializeStorageFiles()
    }
    
    const data = await downloadJSONFile(BALANCES_FILE)
    return data || {}
  } catch (err) {
    console.error('Error loading balances:', err)
    return {}
  }
}

// Save user balances
export const saveBalances = async (balances: Record<string, UserBalance>): Promise<boolean> => {
  try {
    const result = await uploadJSONFile(BALANCES_FILE, balances)
    return result.error === null
  } catch (err) {
    console.error('Error saving balances:', err)
    return false
  }
}

// Get user balance
export const getUserBalance = async (walletAddress: string): Promise<UserBalance> => {
  const balances = await loadBalances()
  return balances[walletAddress] || {
    walletAddress,
    balance: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalWinnings: 0,
    lastUpdated: Date.now()
  }
}

// Update user balance
export const updateUserBalance = async (
  walletAddress: string,
  delta: number,
  type: 'deposit' | 'withdraw' | 'winning'
): Promise<boolean> => {
  try {
    const balances = await loadBalances()
    const userBalance = balances[walletAddress] || {
      walletAddress,
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalWinnings: 0,
      lastUpdated: Date.now()
    }

    userBalance.balance += delta
    
    if (type === 'deposit') {
      userBalance.totalDeposited += delta
    } else if (type === 'withdraw') {
      userBalance.totalWithdrawn += Math.abs(delta)
    } else if (type === 'winning') {
      userBalance.totalWinnings += delta
    }
    
    userBalance.lastUpdated = Date.now()
    balances[walletAddress] = userBalance

    return await saveBalances(balances)
  } catch (err) {
    console.error('Error updating balance:', err)
    return false
  }
}

// Load platform stats
export const loadPlatformStats = async (): Promise<PlatformStats> => {
  try {
    const data = await downloadJSONFile(PLATFORM_STATS_FILE)
    return data || getDefaultPlatformStats()
  } catch (err) {
    console.error('Error loading platform stats:', err)
    return getDefaultPlatformStats()
  }
}

// Save platform stats
export const savePlatformStats = async (stats: PlatformStats): Promise<boolean> => {
  try {
    const result = await uploadJSONFile(PLATFORM_STATS_FILE, stats)
    return result.error === null
  } catch (err) {
    console.error('Error saving platform stats:', err)
    return false
  }
}

// User Agreements
export const loadUserAgreements = async (): Promise<Record<string, UserAgreement>> => {
  try {
    const data = await downloadJSONFile(USER_AGREEMENTS_FILE)
    return data || {}
  } catch (err) {
    console.error('Error loading user agreements:', err)
    return {}
  }
}

export const saveUserAgreement = async (agreement: UserAgreement): Promise<boolean> => {
  try {
    const agreements = await loadUserAgreements()
    agreements[agreement.walletAddress] = agreement
    const result = await uploadJSONFile(USER_AGREEMENTS_FILE, agreements)
    return result.error === null
  } catch (err) {
    console.error('Error saving user agreement:', err)
    return false
  }
}

export const getUserAgreement = async (walletAddress: string): Promise<UserAgreement | null> => {
  const agreements = await loadUserAgreements()
  return agreements[walletAddress] || null
}

// Copy Trades
export const loadCopyTrades = async (): Promise<CopyTradeAction[]> => {
  try {
    const data = await downloadJSONFile(COPY_TRADES_FILE)
    return data?.trades || []
  } catch (err) {
    console.error('Error loading copy trades:', err)
    return []
  }
}

export const saveCopyTrade = async (copyTrade: CopyTradeAction): Promise<boolean> => {
  try {
    const trades = await loadCopyTrades()
    trades.push(copyTrade)
    const result = await uploadJSONFile(COPY_TRADES_FILE, { trades })
    return result.error === null
  } catch (err) {
    console.error('Error saving copy trade:', err)
    return false
  }
}

// Create market options for multi-outcome and simple markets
interface CreateMarketOptions {
  title: string;
  description: string;
  imageUrl: string;
  category: MarketCategory;
  marketType: MarketType;
  initialYesPrice: number;
  timingType: TimingType;
  closesAt?: number | null;
  resolveTime?: number | null;
  timingNote?: string;
  outcomes?: { name: string; imageUrl?: string }[];
  rules?: string[];
  adminWallet: string;
}

// Create a new market (admin only) - supports both simple and multi-outcome
export const createMarket = async (
  titleOrOptions: string | CreateMarketOptions,
  description?: string,
  imageUrl?: string,
  category?: MarketCategory,
  initialYesPrice?: number,
  closesAt?: number,
  resolveTime?: number,
  adminWallet?: string
): Promise<{ success: boolean; marketId?: string; error?: string }> => {
  let options: CreateMarketOptions;
  
  if (typeof titleOrOptions === 'string') {
    options = {
      title: titleOrOptions,
      description: description || '',
      imageUrl: imageUrl || '',
      category: category || 'other',
      marketType: 'simple',
      initialYesPrice: initialYesPrice || 0.5,
      timingType: 'fixed',
      closesAt: closesAt || null,
      resolveTime: resolveTime || null,
      adminWallet: adminWallet || ''
    };
  } else {
    options = titleOrOptions;
  }

  if (options.adminWallet !== ADMIN_WALLET_ADDRESS) {
    return { success: false, error: 'Unauthorized: Only admin can create markets' }
  }

  try {
    const markets = await loadMarkets()
    
    const marketOutcomes: MarketOutcome[] | undefined = options.marketType === 'multi-outcome' && options.outcomes
      ? options.outcomes.map((o, idx) => ({
          id: `outcome-${Date.now()}-${idx}-${Math.random().toString(36).substring(7)}`,
          name: o.name,
          imageUrl: o.imageUrl,
          totalYesAmount: 0,
          totalNoAmount: 0,
          yesPrice: options.initialYesPrice,
          noPrice: 1 - options.initialYesPrice,
          uniqueYesBettors: [],
          uniqueNoBettors: []
        }))
      : undefined;

    const marketRules: MarketRule[] = options.rules 
      ? options.rules.map((r, idx) => ({
          id: `rule-${Date.now()}-${idx}`,
          content: r,
          order: idx
        }))
      : [];
    
    const newMarket: Market = {
      id: `market-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      title: options.title,
      description: options.description,
      imageUrl: options.imageUrl,
      category: options.category,
      marketType: options.marketType,
      initialYesPrice: options.initialYesPrice,
      createdAt: Date.now(),
      closesAt: options.closesAt || null,
      resolveTime: options.resolveTime || null,
      timingType: options.timingType,
      timingNote: options.timingNote,
      resolvedAt: null,
      status: 'active',
      outcome: null,
      totalYesAmount: 0,
      totalNoAmount: 0,
      bets: [],
      createdBy: options.adminWallet,
      volume24h: 0,
      totalVolume: 0,
      platformFeesCollected: 0,
      uniqueYesBettors: [],
      uniqueNoBettors: [],
      outcomes: marketOutcomes,
      news: [],
      comments: [],
      rules: marketRules
    }

    markets.unshift(newMarket)
    const saved = await saveMarkets(markets)

    if (saved) {
      const stats = await loadPlatformStats()
      stats.activeMarkets = markets.filter(m => m.status === 'active').length
      await savePlatformStats(stats)

      return { success: true, marketId: newMarket.id }
    } else {
      return { success: false, error: 'Failed to save market' }
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Edit an existing market (admin only)
export const editMarket = async (
  marketId: string,
  updates: Partial<Pick<Market, 'title' | 'description' | 'imageUrl' | 'category' | 'closesAt' | 'resolveTime' | 'timingType' | 'timingNote'>>,
  adminWallet: string
): Promise<{ success: boolean; error?: string }> => {
  if (adminWallet !== ADMIN_WALLET_ADDRESS) {
    return { success: false, error: 'Unauthorized: Only admin can edit markets' }
  }

  try {
    const markets = await loadMarkets()
    const marketIndex = markets.findIndex(m => m.id === marketId)

    if (marketIndex === -1) {
      return { success: false, error: 'Market not found' }
    }

    const market = markets[marketIndex]
    
    Object.assign(market, updates, {
      lastEditedAt: Date.now(),
      lastEditedBy: adminWallet
    })

    const saved = await saveMarkets(markets)
    return saved ? { success: true } : { success: false, error: 'Failed to save changes' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Delete a market (admin only)
export const deleteMarket = async (
  marketId: string,
  adminWallet: string
): Promise<{ success: boolean; error?: string }> => {
  if (adminWallet !== ADMIN_WALLET_ADDRESS) {
    return { success: false, error: 'Unauthorized: Only admin can delete markets' }
  }

  try {
    const markets = await loadMarkets()
    const marketIndex = markets.findIndex(m => m.id === marketId)

    if (marketIndex === -1) {
      return { success: false, error: 'Market not found' }
    }

    const market = markets[marketIndex]
    
    if (market.bets.length > 0) {
      return { success: false, error: 'Cannot delete market with existing bets' }
    }

    markets.splice(marketIndex, 1)
    const saved = await saveMarkets(markets)

    if (saved) {
      const stats = await loadPlatformStats()
      stats.activeMarkets = markets.filter(m => m.status === 'active').length
      await savePlatformStats(stats)
      return { success: true }
    }
    return { success: false, error: 'Failed to delete market' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Add news to a market (admin only)
export const addMarketNews = async (
  marketId: string,
  content: string,
  link: string | undefined,
  adminWallet: string
): Promise<{ success: boolean; newsId?: string; error?: string }> => {
  if (adminWallet !== ADMIN_WALLET_ADDRESS) {
    return { success: false, error: 'Unauthorized: Only admin can post news' }
  }

  try {
    const markets = await loadMarkets()
    const market = markets.find(m => m.id === marketId)

    if (!market) {
      return { success: false, error: 'Market not found' }
    }

    const news: MarketNews = {
      id: `news-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      content,
      link,
      createdAt: Date.now(),
      createdBy: adminWallet
    }

    if (!market.news) market.news = []
    market.news.unshift(news)

    const saved = await saveMarkets(markets)
    return saved ? { success: true, newsId: news.id } : { success: false, error: 'Failed to save news' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Delete news from a market (admin only)
export const deleteMarketNews = async (
  marketId: string,
  newsId: string,
  adminWallet: string
): Promise<{ success: boolean; error?: string }> => {
  if (adminWallet !== ADMIN_WALLET_ADDRESS) {
    return { success: false, error: 'Unauthorized: Only admin can delete news' }
  }

  try {
    const markets = await loadMarkets()
    const market = markets.find(m => m.id === marketId)

    if (!market) {
      return { success: false, error: 'Market not found' }
    }

    if (!market.news) {
      return { success: false, error: 'News not found' }
    }

    const newsIndex = market.news.findIndex(n => n.id === newsId)
    if (newsIndex === -1) {
      return { success: false, error: 'News not found' }
    }

    market.news.splice(newsIndex, 1)
    const saved = await saveMarkets(markets)
    return saved ? { success: true } : { success: false, error: 'Failed to delete news' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Add comment to a market
export const addMarketComment = async (
  marketId: string,
  walletAddress: string,
  content: string,
  parentId?: string
): Promise<{ success: boolean; commentId?: string; error?: string }> => {
  try {
    const markets = await loadMarkets()
    const market = markets.find(m => m.id === marketId)

    if (!market) {
      return { success: false, error: 'Market not found' }
    }

    const comment: MarketComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      walletAddress,
      content,
      timestamp: Date.now(),
      likes: [],
      parentId
    }

    if (!market.comments) market.comments = []
    market.comments.push(comment)

    const saved = await saveMarkets(markets)
    return saved ? { success: true, commentId: comment.id } : { success: false, error: 'Failed to save comment' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Like/unlike a comment
export const toggleCommentLike = async (
  marketId: string,
  commentId: string,
  walletAddress: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const markets = await loadMarkets()
    const market = markets.find(m => m.id === marketId)

    if (!market || !market.comments) {
      return { success: false, error: 'Market or comments not found' }
    }

    const comment = market.comments.find(c => c.id === commentId)
    if (!comment) {
      return { success: false, error: 'Comment not found' }
    }

    // Initialize likes array if it doesn't exist
    if (!comment.likes || !Array.isArray(comment.likes)) {
      comment.likes = []
    }

    const likeIndex = comment.likes.indexOf(walletAddress)
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1)
    } else {
      comment.likes.push(walletAddress)
    }

    const saved = await saveMarkets(markets)
    return saved ? { success: true } : { success: false, error: 'Failed to update like' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Delete a comment (admin or comment author)
export const deleteMarketComment = async (
  marketId: string,
  commentId: string,
  walletAddress: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const markets = await loadMarkets()
    const market = markets.find(m => m.id === marketId)

    if (!market || !market.comments) {
      return { success: false, error: 'Market or comments not found' }
    }

    const commentIndex = market.comments.findIndex(c => c.id === commentId)
    if (commentIndex === -1) {
      return { success: false, error: 'Comment not found' }
    }

    const comment = market.comments[commentIndex]
    if (comment.walletAddress !== walletAddress && walletAddress !== ADMIN_WALLET_ADDRESS) {
      return { success: false, error: 'Unauthorized: Can only delete your own comments' }
    }

    market.comments.splice(commentIndex, 1)
    const saved = await saveMarkets(markets)
    return saved ? { success: true } : { success: false, error: 'Failed to delete comment' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Update market rules (admin only)
export const updateMarketRules = async (
  marketId: string,
  rules: string[],
  adminWallet: string
): Promise<{ success: boolean; error?: string }> => {
  if (adminWallet !== ADMIN_WALLET_ADDRESS) {
    return { success: false, error: 'Unauthorized: Only admin can update rules' }
  }

  try {
    const markets = await loadMarkets()
    const market = markets.find(m => m.id === marketId)

    if (!market) {
      return { success: false, error: 'Market not found' }
    }

    market.rules = rules.map((r, idx) => ({
      id: `rule-${Date.now()}-${idx}`,
      content: r,
      order: idx
    }))

    const saved = await saveMarkets(markets)
    return saved ? { success: true } : { success: false, error: 'Failed to update rules' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Add outcome to multi-outcome market (admin only)
export const addMarketOutcome = async (
  marketId: string,
  name: string,
  imageUrl: string | undefined,
  adminWallet: string
): Promise<{ success: boolean; outcomeId?: string; error?: string }> => {
  if (adminWallet !== ADMIN_WALLET_ADDRESS) {
    return { success: false, error: 'Unauthorized: Only admin can add outcomes' }
  }

  try {
    const markets = await loadMarkets()
    const market = markets.find(m => m.id === marketId)

    if (!market) {
      return { success: false, error: 'Market not found' }
    }

    if (market.marketType !== 'multi-outcome') {
      return { success: false, error: 'Can only add outcomes to multi-outcome markets' }
    }

    const outcome: MarketOutcome = {
      id: `outcome-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name,
      imageUrl,
      totalYesAmount: 0,
      totalNoAmount: 0,
      yesPrice: market.initialYesPrice,
      noPrice: 1 - market.initialYesPrice,
      uniqueYesBettors: [],
      uniqueNoBettors: []
    }

    if (!market.outcomes) market.outcomes = []
    market.outcomes.push(outcome)

    const saved = await saveMarkets(markets)
    return saved ? { success: true, outcomeId: outcome.id } : { success: false, error: 'Failed to add outcome' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Place bet on multi-outcome market
export const placeBetOnOutcome = async (
  marketId: string,
  outcomeId: string,
  walletAddress: string,
  amount: number,
  prediction: PredictionOption,
  transactionSignature: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const markets = await loadMarkets()
    const marketIndex = markets.findIndex(m => m.id === marketId)

    if (marketIndex === -1) {
      return { success: false, error: 'Market not found' }
    }

    const market = markets[marketIndex]

    if (market.status !== 'active') {
      return { success: false, error: 'Market is not active' }
    }

    if (market.closesAt && Date.now() >= market.closesAt) {
      market.status = 'closed'
      await saveMarkets(markets)
      return { success: false, error: 'Market has closed for betting' }
    }

    if (market.marketType !== 'multi-outcome' || !market.outcomes) {
      return { success: false, error: 'This is not a multi-outcome market' }
    }

    const outcome = market.outcomes.find(o => o.id === outcomeId)
    if (!outcome) {
      return { success: false, error: 'Outcome not found' }
    }

    const platformFee = amount * (PLATFORM_FEE_PERCENTAGE / 100)
    const netAmount = amount - platformFee

    const newBet: Bet = {
      id: `bet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      walletAddress,
      amount: netAmount,
      prediction,
      timestamp: Date.now(),
      transactionSignature,
      platformFee,
      outcomeId
    }

    market.bets.push(newBet)

    if (prediction === 'yes') {
      outcome.totalYesAmount += netAmount
      if (!outcome.uniqueYesBettors.includes(walletAddress)) {
        outcome.uniqueYesBettors.push(walletAddress)
      }
    } else {
      outcome.totalNoAmount += netAmount
      if (!outcome.uniqueNoBettors.includes(walletAddress)) {
        outcome.uniqueNoBettors.push(walletAddress)
      }
    }

    const totalOutcome = outcome.totalYesAmount + outcome.totalNoAmount
    if (totalOutcome > 0) {
      outcome.yesPrice = outcome.totalYesAmount / totalOutcome
      outcome.noPrice = outcome.totalNoAmount / totalOutcome
    }

    market.totalYesAmount += prediction === 'yes' ? netAmount : 0
    market.totalNoAmount += prediction === 'no' ? netAmount : 0
    market.volume24h += amount
    market.totalVolume = (market.totalVolume || 0) + amount
    market.platformFeesCollected += platformFee

    const saved = await saveMarkets(markets)

    if (saved) {
      await updateUserBalance(walletAddress, -amount, 'deposit')

      const stats = await loadPlatformStats()
      stats.totalVolume += amount
      stats.totalFees += platformFee
      stats.last24hVolume += amount
      stats.last24hFees += platformFee
      stats.totalPoolMoney += netAmount

      const allBets = markets.flatMap(m => m.bets)
      const uniqueUsers = new Set(allBets.map(b => b.walletAddress))
      stats.totalUsers = uniqueUsers.size

      await savePlatformStats(stats)

      return { success: true }
    } else {
      return { success: false, error: 'Failed to save bet' }
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Resolve multi-outcome market
export const resolveMultiOutcomeMarket = async (
  marketId: string,
  winningOutcomeId: string,
  adminWallet: string
): Promise<{ success: boolean; winners: { walletAddress: string; payout: number }[]; error?: string }> => {
  if (adminWallet !== ADMIN_WALLET_ADDRESS) {
    return { success: false, winners: [], error: 'Unauthorized: Only admin can resolve markets' }
  }

  try {
    const markets = await loadMarkets()
    const marketIndex = markets.findIndex(m => m.id === marketId)

    if (marketIndex === -1) {
      return { success: false, winners: [], error: 'Market not found' }
    }

    const market = markets[marketIndex]

    if (market.status === 'resolved') {
      return { success: false, winners: [], error: 'Market already resolved' }
    }

    if (market.marketType !== 'multi-outcome' || !market.outcomes) {
      return { success: false, winners: [], error: 'This is not a multi-outcome market' }
    }

    const winningOutcome = market.outcomes.find(o => o.id === winningOutcomeId)
    if (!winningOutcome) {
      return { success: false, winners: [], error: 'Winning outcome not found' }
    }

    market.status = 'resolved'
    market.resolvedAt = Date.now()
    market.winningOutcomeId = winningOutcomeId
    winningOutcome.isWinner = true

    const totalPool = market.bets
      .filter(b => b.outcomeId === winningOutcomeId)
      .reduce((sum, b) => sum + b.amount, 0)
    
    const winningBets = market.bets.filter(
      b => b.outcomeId === winningOutcomeId && b.prediction === 'yes'
    )

    const winners: { walletAddress: string; payout: number }[] = []
    let totalSettlementFees = 0

    if (winningBets.length > 0 && winningOutcome.totalYesAmount > 0) {
      const allOutcomePool = market.outcomes.reduce((sum, o) => 
        sum + o.totalYesAmount + o.totalNoAmount, 0
      )

      const betsByWallet = winningBets.reduce((acc, bet) => {
        if (!acc[bet.walletAddress]) acc[bet.walletAddress] = 0
        acc[bet.walletAddress] += bet.amount
        return acc
      }, {} as Record<string, number>)

      for (const [walletAddress, amount] of Object.entries(betsByWallet)) {
        const share = amount / winningOutcome.totalYesAmount
        const grossPayout = allOutcomePool * share
        const settlementFee = grossPayout * (SETTLEMENT_FEE_PERCENTAGE / 100)
        const netPayout = grossPayout - settlementFee

        totalSettlementFees += settlementFee
        winners.push({ walletAddress, payout: netPayout })

        await updateUserBalance(walletAddress, netPayout, 'winning')
      }
    }

    const saved = await saveMarkets(markets)

    if (saved) {
      const stats = await loadPlatformStats()
      stats.totalFees += totalSettlementFees
      stats.activeMarkets = markets.filter(m => m.status === 'active').length
      await savePlatformStats(stats)

      return { success: true, winners }
    } else {
      return { success: false, winners: [], error: 'Failed to save market resolution' }
    }
  } catch (err) {
    return { success: false, winners: [], error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Place a bet on a market (supports both simple and multi-outcome)
export const placeBet = async (
  marketId: string,
  walletAddress: string,
  amount: number,
  prediction: PredictionOption,
  transactionSignature: string,
  outcomeId?: string
): Promise<{ success: boolean; error?: string }> => {
  // If outcomeId is provided, route to multi-outcome bet handler
  if (outcomeId) {
    return placeBetOnOutcome(marketId, outcomeId, walletAddress, amount, prediction, transactionSignature)
  }

  try {
    const markets = await loadMarkets()
    const marketIndex = markets.findIndex(m => m.id === marketId)

    if (marketIndex === -1) {
      return { success: false, error: 'Market not found' }
    }

    const market = markets[marketIndex]

    if (market.status !== 'active') {
      return { success: false, error: 'Market is not active' }
    }

    // Check if market has closed for betting
    if (market.closesAt && Date.now() >= market.closesAt) {
      market.status = 'closed'
      await saveMarkets(markets)
      return { success: false, error: 'Market has closed for betting' }
    }

    // Calculate platform fee
    const platformFee = amount * (PLATFORM_FEE_PERCENTAGE / 100)
    const netAmount = amount - platformFee

    const newBet: Bet = {
      id: `bet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      walletAddress,
      amount: netAmount,
      prediction,
      timestamp: Date.now(),
      transactionSignature,
      platformFee
    }

    market.bets.push(newBet)

    // Update unique bettors
    if (prediction === 'yes' && !market.uniqueYesBettors.includes(walletAddress)) {
      market.uniqueYesBettors.push(walletAddress)
    } else if (prediction === 'no' && !market.uniqueNoBettors.includes(walletAddress)) {
      market.uniqueNoBettors.push(walletAddress)
    }

    if (prediction === 'yes') {
      market.totalYesAmount += netAmount
    } else {
      market.totalNoAmount += netAmount
    }

    market.volume24h += amount
    market.totalVolume = (market.totalVolume || 0) + amount
    market.platformFeesCollected += platformFee

    const saved = await saveMarkets(markets)

    if (saved) {
      await updateUserBalance(walletAddress, -amount, 'deposit')

      const stats = await loadPlatformStats()
      stats.totalVolume += amount
      stats.totalFees += platformFee
      stats.last24hVolume += amount
      stats.last24hFees += platformFee
      stats.totalPoolMoney += netAmount
      
      const allBets = markets.flatMap(m => m.bets)
      const uniqueUsers = new Set(allBets.map(b => b.walletAddress))
      stats.totalUsers = uniqueUsers.size

      await savePlatformStats(stats)

      return { success: true }
    } else {
      return { success: false, error: 'Failed to save bet' }
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Copy trade - copy another wallet's bet
export const copyTrade = async (
  marketId: string,
  copierWallet: string,
  targetWallet: string,
  transactionSignature: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const markets = await loadMarkets()
    const market = markets.find(m => m.id === marketId)

    if (!market) {
      return { success: false, error: 'Market not found' }
    }

    // Find target wallet's bets in this market
    const targetBets = market.bets.filter(b => b.walletAddress === targetWallet)
    
    if (targetBets.length === 0) {
      return { success: false, error: 'Target wallet has no bets in this market' }
    }

    // Calculate proportional amounts
    const targetYesAmount = targetBets.filter(b => b.prediction === 'yes').reduce((sum, b) => sum + b.amount, 0)
    const targetNoAmount = targetBets.filter(b => b.prediction === 'no').reduce((sum, b) => sum + b.amount, 0)
    const targetTotalAmount = targetYesAmount + targetNoAmount

    // Get copier's available balance (simplified - in real implementation check actual balance)
    const copierBalance = await getUserBalance(copierWallet)
    const copyAmount = Math.min(copierBalance.balance, targetTotalAmount)

    if (copyAmount <= 0) {
      return { success: false, error: 'Insufficient balance to copy trade' }
    }

    // Place proportional bets
    if (targetYesAmount > 0) {
      const yesAmount = (targetYesAmount / targetTotalAmount) * copyAmount
      const yesResult = await placeBet(marketId, copierWallet, yesAmount, 'yes', transactionSignature + '-yes')
      if (!yesResult.success) {
        return yesResult
      }
    }

    if (targetNoAmount > 0) {
      const noAmount = (targetNoAmount / targetTotalAmount) * copyAmount
      const noResult = await placeBet(marketId, copierWallet, noAmount, 'no', transactionSignature + '-no')
      if (!noResult.success) {
        return noResult
      }
    }

    // Log copy trade
    const copyTrade: CopyTradeAction = {
      id: `copy-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      copierWallet,
      targetWallet,
      marketId,
      amount: copyAmount,
      prediction: targetYesAmount >= targetNoAmount ? 'yes' : 'no',
      timestamp: Date.now(),
      transactionSignature
    }
    await saveCopyTrade(copyTrade)

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Close market (admin only) - separate from resolve
export const closeMarket = async (
  marketId: string,
  adminWallet: string
): Promise<{ success: boolean; error?: string }> => {
  if (adminWallet !== ADMIN_WALLET_ADDRESS) {
    return { success: false, error: 'Unauthorized: Only admin can close markets' }
  }

  try {
    const markets = await loadMarkets()
    const marketIndex = markets.findIndex(m => m.id === marketId)

    if (marketIndex === -1) {
      return { success: false, error: 'Market not found' }
    }

    const market = markets[marketIndex]

    if (market.status !== 'active') {
      return { success: false, error: 'Market is not active' }
    }

    market.status = 'closed'
    const saved = await saveMarkets(markets)

    if (saved) {
      const stats = await loadPlatformStats()
      stats.activeMarkets = markets.filter(m => m.status === 'active').length
      await savePlatformStats(stats)

      return { success: true }
    } else {
      return { success: false, error: 'Failed to close market' }
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Auto-refund system: Check for markets with single bettor after 78 hours
export const checkAndRefundSingleBettorMarkets = async (): Promise<{ refunded: string[] }> => {
  try {
    const markets = await loadMarkets()
    const refundedMarkets: string[] = []
    const REFUND_THRESHOLD = 78 * 60 * 60 * 1000 // 78 hours in milliseconds

    for (const market of markets) {
      if (market.status !== 'active') continue

      const timeSinceCreation = Date.now() - market.createdAt
      if (timeSinceCreation < REFUND_THRESHOLD) continue

      // Check if only one unique bettor
      const uniqueBettors = new Set(market.bets.map(b => b.walletAddress))
      if (uniqueBettors.size === 1 && market.bets.length > 0) {
        const bettorWallet = Array.from(uniqueBettors)[0]
        const totalBetAmount = market.bets.reduce((sum, bet) => sum + bet.amount, 0)

        // Refund the bettor
        await updateUserBalance(bettorWallet, totalBetAmount, 'winning')

        // Close the market
        market.status = 'closed'
        market.outcome = null
        refundedMarkets.push(market.id)

        console.log(`Auto-refunded market ${market.id} to ${bettorWallet}: ${totalBetAmount} SOL`)
      }
    }

    if (refundedMarkets.length > 0) {
      await saveMarkets(markets)
    }

    return { refunded: refundedMarkets }
  } catch (err) {
    console.error('Error in auto-refund check:', err)
    return { refunded: [] }
  }
}

// Resolve a market (admin only)
export const resolveMarket = async (
  marketId: string,
  outcome: PredictionOption,
  adminWallet: string
): Promise<{ success: boolean; winners: { walletAddress: string; payout: number }[]; error?: string }> => {
  if (adminWallet !== ADMIN_WALLET_ADDRESS) {
    return { success: false, winners: [], error: 'Unauthorized: Only admin can resolve markets' }
  }

  try {
    const markets = await loadMarkets()
    const marketIndex = markets.findIndex(m => m.id === marketId)

    if (marketIndex === -1) {
      return { success: false, winners: [], error: 'Market not found' }
    }

    const market = markets[marketIndex]

    if (market.status === 'resolved') {
      return { success: false, winners: [], error: 'Market already resolved' }
    }

    market.status = 'resolved'
    market.outcome = outcome
    market.resolvedAt = Date.now()

    // Calculate winners and payouts
    const totalPool = market.totalYesAmount + market.totalNoAmount
    const winningBets = market.bets.filter(bet => bet.prediction === outcome)
    const winningTotal = outcome === 'yes' ? market.totalYesAmount : market.totalNoAmount

    const winners: { walletAddress: string; payout: number }[] = []
    let totalSettlementFees = 0

    if (winningBets.length > 0 && winningTotal > 0) {
      // Group bets by wallet address
      const betsByWallet = winningBets.reduce((acc, bet) => {
        if (!acc[bet.walletAddress]) {
          acc[bet.walletAddress] = 0
        }
        acc[bet.walletAddress] += bet.amount
        return acc
      }, {} as Record<string, number>)

      // Calculate payouts proportionally with settlement fee
      for (const [walletAddress, amount] of Object.entries(betsByWallet)) {
        const share = amount / winningTotal
        const grossPayout = totalPool * share
        const settlementFee = grossPayout * (SETTLEMENT_FEE_PERCENTAGE / 100)
        const netPayout = grossPayout - settlementFee
        
        totalSettlementFees += settlementFee
        winners.push({ walletAddress, payout: netPayout })

        // Update user balance with winnings
        await updateUserBalance(walletAddress, netPayout, 'winning')
      }
    }

    const saved = await saveMarkets(markets)

    if (saved) {
      // Update platform stats
      const stats = await loadPlatformStats()
      stats.totalFees += totalSettlementFees
      stats.activeMarkets = markets.filter(m => m.status === 'active').length
      stats.totalPoolMoney -= totalPool // Remove resolved market from pool
      await savePlatformStats(stats)

      return { success: true, winners }
    } else {
      return { success: false, winners: [], error: 'Failed to save market resolution' }
    }
  } catch (err) {
    return { success: false, winners: [], error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Get market by ID
export const getMarketById = async (marketId: string): Promise<Market | null> => {
  try {
    const markets = await loadMarkets()
    return markets.find(m => m.id === marketId) || null
  } catch (err) {
    console.error('Error getting market:', err)
    return null
  }
}

// Get user's bets for a market
export const getUserBetsForMarket = (market: Market, walletAddress: string): Bet[] => {
  return market.bets.filter(bet => bet.walletAddress === walletAddress)
}

// Calculate potential payout for a bet
export const calculatePotentialPayout = (
  market: Market,
  betAmount: number,
  prediction: PredictionOption
): number => {
  const platformFee = betAmount * (PLATFORM_FEE_PERCENTAGE / 100)
  const netBetAmount = betAmount - platformFee

  const totalYes = market.totalYesAmount + (prediction === 'yes' ? netBetAmount : 0)
  const totalNo = market.totalNoAmount + (prediction === 'no' ? netBetAmount : 0)
  const totalPool = totalYes + totalNo

  let grossPayout = netBetAmount
  if (prediction === 'yes' && totalYes > 0) {
    grossPayout = (totalPool / totalYes) * netBetAmount
  } else if (prediction === 'no' && totalNo > 0) {
    grossPayout = (totalPool / totalNo) * netBetAmount
  }

  // Apply settlement fee
  const settlementFee = grossPayout * (SETTLEMENT_FEE_PERCENTAGE / 100)
  return grossPayout - settlementFee
}

// Generate chart data for a market
export const generateChartData = (market: Market): ChartDataPoint[] => {
  const dataPoints: ChartDataPoint[] = []
  const bets = [...market.bets].sort((a, b) => a.timestamp - b.timestamp)

  let cumulativeYes = 0
  let cumulativeNo = 0
  let cumulativeVolume = 0

  // Starting point with initial price
  dataPoints.push({
    timestamp: market.createdAt,
    yesPrice: market.initialYesPrice,
    noPrice: 1 - market.initialYesPrice,
    volume: 0
  })

  bets.forEach(bet => {
    if (bet.prediction === 'yes') {
      cumulativeYes += bet.amount
    } else {
      cumulativeNo += bet.amount
    }
    cumulativeVolume += bet.amount

    const total = cumulativeYes + cumulativeNo
    const yesPrice = total > 0 ? cumulativeYes / total : market.initialYesPrice
    const noPrice = total > 0 ? cumulativeNo / total : 1 - market.initialYesPrice

    dataPoints.push({
      timestamp: bet.timestamp,
      yesPrice,
      noPrice,
      volume: cumulativeVolume
    })
  })

  return dataPoints
}

// Get wallet's bets in a specific market (for copy trading)
export const getWalletBetsInMarket = (market: Market, walletAddress: string): Bet[] => {
  return market.bets.filter(b => b.walletAddress === walletAddress)
}

// Calculate price change percentage
export const calculatePriceChange = (market: Market): number => {
  if (market.bets.length === 0) return 0

  const currentYesPercentage = market.totalYesAmount + market.totalNoAmount > 0 
    ? (market.totalYesAmount / (market.totalYesAmount + market.totalNoAmount)) * 100 
    : market.initialYesPrice * 100

  const initialYesPercentage = market.initialYesPrice * 100
  
  return currentYesPercentage - initialYesPercentage
}

// Sell/exit a position early at current market price
export const sellPosition = async (
  marketId: string,
  betId: string,
  walletAddress: string
): Promise<{ success: boolean; exitValue: number; error?: string }> => {
  try {
    const markets = await loadMarkets()
    const market = markets.find(m => m.id === marketId)
    if (!market) return { success: false, exitValue: 0, error: 'Market not found' }

    const bet = market.bets.find(b => b.id === betId && b.walletAddress === walletAddress)
    if (!bet) return { success: false, exitValue: 0, error: 'Bet not found' }

    // Calculate current market value based on pool
    const totalPool = market.totalYesAmount + market.totalNoAmount
    if (totalPool === 0) return { success: false, exitValue: 0, error: 'No market liquidity' }

    const winningPool = bet.prediction === 'yes' ? market.totalYesAmount : market.totalNoAmount
    if (winningPool === 0) return { success: false, exitValue: 0, error: 'No liquidity for your side' }

    // Exit value = proportional share of pool
    const exitValue = (bet.amount / winningPool) * totalPool
    
    // Remove bet from market
    market.bets = market.bets.filter(b => b.id !== betId)
    market.totalYesAmount = bet.prediction === 'yes' ? market.totalYesAmount - bet.amount : market.totalYesAmount
    market.totalNoAmount = bet.prediction === 'no' ? market.totalNoAmount - bet.amount : market.totalNoAmount

    // Update user balance with exit proceeds
    await updateUserBalance(walletAddress, exitValue, 'withdraw')

    // Save updated market
    const saved = await saveMarkets(markets)
    if (saved) {
      return { success: true, exitValue }
    } else {
      return { success: false, exitValue: 0, error: 'Failed to save market' }
    }
  } catch (err) {
    return { success: false, exitValue: 0, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
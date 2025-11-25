import { Market, MarketData, Bet, PredictionOption, MarketStatus, ChartDataPoint, UserBalance, PlatformStats, MarketCategory, UserAgreement, CopyTradeAction } from '../types'
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

// Create a new market (admin only)
export const createMarket = async (
  title: string,
  description: string,
  imageUrl: string,
  category: MarketCategory,
  initialYesPrice: number,
  closesAt: number,
  resolveTime: number,
  adminWallet: string
): Promise<{ success: boolean; marketId?: string; error?: string }> => {
  if (adminWallet !== ADMIN_WALLET_ADDRESS) {
    return { success: false, error: 'Unauthorized: Only admin can create markets' }
  }

  try {
    const markets = await loadMarkets()
    
    const newMarket: Market = {
      id: `market-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      title,
      description,
      imageUrl,
      category,
      initialYesPrice,
      createdAt: Date.now(),
      closesAt,
      resolveTime,
      resolvedAt: null,
      status: 'active',
      outcome: null,
      totalYesAmount: 0,
      totalNoAmount: 0,
      bets: [],
      createdBy: adminWallet,
      volume24h: 0,
      platformFeesCollected: 0,
      uniqueYesBettors: [],
      uniqueNoBettors: []
    }

    markets.unshift(newMarket)
    const saved = await saveMarkets(markets)

    if (saved) {
      // Update platform stats
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

// Place a bet on a market
export const placeBet = async (
  marketId: string,
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
    market.platformFeesCollected += platformFee

    const saved = await saveMarkets(markets)

    if (saved) {
      // Update user balance
      await updateUserBalance(walletAddress, -amount, 'deposit')

      // Update platform stats
      const stats = await loadPlatformStats()
      stats.totalVolume += amount
      stats.totalFees += platformFee
      stats.last24hVolume += amount
      stats.last24hFees += platformFee
      stats.totalPoolMoney += netAmount
      
      // Count unique users
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
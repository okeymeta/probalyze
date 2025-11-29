import { Market, UserBalance } from '../types'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class CacheManager {
  private marketCache: Map<string, CacheEntry<Market[]>> = new Map()
  private balanceCache: Map<string, CacheEntry<Record<string, UserBalance>>> = new Map()
  private paginationState: Map<string, { page: number; pageSize: number; total: number }> = new Map()

  // Cache expiry times
  private MARKETS_CACHE_TTL = 30000 // 30 seconds for active markets
  private BALANCES_CACHE_TTL = 20000 // 20 seconds for user balances

  /**
   * Set markets cache with pagination support
   */
  setMarketsCache(key: string, markets: Market[], ttl?: number) {
    this.marketCache.set(key, {
      data: markets,
      timestamp: Date.now(),
      ttl: ttl || this.MARKETS_CACHE_TTL
    })
  }

  /**
   * Get cached markets if not expired
   */
  getMarketsCache(key: string): Market[] | null {
    const entry = this.marketCache.get(key)
    if (!entry) return null

    const age = Date.now() - entry.timestamp
    if (age > entry.ttl) {
      this.marketCache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set balances cache
   */
  setBalancesCache(key: string, balances: Record<string, UserBalance>, ttl?: number) {
    this.balanceCache.set(key, {
      data: balances,
      timestamp: Date.now(),
      ttl: ttl || this.BALANCES_CACHE_TTL
    })
  }

  /**
   * Get cached balances if not expired
   */
  getBalancesCache(key: string): Record<string, UserBalance> | null {
    const entry = this.balanceCache.get(key)
    if (!entry) return null

    const age = Date.now() - entry.timestamp
    if (age > entry.ttl) {
      this.balanceCache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Get paginated markets efficiently
   * Caches sorted markets and returns only requested page
   */
  getPaginatedMarkets(
    allMarkets: Market[],
    page: number = 1,
    pageSize: number = 20
  ): { markets: Market[]; total: number; pages: number } {
    const total = allMarkets.length
    const pages = Math.ceil(total / pageSize)
    const startIdx = (page - 1) * pageSize
    const endIdx = startIdx + pageSize

    return {
      markets: allMarkets.slice(startIdx, endIdx),
      total,
      pages
    }
  }

  /**
   * Get paginated and filtered markets
   */
  getFilteredPaginatedMarkets(
    allMarkets: Market[],
    filter: (market: Market) => boolean,
    page: number = 1,
    pageSize: number = 20
  ): { markets: Market[]; total: number; pages: number } {
    const filtered = allMarkets.filter(filter)
    const total = filtered.length
    const pages = Math.ceil(total / pageSize)
    const startIdx = (page - 1) * pageSize
    const endIdx = startIdx + pageSize

    return {
      markets: filtered.slice(startIdx, endIdx),
      total,
      pages
    }
  }

  /**
   * Cache pagination state
   */
  setPaginationState(key: string, page: number, pageSize: number, total: number) {
    this.paginationState.set(key, { page, pageSize, total })
  }

  /**
   * Get pagination state
   */
  getPaginationState(key: string) {
    return this.paginationState.get(key)
  }

  /**
   * Clear all caches
   */
  clearAll() {
    this.marketCache.clear()
    this.balanceCache.clear()
    this.paginationState.clear()
  }

  /**
   * Clear specific cache
   */
  clearMarkets(key?: string) {
    if (key) {
      this.marketCache.delete(key)
    } else {
      this.marketCache.clear()
    }
  }

  clearBalances(key?: string) {
    if (key) {
      this.balanceCache.delete(key)
    } else {
      this.balanceCache.clear()
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getStats() {
    return {
      marketsCached: this.marketCache.size,
      balancesCached: this.balanceCache.size,
      paginationStates: this.paginationState.size
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager()

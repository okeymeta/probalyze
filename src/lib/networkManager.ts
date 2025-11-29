/**
 * Network Manager - Handles Solana mainnet/testnet switching
 * Allows admin to test features on testnet before production
 * Preference saved in both localStorage (fast) and S3 (persistent across devices)
 */

import { uploadJSONFile, downloadJSONFile } from './s3Storage'

export type SolanaNetwork = 'mainnet' | 'testnet'

interface NetworkConfig {
  rpcEndpoint: string
  clusterName: string
}

interface NetworkPreference {
  network: SolanaNetwork
  lastUpdated: number
}

const NETWORKS: Record<SolanaNetwork, NetworkConfig> = {
  mainnet: {
    rpcEndpoint: 'https://solana-rpc.publicnode.com',
    clusterName: 'mainnet-beta'
  },
  testnet: {
    rpcEndpoint: 'https://solana-testnet-rpc.publicnode.com',
    clusterName: 'testnet'
  }
}

const NETWORK_STORAGE_KEY = 'probalyze_solana_network'
const NETWORK_S3_FILE = 'network-preference.json'

/**
 * Get current network (checks localStorage first for speed, then S3)
 */
export const getCurrentNetwork = (): SolanaNetwork => {
  if (typeof window === 'undefined') return 'mainnet'
  
  // Check localStorage first (instant)
  const stored = localStorage.getItem(NETWORK_STORAGE_KEY)
  if (stored === 'mainnet' || stored === 'testnet') {
    return stored
  }
  
  // Default to mainnet
  return 'mainnet'
}

/**
 * Load network preference from S3 (called on app startup)
 */
export const loadNetworkPreferenceFromS3 = async (): Promise<SolanaNetwork> => {
  try {
    const result = await downloadJSONFile(NETWORK_S3_FILE)
    if (result.data && result.data.network) {
      const network = result.data.network as SolanaNetwork
      // Update localStorage with S3 value
      localStorage.setItem(NETWORK_STORAGE_KEY, network)
      console.log(`📡 Loaded network preference from S3: ${network}`)
      return network
    }
  } catch (err) {
    console.log('Network preference not found in S3, using default')
  }
  return 'mainnet'
}

/**
 * Switch to a different network and save to both localStorage and S3
 */
export const switchNetwork = async (network: SolanaNetwork): Promise<void> => {
  // Update localStorage for instant UI response
  localStorage.setItem(NETWORK_STORAGE_KEY, network)
  console.log(`🔄 Switched to ${network}: ${NETWORKS[network].rpcEndpoint}`)
  
  // Save to S3 asynchronously
  try {
    const preference: NetworkPreference = {
      network,
      lastUpdated: Date.now()
    }
    await uploadJSONFile(NETWORK_S3_FILE, preference)
    console.log(`💾 Network preference saved to S3: ${network}`)
  } catch (err) {
    console.warn('Failed to save network preference to S3:', err)
    // Continue anyway - localStorage is still active
  }
  
  // Reload page to apply network change
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

/**
 * Get RPC endpoint for current network
 */
export const getRpcEndpoint = (): string => {
  const network = getCurrentNetwork()
  return NETWORKS[network].rpcEndpoint
}

/**
 * Get cluster name for current network
 */
export const getClusterName = (): string => {
  const network = getCurrentNetwork()
  return NETWORKS[network].clusterName
}

/**
 * Get all available networks
 */
export const getAvailableNetworks = (): Array<{ name: SolanaNetwork; label: string; endpoint: string }> => {
  return [
    { name: 'mainnet', label: 'Mainnet (Production)', endpoint: NETWORKS.mainnet.rpcEndpoint },
    { name: 'testnet', label: 'Testnet (Testing)', endpoint: NETWORKS.testnet.rpcEndpoint }
  ]
}

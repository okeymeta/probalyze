/**
 * Network Manager - Handles Solana mainnet/testnet switching
 * Allows admin to test features on testnet before production
 */

export type SolanaNetwork = 'mainnet' | 'testnet'

interface NetworkConfig {
  rpcEndpoint: string
  clusterName: string
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

/**
 * Get current network (defaults to mainnet)
 */
export const getCurrentNetwork = (): SolanaNetwork => {
  if (typeof window === 'undefined') return 'mainnet'
  
  const stored = localStorage.getItem(NETWORK_STORAGE_KEY)
  return (stored as SolanaNetwork) || 'mainnet'
}

/**
 * Switch to a different network
 */
export const switchNetwork = (network: SolanaNetwork): void => {
  localStorage.setItem(NETWORK_STORAGE_KEY, network)
  console.log(`🔄 Switched to ${network}: ${NETWORKS[network].rpcEndpoint}`)
  
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

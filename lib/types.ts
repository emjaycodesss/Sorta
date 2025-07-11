/**
 * TypeScript type definitions for the Sorta application
 * Central place for all custom TypeScript types
 */

// --- Wallet Types ---
export interface Wallet {
  id: string
  user_id: string
  wallet_address: string
  chain: 'BTC' | 'ETH' | 'SOL' | 'HYPE'
  name?: string
  created_at: string
}

// --- Wallet Group Types ---
export interface WalletGroup {
  id: string
  user_id: string
  name: string
  color: string // Hex color or Tailwind color class
  created_at: string
}

export interface WalletGroupMember {
  id: string
  wallet_id: string
  group_id: string
  created_at: string
}

// --- Extended Wallet with Groups ---
export interface WalletWithGroups extends Wallet {
  groups: WalletGroup[]
}

// --- Project Types ---
export interface Project {
  id: string
  user_id: string
  project_name: string
  chain: 'BTC' | 'ETH' | 'SOL' | 'HYPE'
  x_account?: string
  mint_datetime: string
  mint_price?: number
  supply?: number
  launchpad?: string
  whitelist_type: 'GTD' | 'FCFS'
  notes?: string
  status: 'Pending' | 'Minted' | 'Will Pass' | 'Delayed'
  created_at: string
}

// --- Form Types ---
export interface CreateWalletData {
  wallet_address: string
  chain: 'BTC' | 'ETH' | 'SOL' | 'HYPE'
  name?: string
  group_ids?: string[]
}

export interface UpdateWalletData {
  wallet_address?: string
  chain?: 'BTC' | 'ETH' | 'SOL' | 'HYPE'
  name?: string
  group_ids?: string[]
}

export interface CreateGroupData {
  name: string
  color: string
}

export interface UpdateGroupData {
  name?: string
  color?: string
} 
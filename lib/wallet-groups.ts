/**
 * Wallet Groups Database Operations
 * Handles CRUD operations for wallet groups and group memberships
 */
import { supabase } from './supabase'
import type { WalletGroup, WalletGroupMember, CreateGroupData, UpdateGroupData, CreateWalletData, UpdateWalletData, Wallet } from './types'

// --- Group CRUD Operations ---

/**
 * Fetch all wallet groups for the current user
 */
export async function getWalletGroups(userId: string): Promise<WalletGroup[]> {
  const { data, error } = await supabase
    .from('wallet_groups')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  if (error) {
    console.error('Error fetching wallet groups:', error)
    throw error
  }

  return data || []
}

/**
 * Create a new wallet group
 */
export async function createWalletGroup(userId: string, groupData: CreateGroupData): Promise<WalletGroup> {
  const { data, error } = await supabase
    .from('wallet_groups')
    .insert({
      user_id: userId,
      name: groupData.name,
      color: groupData.color
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating wallet group:', error)
    throw error
  }

  return data
}

/**
 * Update an existing wallet group
 */
export async function updateWalletGroup(groupId: string, groupData: UpdateGroupData): Promise<WalletGroup> {
  const { data, error } = await supabase
    .from('wallet_groups')
    .update(groupData)
    .eq('id', groupId)
    .select()
    .single()

  if (error) {
    console.error('Error updating wallet group:', error)
    throw error
  }

  return data
}

/**
 * Delete a wallet group and all its memberships
 */
export async function deleteWalletGroup(groupId: string): Promise<void> {
  // First delete all group memberships
  const { error: membershipError } = await supabase
    .from('wallet_group_members')
    .delete()
    .eq('group_id', groupId)

  if (membershipError) {
    console.error('Error deleting group memberships:', membershipError)
    throw membershipError
  }

  // Then delete the group
  const { error: groupError } = await supabase
    .from('wallet_groups')
    .delete()
    .eq('id', groupId)

  if (groupError) {
    console.error('Error deleting wallet group:', groupError)
    throw groupError
  }
}

// --- Wallet CRUD Operations ---

/**
 * Create a new wallet
 */
export async function createWallet(userId: string, walletData: CreateWalletData): Promise<Wallet> {
  const { data, error } = await supabase
    .from('wallets')
    .insert({
      user_id: userId,
      wallet_address: walletData.wallet_address,
      chain: walletData.chain,
      name: walletData.name
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating wallet:', error)
    throw error
  }

  // If groups are specified, create group memberships
  if (walletData.group_ids && walletData.group_ids.length > 0) {
    await updateWalletGroupMemberships(data.id, walletData.group_ids)
  }

  return data
}

/**
 * Update an existing wallet
 */
export async function updateWallet(walletId: string, walletData: UpdateWalletData): Promise<Wallet> {
  const { data, error } = await supabase
    .from('wallets')
    .update({
      wallet_address: walletData.wallet_address,
      chain: walletData.chain,
      name: walletData.name
    })
    .eq('id', walletId)
    .select()
    .single()

  if (error) {
    console.error('Error updating wallet:', error)
    throw error
  }

  // Update group memberships if specified
  if (walletData.group_ids !== undefined) {
    await updateWalletGroupMemberships(walletId, walletData.group_ids)
  }

  return data
}

/**
 * Delete a wallet and all its group memberships
 */
export async function deleteWallet(walletId: string): Promise<void> {
  // First delete all group memberships for this wallet
  const { error: membershipError } = await supabase
    .from('wallet_group_members')
    .delete()
    .eq('wallet_id', walletId)

  if (membershipError) {
    console.error('Error deleting wallet group memberships:', membershipError)
    throw membershipError
  }

  // Then delete the wallet
  const { error: walletError } = await supabase
    .from('wallets')
    .delete()
    .eq('id', walletId)

  if (walletError) {
    console.error('Error deleting wallet:', walletError)
    throw walletError
  }
}

/**
 * Get a single wallet with its group memberships
 */
export async function getWalletWithGroups(walletId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select(`
      *,
      wallet_group_members (
        wallet_groups (
          id,
          name,
          color
        )
      )
    `)
    .eq('id', walletId)
    .single()

  if (error) {
    console.error('Error fetching wallet with groups:', error)
    throw error
  }

  return data
}

// --- Group Membership Operations ---

/**
 * Get all group memberships for a wallet
 */
export async function getWalletGroupMemberships(walletId: string): Promise<WalletGroupMember[]> {
  const { data, error } = await supabase
    .from('wallet_group_members')
    .select('*')
    .eq('wallet_id', walletId)

  if (error) {
    console.error('Error fetching wallet group memberships:', error)
    throw error
  }

  return data || []
}

/**
 * Get all wallets with their group memberships
 */
export async function getWalletsWithGroups(userId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select(`
      *,
      wallet_group_members (
        wallet_groups (
          id,
          name,
          color
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching wallets with groups:', error)
    throw error
  }

  return data || []
}

/**
 * Update wallet group memberships
 * This replaces all existing memberships with the new ones
 */
export async function updateWalletGroupMemberships(walletId: string, groupIds: string[]): Promise<void> {
  // First delete all existing memberships for this wallet
  const { error: deleteError } = await supabase
    .from('wallet_group_members')
    .delete()
    .eq('wallet_id', walletId)

  if (deleteError) {
    console.error('Error deleting existing group memberships:', deleteError)
    throw deleteError
  }

  // If no groups to assign, we're done
  if (groupIds.length === 0) {
    return
  }

  // Insert new memberships
  const memberships = groupIds.map(groupId => ({
    wallet_id: walletId,
    group_id: groupId
  }))

  const { error: insertError } = await supabase
    .from('wallet_group_members')
    .insert(memberships)

  if (insertError) {
    console.error('Error creating group memberships:', insertError)
    throw insertError
  }
}

/**
 * Add a wallet to a group
 */
export async function addWalletToGroup(walletId: string, groupId: string): Promise<void> {
  const { error } = await supabase
    .from('wallet_group_members')
    .insert({
      wallet_id: walletId,
      group_id: groupId
    })

  if (error) {
    console.error('Error adding wallet to group:', error)
    throw error
  }
}

/**
 * Remove a wallet from a group
 */
export async function removeWalletFromGroup(walletId: string, groupId: string): Promise<void> {
  const { error } = await supabase
    .from('wallet_group_members')
    .delete()
    .eq('wallet_id', walletId)
    .eq('group_id', groupId)

  if (error) {
    console.error('Error removing wallet from group:', error)
    throw error
  }
} 
"use client"
/**
 * Wallets Page - Real Data Integration
 * Features: Controls, table with Wallet Name, Groups, Blockchain, Address, Actions
 * Now integrated with Supabase and wallet groups functionality
 */
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Wallet, Bitcoin, Coins, Zap, Copy, Edit, Trash2, Check } from "lucide-react"
import { toast } from "sonner"
import ManageGroupsDialog from "@/components/custom/ManageGroupsDialog"
import WalletForm from "@/components/custom/WalletForm"
import type { WalletWithGroups, WalletGroup } from "@/lib/types"
import { getWalletsWithGroups, getWalletGroups, deleteWallet } from "@/lib/wallet-groups"
import { createClient } from "@/lib/auth"

// --- Chain Configuration ---
const chainIcons = { BTC: Bitcoin, ETH: Zap, SOL: Coins, HYPE: Wallet }
const chainColors = { BTC: "bg-orange-100 text-orange-800", ETH: "bg-blue-100 text-blue-800", SOL: "bg-purple-100 text-purple-800", HYPE: "bg-green-100 text-green-800" }

function truncateAddress(address: string) {
  if (address.length <= 12) return address
  return address.slice(0, 6) + "..." + address.slice(-4)
}

export default function WalletsPage() {
  // --- State ---
  const [wallets, setWallets] = useState<WalletWithGroups[]>([])
  const [groups, setGroups] = useState<WalletGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [groupFilter, setGroupFilter] = useState<string>("")
  const [search, setSearch] = useState("")
  const [editingWallet, setEditingWallet] = useState<WalletWithGroups | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // --- Load User and Data ---
  useEffect(() => {
    async function loadUserAndData() {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error getting user:', error)
          toast.error("Authentication error")
          return
        }
        
        if (!user) {
          console.error('No user found')
          toast.error("Please sign in to access wallets")
          return
        }
        
        setUserId(user.id)
        await loadData(user.id)
      } catch (error) {
        console.error('Error loading user and data:', error)
        toast.error("Failed to load user data")
      }
    }
    
    loadUserAndData()
  }, [])

  async function loadData(userId: string) {
    try {
      setIsLoading(true)
      const [walletsData, groupsData] = await Promise.all([
        getWalletsWithGroups(userId),
        getWalletGroups(userId)
      ])
      // Transform the data to match our interface
      const transformedWallets: WalletWithGroups[] = walletsData.map((wallet: any) => ({
        id: wallet.id,
        user_id: wallet.user_id,
        wallet_address: wallet.wallet_address,
        chain: wallet.chain,
        name: wallet.name,
        created_at: wallet.created_at,
        groups: wallet.wallet_group_members?.map((member: any) => member.wallet_groups) || []
      }))
      setWallets(transformedWallets)
      setGroups(groupsData)
    } catch (error) {
      console.error('Error loading wallets:', error)
      toast.error("Failed to load wallets")
    } finally {
      setIsLoading(false)
    }
  }

  // --- Derived Data ---
  const filteredWallets = wallets.filter(w =>
    (!groupFilter || w.groups.some(g => g.id === groupFilter)) &&
    (w.name?.toLowerCase().includes(search.toLowerCase()) || 
     w.wallet_address.toLowerCase().includes(search.toLowerCase()))
  )

  // --- Handlers ---
  function handleCopy(address: string, id: string) {
    navigator.clipboard.writeText(address)
    setCopiedId(id)
    toast.success("Address copied!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleGroupsChange() {
    if (userId) {
      loadData(userId) // Reload data when groups change
    }
  }

  async function handleDeleteWallet(wallet: WalletWithGroups) {
    if (!confirm(`Are you sure you want to delete "${wallet.name || 'this wallet'}"? This action cannot be undone.`)) {
      return
    }
    try {
      await deleteWallet(wallet.id)
      toast.success("Wallet deleted successfully")
      if (userId) {
        loadData(userId)
      }
    } catch (error) {
      console.error('Error deleting wallet:', error)
      toast.error("Failed to delete wallet")
    }
  }

  function handleEditWallet(wallet: WalletWithGroups) {
    setEditingWallet(wallet)
    setIsEditDialogOpen(true)
  }

  // --- Render ---
  if (!userId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-2">Wallets</h1>

      {/* Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium">Filter by Group:</label>
          <select
            className="border rounded-md px-2 py-1 bg-background"
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
          >
            <option value="">All</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <Input
          placeholder="Search Wallets..."
          className="max-w-xs"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <ManageGroupsDialog userId={userId} onGroupsChange={handleGroupsChange} />
          <WalletForm userId={userId} onSave={() => userId && loadData(userId)} />
        </div>
      </div>

      {/* Wallets Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 py-3 text-left font-semibold">Wallet Name</th>
              <th className="px-3 py-3 text-left font-semibold">Groups</th>
              <th className="px-3 py-3 text-left font-semibold">Blockchain</th>
              <th className="px-3 py-3 text-left font-semibold">Address</th>
              <th className="px-3 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading wallets...</span>
                  </div>
                </td>
              </tr>
            ) : filteredWallets.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {search || groupFilter ? "No wallets found" : "No wallets yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {search || groupFilter 
                      ? "Try adjusting your search or filters"
                      : "Add your first crypto wallet to get started"
                    }
                  </p>
                  {!search && !groupFilter && (
                    <WalletForm userId={userId} onSave={() => userId && loadData(userId)} />
                  )}
                </td>
              </tr>
            ) : (
              filteredWallets.map((wallet) => {
                const ChainIcon = chainIcons[wallet.chain as keyof typeof chainIcons] || Wallet
                return (
                  <tr key={wallet.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    {/* Wallet Name */}
                    <td className="px-3 py-2 font-medium">{wallet.name || "Unnamed Wallet"}</td>
                    {/* Groups */}
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {wallet.groups.length === 0 && <span className="text-xs text-muted-foreground">-</span>}
                        {wallet.groups.map((group) => (
                          <Badge key={group.id} className={group.color}>
                            {group.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    {/* Blockchain */}
                    <td className="px-3 py-2 flex items-center gap-2">
                      <ChainIcon className={`h-5 w-5 ${chainColors[wallet.chain as keyof typeof chainColors] || ""}`} />
                      <span>{wallet.chain}</span>
                    </td>
                    {/* Address */}
                    <td className="px-3 py-2 font-mono">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-pointer underline decoration-dotted">{truncateAddress(wallet.wallet_address)}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>{wallet.wallet_address}</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    {/* Actions */}
                    <td className="px-3 py-2 flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => handleCopy(wallet.wallet_address, wallet.id)} aria-label="Copy address">
                              {copiedId === wallet.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy Address</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => handleEditWallet(wallet)} aria-label="Edit wallet">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteWallet(wallet)} aria-label="Delete wallet">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Wallet Dialog */}
      {editingWallet && (
        <WalletForm 
          userId={userId} 
          wallet={editingWallet}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={() => {
            if (userId) {
              loadData(userId)
            }
            setEditingWallet(null)
            setIsEditDialogOpen(false)
          }}
          trigger={<div style={{ display: 'none' }} />}
        />
      )}
    </div>
  )
} 
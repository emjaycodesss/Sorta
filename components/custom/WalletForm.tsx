"use client"
/**
 * Wallet Form Component
 * Handles adding and editing wallets with group selection
 */
import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import type { Wallet, WalletGroup, CreateWalletData, UpdateWalletData } from "@/lib/types"
import { getWalletGroups, createWallet, updateWallet, getWalletWithGroups } from "@/lib/wallet-groups"

interface WalletFormProps {
  userId: string
  wallet?: Wallet // If provided, we're editing; otherwise creating
  onSave?: () => void
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function WalletForm({ userId, wallet, onSave, trigger, open, onOpenChange }: WalletFormProps) {
  // --- State ---
  const [isOpen, setIsOpen] = useState(false)
  
  // Use controlled state if open/onOpenChange are provided
  const isDialogOpen = open !== undefined ? open : isOpen
  const setIsDialogOpen = onOpenChange || setIsOpen
  const [isLoading, setIsLoading] = useState(false)
  const [groups, setGroups] = useState<WalletGroup[]>([])
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
  
  // --- Form Data ---
  const [formData, setFormData] = useState({
    wallet_address: "",
    chain: "ETH" as const,
    name: ""
  })

  // --- Load Groups ---
  useEffect(() => {
    if (isDialogOpen) {
      loadGroups()
    }
  }, [isDialogOpen, userId])

  // --- Initialize Form ---
  useEffect(() => {
    if (wallet && isDialogOpen) {
      setFormData({
        wallet_address: wallet.wallet_address,
        chain: wallet.chain,
        name: wallet.name || ""
      })
      // Load existing group memberships
      loadWalletGroups(wallet.id)
    } else if (isDialogOpen) {
      setFormData({
        wallet_address: "",
        chain: "ETH",
        name: ""
      })
      setSelectedGroupIds([])
    }
  }, [wallet, isDialogOpen])

  async function loadWalletGroups(walletId: string) {
    try {
      const walletData = await getWalletWithGroups(walletId)
      const groupIds = walletData.wallet_group_members?.map((member: any) => member.wallet_groups.id) || []
      setSelectedGroupIds(groupIds)
    } catch (error) {
      console.error('Error loading wallet groups:', error)
      setSelectedGroupIds([])
    }
  }

  async function loadGroups() {
    try {
      const groupsData = await getWalletGroups(userId)
      setGroups(groupsData)
    } catch (error) {
      console.error('Error loading groups:', error)
      toast.error("Failed to load groups")
    }
  }

  // --- Form Handlers ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.wallet_address.trim()) {
      toast.error("Wallet address is required")
      return
    }

    try {
      setIsLoading(true)
      
      if (wallet) {
        // Update existing wallet
        await updateWallet(wallet.id, {
          wallet_address: formData.wallet_address,
          chain: formData.chain,
          name: formData.name,
          group_ids: selectedGroupIds
        })
        toast.success("Wallet updated successfully")
      } else {
        // Create new wallet
        await createWallet(userId, {
          wallet_address: formData.wallet_address,
          chain: formData.chain,
          name: formData.name,
          group_ids: selectedGroupIds
        })
        toast.success("Wallet created successfully")
      }
      
      setIsDialogOpen(false)
      onSave?.()
    } catch (error) {
      console.error('Error saving wallet:', error)
      toast.error(wallet ? "Failed to update wallet" : "Failed to create wallet")
    } finally {
      setIsLoading(false)
    }
  }

  function handleGroupToggle(groupId: string) {
    setSelectedGroupIds(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  function handleClose() {
    setIsDialogOpen(false)
    setFormData({
      wallet_address: "",
      chain: "ETH",
      name: ""
    })
    setSelectedGroupIds([])
  }

  // --- Render ---
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{wallet ? "Edit Wallet" : "Add New Wallet"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Wallet Address */}
          <div className="space-y-2">
            <Label htmlFor="wallet_address">Wallet Address</Label>
            <Input
              id="wallet_address"
              value={formData.wallet_address}
              onChange={e => setFormData(prev => ({ ...prev, wallet_address: e.target.value }))}
              placeholder="Enter wallet address..."
              required
            />
          </div>

          {/* Chain Selection */}
          <div className="space-y-2">
            <Label htmlFor="chain">Blockchain</Label>
            <Select
              value={formData.chain}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, chain: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                <SelectItem value="SOL">Solana (SOL)</SelectItem>
                <SelectItem value="HYPE">Hype</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Wallet Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Wallet Name (Optional)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter a name for this wallet..."
            />
          </div>

          {/* Group Selection */}
          <div className="space-y-2">
            <Label>Groups</Label>
            {groups.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/30">
                No groups created yet. Create groups to organize your wallets.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {groups.map(group => (
                    <TooltipProvider key={group.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleGroupToggle(group.id)}
                            className={`px-3 py-1 rounded-full border-2 transition-all ${
                              selectedGroupIds.includes(group.id)
                                ? 'border-foreground scale-105'
                                : 'border-border hover:border-foreground/50'
                            }`}
                          >
                            <Badge className={group.color}>
                              {group.name}
                            </Badge>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {selectedGroupIds.includes(group.id) ? "Remove from group" : "Add to group"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
                {selectedGroupIds.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Selected: {selectedGroupIds.length} group{selectedGroupIds.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : (wallet ? "Update Wallet" : "Add Wallet")}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
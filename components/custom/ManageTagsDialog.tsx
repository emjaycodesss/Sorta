"use client"

import React, { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Try to import DialogDescription, fallback to null if not available
let DialogDescription: any = null
try {
  const dialogModule = require("@/components/ui/dialog")
  DialogDescription = dialogModule.DialogDescription
} catch (error) {
  console.warn("DialogDescription not available, using fallback")
}
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Plus, Search, Trash2, Users } from "lucide-react"
import { toast } from "sonner"
import { getWalletTags, createWalletTag, updateWalletTag, deleteWalletTag, getWalletsWithTags, syncTagWalletMemberships } from "@/lib/wallet-tags"
import { createBrowserClient } from "@/lib/auth"
import type { WalletTag, WalletWithTags } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import DeleteTagDialog from "@/components/custom/DeleteTagDialog"

// --- Types ---
interface TagWithMemberCount extends WalletTag {
  memberCount: number
}

interface ManageTagsDialogProps {
  userId: string
  onTagsChange: () => void
}

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const aSorted = [...a].sort()
  const bSorted = [...b].sort()
  return aSorted.every((v, i) => v === bSorted[i])
}

// --- Wallet List Item Component ---
interface WalletListItemProps {
  wallet: WalletWithTags;
  isLast: boolean;
  selectedWalletIds: string[];
  handleWalletToggle: (id: string) => void;
  wallets: WalletWithTags[];
}

function WalletListItem({ wallet, isLast, selectedWalletIds, handleWalletToggle, wallets }: WalletListItemProps) {
  // Fallback name logic
  let fallbackName = "Unnamed Wallet";
  if (!wallet.name || wallet.name.trim() === "") {
    const sameChainWallets = wallets.filter((w) => w.chain === wallet.chain);
    const idx = sameChainWallets.findIndex((w) => w.id === wallet.id);
    fallbackName = `${wallet.chain} Wallet ${idx + 1}`;
  }
  const displayName = wallet.name?.trim() || fallbackName;
  const truncatedAddress =
    wallet.wallet_address.length > 12
      ? `${wallet.wallet_address.slice(0, 6)}...${wallet.wallet_address.slice(-4)}`
      : wallet.wallet_address;

  return (
    <div
      className={`flex items-center justify-between py-3 px-2 ${!isLast ? "border-b" : ""}`}
    >
      <Checkbox
        checked={selectedWalletIds.includes(wallet.id)}
        onCheckedChange={() => handleWalletToggle(wallet.id)}
        aria-label={`Select wallet ${displayName}`}
      />
      <div className="flex-1 min-w-0 mx-3">
        <div className="font-medium text-sm truncate">{displayName}</div>
        <div className="text-xs text-muted-foreground font-mono truncate">
          {truncatedAddress}
        </div>
      </div>
      <div className="flex-shrink-0">
        <span className="text-xs px-2 py-1 rounded bg-muted">{wallet.chain}</span>
      </div>
    </div>
  );
}

// Context to provide all wallets to WalletListItem for fallback naming
const WalletListContext = React.createContext<WalletWithTags[] | null>(null)

export default function ManageTagsDialog({ userId, onTagsChange }: ManageTagsDialogProps) {
  // --- State Management ---
  const [isOpen, setIsOpen] = useState(false)
  const [tags, setTags] = useState<TagWithMemberCount[]>([])
  const [wallets, setWallets] = useState<WalletWithTags[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Master-Detail State
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [isCreateMode, setIsCreateMode] = useState(false)
  
  // Form State
  const [tagName, setTagName] = useState("")
  const [selectedWalletIds, setSelectedWalletIds] = useState<string[]>([])
  const [walletSearchTerm, setWalletSearchTerm] = useState("")

  // --- Smart Save Button: Track initial state ---
  const [initialState, setInitialState] = useState<{ name: string; walletIds: string[] }>({
    name: "",
    walletIds: [],
  })

  // --- Delete Tag Dialog State ---
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // --- Data Loading ---
  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  // --- Filtered Tags ---
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // --- Current Tag Data ---
  const currentTag = selectedTagId ? tags.find(t => t.id === selectedTagId) : null
  const isEditing = selectedTagId && !isCreateMode

  // --- Wallet Selection Logic ---
  const filteredWallets = wallets.filter(wallet =>
    wallet.name?.toLowerCase().includes(walletSearchTerm.toLowerCase()) ||
    wallet.wallet_address.toLowerCase().includes(walletSearchTerm.toLowerCase())
  )

  // Auto-sorting smart list: selected wallets first, then unselected
  const selectedWallets = filteredWallets.filter(w => selectedWalletIds.includes(w.id))
  const unselectedWallets = filteredWallets.filter(w => !selectedWalletIds.includes(w.id))
  const hasSelected = selectedWallets.length > 0
  const hasUnselected = unselectedWallets.length > 0

  // --- Select All Logic ---
  const allVisibleWalletIds = filteredWallets.map(w => w.id)
  const allSelected = allVisibleWalletIds.length > 0 && allVisibleWalletIds.every(id => selectedWalletIds.includes(id))
  const someSelected = selectedWalletIds.length > 0 && !allSelected

  // --- Indeterminate ref for Checkbox ---
  const selectAllRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    if (selectAllRef.current) {
      const input = selectAllRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement | null
      if (input) input.indeterminate = someSelected
    }
  }, [someSelected])

  async function loadData() {
    setIsLoading(true)
    try {
      const [tagsData, walletsData] = await Promise.all([
        getWalletTags(userId),
        getWalletsWithTags(userId)
      ])

      // Transform wallets data to match expected structure
      const transformedWallets = walletsData.map((wallet: any) => {
        // Extract tags from the nested structure
        const tags = wallet.wallet_tag_associations?.map((member: any) => member.wallet_tags).filter(Boolean) || []
        
        return {
          id: wallet.id,
          user_id: wallet.user_id,
          wallet_address: wallet.wallet_address,
          chain: wallet.chain,
          name: wallet.name,
          created_at: wallet.created_at,
          tags: tags
        }
      })

      // Transform tags to include member count
      const tagsWithCounts: TagWithMemberCount[] = tagsData.map(tag => {
        const memberCount = transformedWallets.filter(wallet => 
          wallet.tags && wallet.tags.some((t: any) => t.id === tag.id)
        ).length
        return { ...tag, memberCount }
      })

      setTags(tagsWithCounts)
      setWallets(transformedWallets)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error("Failed to load tags and wallets")
    } finally {
      setIsLoading(false)
    }
  }

  // --- Handlers ---
  function handleTagSelect(tagId: string | null) {
    setSelectedTagId(tagId)
    setIsCreateMode(false)
    
    if (tagId) {
      const tag = tags.find(t => t.id === tagId)
      if (tag) {
        setTagName(tag.name)
        
        // Load selected wallets for this tag
        const tagWallets = wallets.filter(wallet =>
          wallet.tags && wallet.tags.some((t: any) => t.id === tagId)
        )
        setSelectedWalletIds(tagWallets.map(w => w.id))
      }
    } else {
      resetForm()
    }
  }

  function handleCreateNew() {
    setSelectedTagId(null)
    setIsCreateMode(true)
    resetForm()
  }

  function resetForm() {
    setTagName("")
    setSelectedWalletIds([])
  }

  async function handleSaveTag() {
    if (!tagName.trim()) {
      toast.error("Tag name is required")
      return
    }

    setIsLoading(true)
    try {
      if (isCreateMode) {
        // Create new tag
        const newTag = await createWalletTag(userId, {
          name: tagName.trim(),
          color: "" // Empty color since we removed the feature
        })
        
        // Add selected wallets to the new tag
        if (selectedWalletIds.length > 0) {
          await syncTagWalletMemberships(newTag.id, selectedWalletIds)
        }
        
        toast.success("Tag created successfully")
        handleTagSelect(newTag.id)
      } else if (selectedTagId) {
        // Update existing tag
        await updateWalletTag(selectedTagId, {
          name: tagName.trim(),
          color: "" // Empty color since we removed the feature
        })
        
        // Update tag memberships
        await syncTagWalletMemberships(selectedTagId, selectedWalletIds)
        
        toast.success("Tag updated successfully")
      }
      
      await loadData() // Refresh data
      onTagsChange()
    } catch (error) {
      console.error('Error saving tag:', error)
      toast.error("Failed to save tag")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteTag() {
    setShowDeleteDialog(true)
  }

  async function handleConfirmDeleteTag() {
    if (!selectedTagId) return
    const tag = tags.find(t => t.id === selectedTagId)
    if (!tag) return
    setDeleteLoading(true)
    try {
      await deleteWalletTag(selectedTagId)
      toast.success("Tag deleted successfully")
      handleTagSelect(null)
      await loadData()
      onTagsChange()
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast.error("Failed to delete tag")
    } finally {
      setDeleteLoading(false)
    }
  }

  function handleWalletToggle(walletId: string) {
    setSelectedWalletIds(prev => 
      prev.includes(walletId) 
        ? prev.filter(id => id !== walletId)
        : [...prev, walletId]
    )
  }

  function handleSelectAll() {
    if (allSelected) {
      setSelectedWalletIds(selectedWalletIds.filter(id => !allVisibleWalletIds.includes(id)))
    } else {
      setSelectedWalletIds(Array.from(new Set([...selectedWalletIds, ...allVisibleWalletIds])))
    }
  }

  // --- Smart Save Button Logic ---
  useEffect(() => {
    if (selectedTagId || isCreateMode) {
      setInitialState({
        name: tagName,
        walletIds: [...selectedWalletIds]
      })
    }
  }, [selectedTagId, isCreateMode])

  const hasChanges = 
    tagName !== initialState.name ||
    !arraysEqual(selectedWalletIds, initialState.walletIds)

  // --- Render ---
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Manage Tags
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[1000px] min-w-[800px] h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            {DialogDescription && (
              <DialogDescription>
                Create, edit, and organize your wallet tags. Assign wallets to tags for better organization.
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex flex-1 gap-6 min-h-0">
            {/* Left Pane: Tag List */}
            <div className="w-1/3 flex flex-col border-r pr-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tags</h3>
                <Button size="sm" onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Tag
                </Button>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tag-search"
                  name="tag-search"
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {filteredTags.map(tag => (
                    <div
                      key={tag.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTagId === tag.id
                          ? "bg-accent border-accent-foreground"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => handleTagSelect(tag.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{tag.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {tag.memberCount} wallet{tag.memberCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Right Pane: Tag Details */}
            <div className="flex-1 flex flex-col min-h-0">
              {selectedTagId || isCreateMode ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">
                      {isCreateMode ? "Create New Tag" : `Edit Tag: ${currentTag?.name}`}
                    </h3>
                    {isEditing && (
                      <Button variant="destructive" size="sm" onClick={handleDeleteTag}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Tag
                      </Button>
                    )}
                  </div>

                  {/* Tag Name Section */}
                  <div className="space-y-4 mb-8">
                    <div>
                      <Label htmlFor="tag-name">Tag Name</Label>
                      <Input
                        id="tag-name"
                        value={tagName}
                        onChange={(e) => setTagName(e.target.value)}
                        placeholder="Enter tag name..."
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Card>
                    <CardHeader className="space-y-4">
                      <CardTitle className="flex items-center justify-between">
                        <span>Tagged Wallets</span>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            ref={selectAllRef}
                            checked={allSelected}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all wallets"
                          />
                          <span className="text-sm text-muted-foreground">
                            Select All ({filteredWallets.length})
                          </span>
                        </div>
                      </CardTitle>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="wallet-search-tags"
                          name="wallet-search-tags"
                          placeholder="Search wallets..."
                          value={walletSearchTerm}
                          onChange={(e) => setWalletSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="max-h-64">
                        {filteredWallets.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            No wallets found.
                          </div>
                        ) : (
                          filteredWallets.map((wallet, idx) => (
                            <WalletListItem
                              key={wallet.id}
                              wallet={wallet}
                              isLast={idx === filteredWallets.length - 1}
                              selectedWalletIds={selectedWalletIds}
                              handleWalletToggle={handleWalletToggle}
                              wallets={wallets}
                            />
                          ))
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t mt-4">
                    <Button 
                      onClick={handleSaveTag}
                      disabled={!hasChanges || isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Select a Tag</h3>
                    <p>Choose a tag from the list to edit its details and manage wallet memberships.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Dialog */}
      <DeleteTagDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        tag={currentTag ? { ...currentTag, user_id: currentTag.user_id || '', color: currentTag.color || '', created_at: currentTag.created_at || '' } : { id: '', name: '', user_id: '', color: '', created_at: '' }}
        wallets={currentTag ? wallets.filter(wallet => 
          wallet.tags && wallet.tags.some((t: any) => t.id === currentTag.id)
        ) : []}
        onDelete={handleConfirmDeleteTag}
        loading={deleteLoading}
      />
    </>
  )
} 
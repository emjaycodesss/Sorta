"use client"
/**
 * Manage Groups Dialog Component
 * Allows users to create, edit, and delete wallet groups with color customization
 */
import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Settings, Plus, Edit, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import type { WalletGroup, CreateGroupData, UpdateGroupData } from "@/lib/types"
import { getWalletGroups, createWalletGroup, updateWalletGroup, deleteWalletGroup } from "@/lib/wallet-groups"

// --- Color Options ---
const colorOptions = [
  { name: "Blue", value: "bg-blue-100 text-blue-800", hex: "#3B82F6" },
  { name: "Green", value: "bg-green-100 text-green-800", hex: "#10B981" },
  { name: "Purple", value: "bg-purple-100 text-purple-800", hex: "#8B5CF6" },
  { name: "Orange", value: "bg-orange-100 text-orange-800", hex: "#F97316" },
  { name: "Red", value: "bg-red-100 text-red-800", hex: "#EF4444" },
  { name: "Yellow", value: "bg-yellow-100 text-yellow-800", hex: "#EAB308" },
  { name: "Pink", value: "bg-pink-100 text-pink-800", hex: "#EC4899" },
  { name: "Indigo", value: "bg-indigo-100 text-indigo-800", hex: "#6366F1" },
  { name: "Teal", value: "bg-teal-100 text-teal-800", hex: "#14B8A6" },
  { name: "Gray", value: "bg-gray-100 text-gray-800", hex: "#6B7280" },
]

interface ManageGroupsDialogProps {
  userId: string
  onGroupsChange?: () => void
}

export default function ManageGroupsDialog({ userId, onGroupsChange }: ManageGroupsDialogProps) {
  // --- State ---
  const [groups, setGroups] = useState<WalletGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  // --- Form States ---
  const [isCreating, setIsCreating] = useState(false)
  const [editingGroup, setEditingGroup] = useState<WalletGroup | null>(null)
  const [formData, setFormData] = useState({ name: "", color: colorOptions[0].value })

  // --- Load Groups ---
  useEffect(() => {
    if (isOpen) {
      loadGroups()
    }
  }, [isOpen, userId])

  async function loadGroups() {
    try {
      setIsLoading(true)
      const groupsData = await getWalletGroups(userId)
      setGroups(groupsData)
    } catch (error) {
      console.error('Error loading groups:', error)
      toast.error("Failed to load groups")
    } finally {
      setIsLoading(false)
    }
  }

  // --- Form Handlers ---
  function handleCreateClick() {
    setIsCreating(true)
    setEditingGroup(null)
    setFormData({ name: "", color: colorOptions[0].value })
  }

  function handleEditClick(group: WalletGroup) {
    setEditingGroup(group)
    setIsCreating(false)
    setFormData({ name: group.name, color: group.color })
  }

  function handleCancel() {
    setIsCreating(false)
    setEditingGroup(null)
    setFormData({ name: "", color: colorOptions[0].value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Group name is required")
      return
    }

    try {
      if (isCreating) {
        // Create new group
        await createWalletGroup(userId, {
          name: formData.name.trim(),
          color: formData.color
        })
        toast.success("Group created successfully")
      } else if (editingGroup) {
        // Update existing group
        await updateWalletGroup(editingGroup.id, {
          name: formData.name.trim(),
          color: formData.color
        })
        toast.success("Group updated successfully")
      }

      // Refresh groups and notify parent
      await loadGroups()
      onGroupsChange?.()
      handleCancel()
    } catch (error) {
      console.error('Error saving group:', error)
      toast.error(isCreating ? "Failed to create group" : "Failed to update group")
    }
  }

  async function handleDelete(group: WalletGroup) {
    if (!confirm(`Are you sure you want to delete "${group.name}"? This will remove all wallets from this group.`)) {
      return
    }

    try {
      await deleteWalletGroup(group.id)
      toast.success("Group deleted successfully")
      await loadGroups()
      onGroupsChange?.()
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error("Failed to delete group")
    }
  }

  // --- Render ---
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Manage Groups
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Wallet Groups</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create/Edit Form */}
          {(isCreating || editingGroup) && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {isCreating ? "Create New Group" : "Edit Group"}
                </h3>
                <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Group Name</label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter group name..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {colorOptions.map(color => (
                      <TooltipProvider key={color.value}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                formData.color === color.value 
                                  ? 'border-foreground scale-110' 
                                  : 'border-border hover:border-foreground/50'
                              }`}
                              style={{ backgroundColor: color.hex }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>{color.name}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  {isCreating ? "Create Group" : "Update Group"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Groups List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Your Groups</h3>
              {!isCreating && !editingGroup && (
                <Button onClick={handleCreateClick} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Group
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading groups...
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">No groups yet</p>
                <p className="text-sm">Create your first group to organize your wallets</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {groups.map(group => (
                  <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                      <Badge className={group.color}>
                        {group.name}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditClick(group)}
                              disabled={isCreating || editingGroup}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Group</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(group)}
                              disabled={isCreating || editingGroup}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Group</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
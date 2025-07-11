/**
 * Wallets Page
 * Displays user's crypto wallets grouped by blockchain chain
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Wallet, Bitcoin, Coins, Zap } from "lucide-react"

// Mock data for development - will be replaced with Supabase queries
const mockWallets = [
  { id: 1, address: "bc1p...xyz123", chain: "BTC", name: "Bitcoin Wallet 1" },
  { id: 2, address: "0x1234...abcd", chain: "ETH", name: "Ethereum Wallet 1" },
  { id: 3, address: "0x5678...efgh", chain: "ETH", name: "Ethereum Wallet 2" },
  { id: 4, address: "SOL123...xyz", chain: "SOL", name: "Solana Wallet 1" },
]

const chainIcons = {
  BTC: Bitcoin,
  ETH: Zap, // Using Zap as a substitute for Ethereum
  SOL: Coins,
  HYPE: Wallet,
}

const chainColors = {
  BTC: "bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
  ETH: "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  SOL: "bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
  HYPE: "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800",
}

export default function WalletsPage() {
  // Group wallets by chain
  const walletsByChain = mockWallets.reduce((acc, wallet) => {
    if (!acc[wallet.chain]) {
      acc[wallet.chain] = []
    }
    acc[wallet.chain].push(wallet)
    return acc
  }, {} as Record<string, typeof mockWallets>)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
          <p className="text-muted-foreground">
            Manage your crypto wallets organized by blockchain
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Wallet
        </Button>
      </div>

      {/* Wallets by Chain */}
      <div className="space-y-6">
        {Object.entries(walletsByChain).map(([chain, wallets]) => {
          const ChainIcon = chainIcons[chain as keyof typeof chainIcons] || Wallet
          const chainColor = chainColors[chain as keyof typeof chainColors] || "bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
          
          return (
            <Card key={chain} className={`${chainColor}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChainIcon className="h-5 w-5" />
                  {chain} Wallets ({wallets.length})
                </CardTitle>
                <CardDescription>
                  Wallets for {chain} blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {wallets.map((wallet) => (
                    <Card key={wallet.id} className="bg-background/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{wallet.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {wallet.address}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {Object.keys(walletsByChain).length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No wallets yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first crypto wallet to get started
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
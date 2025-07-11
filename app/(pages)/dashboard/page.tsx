/**
 * Dashboard Page
 * Main landing page for authenticated users with overview and quick actions
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Wallet, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your NFT whitelist tracker
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No projects yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Whitelists</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Pending projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No wallets yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mints Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No mints scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your NFT tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/wallets">
              <Button className="w-full justify-start">
                <Wallet className="mr-2 h-4 w-4" />
                Manage Wallets
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Add New Project
            </Button>
            <Link href="/calendar">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to set up your tracker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  1
                </div>
                <span className="text-sm">Add your crypto wallets</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-bold">
                  2
                </div>
                <span className="text-sm text-muted-foreground">Add NFT projects to track</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-sm text-muted-foreground">Monitor your calendar for mint dates</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
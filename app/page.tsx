/**
 * Sorta - NFT Whitelist Tracker
 * Main page that redirects based on authentication status
 */
import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth-server"

export default async function Home() {
  const session = await getCurrentSession()
  
  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/auth")
  }
}

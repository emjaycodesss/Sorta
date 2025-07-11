/**
 * Sorta - NFT Whitelist Tracker
 * Main page that redirects to dashboard
 */
import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to dashboard for now
  // Later this will check authentication and redirect accordingly
  redirect("/dashboard")
}

/**
 * Sorta - NFT Whitelist Tracker
 * Main landing page component
 */
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Sorta
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          NFT Whitelist Tracker
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <p className="text-gray-600 dark:text-gray-300">
            Your centralized dashboard for managing NFT whitelist projects, 
            tracking mint dates, and organizing crypto wallets.
          </p>
        </div>
      </div>
    </div>
  );
}

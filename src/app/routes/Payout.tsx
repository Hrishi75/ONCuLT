import { motion } from "framer-motion"
import { useAccount } from "wagmi"

export default function Payout() {
  const { address, isConnected } = useAccount()

  return (
    <div className="min-h-screen px-6 pt-28 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-16 text-center"
      >
        <h1 className="text-4xl font-bold sm:text-5xl">
          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Payouts
          </span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-sm text-white/60 sm:text-base">
          Track earnings, revenue splits, and automated payouts from events and merchandise.
        </p>
      </motion.div>

      {/* Wallet notice */}
      {!isConnected && (
        <div className="mb-12 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-sm text-yellow-300">
          Connect your wallet to view payout details.
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-16">
        {[
          { label: "Total Earned", value: "0.00 ETH" },
          { label: "Pending Payouts", value: "0.00 ETH" },
          { label: "Active Splits", value: "0" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
          >
            <p className="text-sm text-white/60">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue split preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-16 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      >
        <h2 className="text-xl font-semibold mb-4">
          Revenue Split Preview
        </h2>

        <div className="space-y-3 text-sm">
          {[
            { role: "Event Organizer", percent: "60%" },
            { role: "Artist / Creator", percent: "30%" },
            { role: "Platform Fee", percent: "10%" },
          ].map((split) => (
            <div
              key={split.role}
              className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2"
            >
              <span>{split.role}</span>
              <span className="text-white/60">{split.percent}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-white/40">
          * Splits are enforced on-chain via smart contracts.
        </p>
      </motion.div>

      {/* Recent payouts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      >
        <h2 className="text-xl font-semibold mb-4">
          Recent Payouts
        </h2>

        <div className="text-sm text-white/60">
          No payouts yet.
        </div>
      </motion.div>

      {/* Testnet footer */}
      <div className="mt-16 text-center text-xs text-white/40">
        Testnet mode · All values are mock data
      </div>
    </div>
  )
}

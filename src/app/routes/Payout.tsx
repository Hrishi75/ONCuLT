import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import { fetchPurchasesAll } from "../../services/marketplace.service"
import { getExplorerBase, getExplorerName } from "../../lib/chainConfig"
import { getChainIdForReceiptContract } from "../../lib/receiptContract"
import { useChainId } from "wagmi"

type Purchase = {
  id: string
  item_name: string
  price_display: string
  price_eth: number
  listing_type: "artist" | "organizer"
  platform_fee_pct: number
  tx_hash?: string | null
  receipt_tx_hash?: string | null
  receipt_contract?: string | null
  receipt_token_id?: string | null
  chain_id?: number | null
  chain_name?: string | null
  created_at: string
}

type PurchaseRow = {
  id: string
  item_name: string
  price_display: string
  price_eth: number | string | null
  listing_type: "artist" | "organizer"
  platform_fee_pct: number | string | null
  tx_hash?: string | null
  receipt_tx_hash?: string | null
  receipt_contract?: string | null
  receipt_token_id?: string | null
  chain_id?: number | string | null
  chain_name?: string | null
  created_at: string
}

export default function Payout() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const [purchases, setPurchases] = useState<Purchase[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPurchasesAll()
        setPurchases(
          (data ?? []).map((row: PurchaseRow) => ({
            id: row.id,
            item_name: row.item_name,
            price_display: row.price_display,
            price_eth: Number(row.price_eth ?? 0),
            listing_type: row.listing_type,
            platform_fee_pct: Number(row.platform_fee_pct ?? 0),
            tx_hash: row.tx_hash ?? null,
            receipt_tx_hash: row.receipt_tx_hash ?? null,
            receipt_contract: row.receipt_contract ?? null,
            receipt_token_id: row.receipt_token_id ?? null,
            chain_id:
              row.chain_id !== null && row.chain_id !== undefined
                ? Number(row.chain_id)
                : null,
            chain_name: row.chain_name ?? null,
            created_at: row.created_at,
          }))
        )
      } catch (error) {
        console.error("Failed to load payouts:", error)
      }
    }

    void load()
  }, [])

  const totals = useMemo(() => {
    const totalEarned = purchases.reduce((sum, p) => {
      const net = p.price_eth * (1 - p.platform_fee_pct / 100)
      return sum + net
    }, 0)

    return {
      totalEarned,
      pendingPayouts: 0,
      activeSplits: purchases.length,
    }
  }, [purchases])

  const revenueBreakdown = useMemo(() => {
    const gross = purchases.reduce((sum, p) => sum + p.price_eth, 0)
    const platformFees = purchases.reduce(
      (sum, p) => sum + p.price_eth * (p.platform_fee_pct / 100),
      0
    )
    const artistEarned = purchases.reduce((sum, p) => {
      if (p.listing_type !== "artist") return sum
      const net = p.price_eth * (1 - p.platform_fee_pct / 100)
      return sum + net
    }, 0)
    const organizerEarned = purchases.reduce((sum, p) => {
      if (p.listing_type !== "organizer") return sum
      const net = p.price_eth * (1 - p.platform_fee_pct / 100)
      return sum + net
    }, 0)

    const pct = (value: number) =>
      gross > 0 ? `${((value / gross) * 100).toFixed(1)}%` : "0.0%"

    return {
      artistPct: pct(artistEarned),
      organizerPct: pct(organizerEarned),
      platformPct: pct(platformFees),
    }
  }, [purchases])

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
          {
            label: "Total Earned",
            value: `${totals.totalEarned.toFixed(4)} ETH`,
          },
          {
            label: "Pending Payouts",
            value: `${totals.pendingPayouts.toFixed(4)} ETH`,
          },
          { label: "Active Splits", value: `${totals.activeSplits}` },
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
          Revenue Earned Preview
        </h2>

        <div className="space-y-3 text-sm">
          {[
            { role: "Artist / Creator Earned", percent: revenueBreakdown.artistPct },
            { role: "Event Organizer Earned", percent: revenueBreakdown.organizerPct },
            { role: "Platform Fees Earned", percent: revenueBreakdown.platformPct },
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

        {purchases.length === 0 ? (
          <div className="text-sm text-white/60">
            No payouts yet.
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {purchases.slice(0, 6).map((p) => {
              const net = p.price_eth * (1 - p.platform_fee_pct / 100)
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2"
                >
                  <div>
                    <p className="font-medium">{p.item_name}</p>
                    <p className="text-xs text-white/50">
                      {p.listing_type === "organizer"
                        ? "Event Organizer Listing"
                        : "Artist / Creator Listing"}
                    </p>
                    {p.chain_name && (
                      <p className="text-xs text-cyan-200/70">
                        {p.chain_name}
                      </p>
                    )}
                    <p className="text-xs text-white/40">
                      {new Date(p.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      +{net.toFixed(4)} ETH
                    </p>
                    <p className="text-xs text-white/50">
                      Gross {p.price_display} Â· Fee {p.platform_fee_pct}%
                    </p>
                    <div className="mt-2 flex flex-col gap-1 text-xs">
                      {p.tx_hash && (
                        <a
                          href={`${getExplorerBase(
                            p.chain_id ??
                              getChainIdForReceiptContract(p.receipt_contract) ??
                              chainId
                          )}/tx/${p.tx_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-300 hover:text-purple-200 underline"
                        >
                          View on{" "}
                          {getExplorerName(
                            p.chain_id ??
                              getChainIdForReceiptContract(p.receipt_contract) ??
                              chainId
                          )}
                        </a>
                      )}
                      {p.receipt_contract && p.receipt_token_id && (
                        <a
                          href={`${getExplorerBase(
                            p.chain_id ??
                              getChainIdForReceiptContract(p.receipt_contract) ??
                              chainId
                          )}/token/${p.receipt_contract}?a=${p.receipt_token_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-300 hover:text-purple-200 underline"
                        >
                          View Receipt NFT
                        </a>
                      )}
                      {p.receipt_tx_hash && (
                        <a
                          href={`${getExplorerBase(
                            p.chain_id ??
                              getChainIdForReceiptContract(p.receipt_contract) ??
                              chainId
                          )}/tx/${p.receipt_tx_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-300 hover:text-purple-200 underline"
                        >
                          View Receipt Tx
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Testnet footer */}
      <div className="mt-16 text-center text-xs text-white/40">
        Testnet mode · All values are mock data
      </div>
    </div>
  )
}

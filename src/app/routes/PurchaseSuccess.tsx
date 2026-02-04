import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"

export default function PurchaseSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as
    | {
        itemName?: string
        txHash?: string
        receiptContract?: string
        receiptTokenId?: string | null
      }
    | null
  const itemName = state?.itemName ?? "your merch"
  const txHash = state?.txHash
  const receiptContract = state?.receiptContract
  const receiptTokenId = state?.receiptTokenId

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen px-4 pt-32 pb-24 sm:px-6"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
        <div className="mb-6 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <video
            src="/gif-incredible.mp4"
            className="h-56 w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
        <h1 className="text-3xl font-bold sm:text-4xl">
          Congrats! You bought the merch
        </h1>
        <p className="mt-3 text-sm text-white/60 sm:text-base">
          You successfully bought {itemName}.
        </p>

        <div className="mt-4 flex flex-col gap-2 text-sm text-white/70">
          {txHash && (
            <a
              href={`https://sepolia-explorer.base.org/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-white"
            >
              View on BaseScan
            </a>
          )}
          {receiptContract && receiptTokenId && (
            <a
              href={`https://sepolia-explorer.base.org/token/${receiptContract}?a=${receiptTokenId}`}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-white"
            >
              View Receipt NFT
            </a>
          )}
        </div>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate("/marketplace")}
            className="rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-semibold hover:bg-purple-600 transition"
          >
            Back to Marketplace
          </button>
          <button
            onClick={() => navigate("/events")}
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm hover:bg-white/5 transition"
          >
            Explore Events
          </button>
        </div>
      </div>
    </motion.div>
  )
}

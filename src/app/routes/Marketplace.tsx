import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Item = {
  id: string
  name: string
  price: string
  event: string
  limited: boolean
  supply?: number
}

const ITEMS: Item[] = [
  {
    id: "hoodie-eth",
    name: "ETH Conf Hoodie",
    price: "0.05 ETH",
    event: "ETH Conference 2026",
    limited: true,
    supply: 200,
  },
  {
    id: "badge-nft",
    name: "Genesis NFT Badge",
    price: "Free",
    event: "Web3 Builders Meetup",
    limited: false,
  },
  {
    id: "vinyl",
    name: "Vinyl NFT",
    price: "0.08 ETH",
    event: "Decentralized Music Fest",
    limited: true,
    supply: 50,
  },
  {
    id: "poster",
    name: "Limited Poster",
    price: "0.01 ETH",
    event: "Onchain Builders Night",
    limited: true,
    supply: 100,
  },
  {
    id: "tee",
    name: "Limited Edition Tee",
    price: "0.02 ETH",
    event: "AI × Web3 Expo",
    limited: true,
    supply: 300,
  },
  {
    id: "sticker",
    name: "Sticker Pack",
    price: "Free",
    event: "ETH Conference 2026",
    limited: false,
  },
]

export default function Marketplace() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  return (
    <div className="min-h-screen px-4 pt-28 pb-24 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative mb-20 flex flex-col items-center text-center"
      >
        <div className="absolute -z-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />

        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Merchstore
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-sm text-white/60 sm:text-base">
          Buy and sell event merchandise and collectibles on-chain
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          show: { transition: { staggerChildren: 0.05 } },
        }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {ITEMS.map((item) => (
          <motion.div
            key={item.id}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "tween", duration: 0.18, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-shadow hover:shadow-xl hover:shadow-purple-500/10"
          >
            {/* Image placeholder */}
            <div className="mb-4 h-40 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20" />

            <h3 className="text-lg font-semibold">{item.name}</h3>

            <p className="mt-1 text-xs text-white/50">
              {item.event}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-white/80">
                {item.price}
              </span>

              <button
                onClick={() => setSelectedItem(item)}
                className="rounded-lg bg-purple-500/10 px-4 py-1.5 text-sm hover:bg-purple-500/20 transition"
              >
                View
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b0b] p-6 backdrop-blur-xl"
            >
              {/* Image */}
              <div className="mb-5 h-48 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30" />

              {/* Title */}
              <h2 className="text-xl font-semibold">
                {selectedItem.name}
              </h2>

              <p className="mt-1 text-sm text-white/60">
                {selectedItem.event}
              </p>

              {/* Price */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-white/60">Price</span>
                <span className="font-medium">
                  {selectedItem.price}
                </span>
              </div>

              {/* Limited edition */}
              {selectedItem.limited && (
                <div className="mt-3 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-sm text-purple-300">
                  Limited Edition · {selectedItem.supply} items only
                </div>
              )}

              {/* CTA */}
              <button
                className="mt-6 w-full rounded-xl bg-purple-500 py-2.5 text-sm font-semibold hover:bg-purple-600 transition"
              >
                Buy / View Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

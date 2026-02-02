import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAccount } from "wagmi"

/* ================= TYPES ================= */

type EditionType = "open" | "limited" | "extra-limited"

type Item = {
  id: string
  name: string
  price: string
  event: string
  description: string
  edition: EditionType
  supply?: number
  owner: string
}

/* ================= INITIAL ITEMS ================= */

const INITIAL_ITEMS: Item[] = [
  {
    id: "hoodie-eth",
    name: "ETH Conf Hoodie",
    price: "0.05 ETH",
    event: "ETH Conference 2026",
    description: "Official ETH Conf 2026 hoodie",
    edition: "limited",
    supply: 200,
    owner: "0x0000000000000000000000000000000000000000",
  },
]

/* ================= COMPONENT ================= */

export default function Marketplace() {
  const { address, isConnected } = useAccount()

  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  /* Form state */
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [event, setEvent] = useState("")
  const [description, setDescription] = useState("")
  const [edition, setEdition] = useState<EditionType>("open")
  const [supply, setSupply] = useState("")

  /* ================= ACTIONS ================= */

  const createItem = () => {
    if (!isConnected || !address) return

    const newItem: Item = {
      id: crypto.randomUUID(),
      name,
      price,
      event,
      description,
      edition,
      supply: edition === "open" ? undefined : Number(supply || 0),
      owner: address,
    }

    setItems((prev) => [newItem, ...prev])
    setCreateOpen(false)

    setName("")
    setPrice("")
    setEvent("")
    setDescription("")
    setEdition("open")
    setSupply("")
  }

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  /* ================= UI ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen px-4 pt-32 pb-24 sm:px-6"
    >
      {/* HEADER */}
      <div className="mb-20 grid grid-cols-3 items-center">
        <div />

        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Merchstore
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/60 sm:text-base">
            Buy and sell event merchandise and collectibles
          </p>
        </div>

        <div className="flex justify-end">
          <button
            disabled={!isConnected}
            onClick={() => setCreateOpen(true)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              isConnected
                ? "bg-purple-500 hover:bg-purple-600"
                : "cursor-not-allowed bg-white/10 text-white/40"
            }`}
          >
            + List Item
          </button>
        </div>
      </div>

      {/* GRID */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.18 }}
            className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:shadow-xl hover:shadow-purple-500/10"
          >
            {isConnected && item.owner === address && (
              <button
                onClick={() => deleteItem(item.id)}
                className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 text-xs text-white/70 hover:bg-red-500/20 hover:text-red-400 transition"
              >
                ✕
              </button>
            )}

            <div className="mb-4 h-40 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20" />

            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="mt-1 text-xs text-white/50">{item.event}</p>

            <div className="mt-3 flex justify-between text-sm">
              <span>{item.price}</span>
              <span className="uppercase text-purple-400">
                {item.edition}
              </span>
            </div>

            <button
              onClick={() => setSelectedItem(item)}
              className="mt-4 w-full rounded-lg bg-purple-500/10 py-2 text-sm hover:bg-purple-500/20 transition"
            >
              View
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* VIEW MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-[#0b0b0b] p-6"
            >
              <h2 className="text-xl font-semibold">
                {selectedItem.name}
              </h2>
              <p className="mt-1 text-sm text-white/60">
                {selectedItem.event}
              </p>

              <p className="mt-4 text-sm text-white/70">
                {selectedItem.description}
              </p>

              {selectedItem.edition !== "open" && (
                <div className="mt-3 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-sm text-purple-300">
                  {selectedItem.edition} · {selectedItem.supply} items
                </div>
              )}

              <button
                disabled={selectedItem.owner === address}
                className={`mt-6 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                  selectedItem.owner === address
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : "bg-purple-500 hover:bg-purple-600"
                }`}
              >
                Buy Item
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {createOpen && isConnected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => setCreateOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-[#0b0b0b] p-6"
            >
              <h2 className="mb-4 text-xl font-semibold">List Item</h2>

              <input
                placeholder="Item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mb-3 w-full rounded-lg bg-white/5 p-2"
              />

              <input
                placeholder="Event"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="mb-3 w-full rounded-lg bg-white/5 p-2"
              />

              <input
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mb-3 w-full rounded-lg bg-white/5 p-2"
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mb-3 w-full rounded-lg bg-white/5 p-2"
              />

              {/* EDITION TYPE */}
              <div className="mb-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-white/40">
                  Edition Type
                </p>

                <div className="relative flex rounded-xl border border-white/10 bg-white/5 p-1">
                  <motion.div
                    layout
                    transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                    className={`absolute top-1 bottom-1 w-1/3 rounded-lg bg-purple-500 ${
                      edition === "open"
                        ? "left-1"
                        : edition === "limited"
                        ? "left-1/3"
                        : "left-2/3"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setEdition("open")}
                    className={`relative z-10 w-1/3 rounded-lg py-2 text-sm font-medium ${
                      edition === "open" ? "text-white" : "text-white/60"
                    }`}
                  >
                    Open
                  </button>

                  <button
                    type="button"
                    onClick={() => setEdition("limited")}
                    className={`relative z-10 w-1/3 rounded-lg py-2 text-sm font-medium ${
                      edition === "limited" ? "text-white" : "text-white/60"
                    }`}
                  >
                    Limited
                  </button>

                  <button
                    type="button"
                    onClick={() => setEdition("extra-limited")}
                    className={`relative z-10 w-1/3 rounded-lg py-2 text-sm font-medium ${
                      edition === "extra-limited"
                        ? "text-white"
                        : "text-white/60"
                    }`}
                  >
                    Extra
                  </button>
                </div>
              </div>

              {(edition === "limited" || edition === "extra-limited") && (
                <input
                  placeholder="Total Supply"
                  value={supply}
                  onChange={(e) => setSupply(e.target.value)}
                  className="mb-3 w-full rounded-lg bg-white/5 p-2"
                />
              )}

              <button
                onClick={createItem}
                className="mt-4 w-full rounded-xl bg-purple-500 py-2 text-sm font-semibold hover:bg-purple-600 transition"
              >
                List Item
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

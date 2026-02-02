import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"

type SideEvent = {
  name: string
  merch: string[]
}

type EventType = {
  id: string
  name: string
  location: string
  merch: string[]
  sideEvents: SideEvent[]
}

const EVENTS: EventType[] = [
  {
    id: "ethconf",
    name: "ETH Conference 2026",
    location: "Berlin",
    merch: ["Conference Hoodie", "Genesis NFT Badge"],
    sideEvents: [
      {
        name: "L2 Builders Meetup",
        merch: ["Rollup Tee", "Sticker Pack"],
      },
      {
        name: "ZK Night",
        merch: ["ZK NFT", "Limited Poster"],
      },
    ],
  },
  {
    id: "web3meet",
    name: "Web3 Builders Meetup",
    location: "Bangalore",
    merch: ["T-Shirt", "Event NFT"],
    sideEvents: [
      {
        name: "Founders Dinner",
        merch: ["Private NFT"],
      },
    ],
  },
  {
    id: "musicfest",
    name: "Decentralized Music Fest",
    location: "Amsterdam",
    merch: ["Vinyl NFT", "Festival Poster"],
    sideEvents: [
      {
        name: "DJ Night",
        merch: ["Exclusive Track NFT"],
      },
      {
        name: "Artist AMA",
        merch: ["Signed Poster NFT"],
      },
    ],
  },
  {
    id: "defisummit",
    name: "DeFi Summit",
    location: "New York",
    merch: ["Crewneck", "Genesis NFT"],
    sideEvents: [
      {
        name: "Yield Farming Workshop",
        merch: ["Workshop NFT"],
      },
    ],
  },
  {
    id: "aiweb3",
    name: "AI × Web3 Expo",
    location: "San Francisco",
    merch: ["Limited Tee", "Access NFT"],
    sideEvents: [
      {
        name: "AI Agents Panel",
        merch: ["Panel NFT"],
      },
    ],
  },
  {
    id: "onchainmeet",
    name: "Onchain Builders Night",
    location: "Singapore",
    merch: ["Sticker Pack", "Event NFT"],
    sideEvents: [
      {
        name: "Late Night Hack",
        merch: ["Hackathon NFT"],
      },
    ],
  },
]

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen px-4 pt-28 pb-24 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-20 flex flex-col items-center text-center"
      >
        <div className="absolute -z-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />

        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Events
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-sm text-white/60 sm:text-base">
          Explore merchandise and collectibles from live experiences
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {EVENTS.map((event) => (
          <motion.div
            key={event.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -6 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:shadow-xl hover:shadow-purple-500/10"
          >
            <h2 className="text-xl font-semibold">{event.name}</h2>
            <p className="mt-1 text-sm text-white/60">{event.location}</p>

            <button
              onClick={() => setSelectedEvent(event)}
              className="mt-6 w-full rounded-xl bg-purple-500/10 py-2 text-sm font-medium hover:bg-purple-500/20 transition"
            >
              View Event
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* EVENT MODAL */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b0b0b] p-6 backdrop-blur-xl"
            >
              {/* Major Event */}
              <h2 className="text-2xl font-semibold">
                {selectedEvent.name}
              </h2>
              <p className="mt-1 text-sm text-white/60">
                {selectedEvent.location}
              </p>

              {/* Main Merch */}
              <div className="mt-6">
                <p className="mb-2 text-xs uppercase tracking-wide text-white/40">
                  Main Event Merch
                </p>
                <ul className="space-y-1 text-sm text-white/80">
                  {selectedEvent.merch.map((m) => (
                    <li key={m}>• {m}</li>
                  ))}
                </ul>
              </div>

              {/* Side Events */}
              <div className="mt-8 space-y-6">
                {selectedEvent.sideEvents.map((side) => (
                  <div
                    key={side.name}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="font-medium">{side.name}</p>
                    <ul className="mt-2 space-y-1 text-sm text-white/70">
                      {side.merch.map((m) => (
                        <li key={m}>• {m}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Buy / Sell */}
              <div className="mt-8 flex flex-col gap-3">
  <button
    onClick={() => {
      setSelectedEvent(null)
      navigate("/marketplace")
    }}
    className="w-full rounded-xl bg-purple-500 py-2.5 text-sm font-semibold hover:bg-purple-600 transition"
  >
    Buy / Sell on Marketplace
  </button>

  <button
    onClick={() => setSelectedEvent(null)}
    className="w-full rounded-xl border border-white/20 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 transition"
  >
    Close
  </button>
</div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

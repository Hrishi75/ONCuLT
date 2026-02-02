import { motion } from "framer-motion"

const EVENTS = [
  {
    id: "ethconf",
    name: "ETH Conference 2026",
    location: "Berlin",
    merch: ["Hoodie", "Cap", "NFT Badge"],
  },
  {
    id: "web3meet",
    name: "Web3 Builders Meetup",
    location: "Bangalore",
    merch: ["T-Shirt", "Sticker Pack"],
  },
  {
    id: "musicfest",
    name: "Decentralized Music Fest",
    location: "Amsterdam",
    merch: ["Vinyl NFT", "Poster"],
  },
  {
    id: "defisummit",
    name: "DeFi Summit",
    location: "New York",
    merch: ["Crewneck", "Genesis NFT"],
  },
  {
    id: "aiweb3",
    name: "AI × Web3 Expo",
    location: "San Francisco",
    merch: ["Limited Tee", "Access NFT"],
  },
  {
    id: "onchainmeet",
    name: "Onchain Builders Night",
    location: "Singapore",
    merch: ["Sticker Pack", "Event NFT"],
  },
]

export default function Events() {
  return (
    <div className="min-h-screen px-4 pt-28 pb-24 sm:px-6">
      {/* Header */}
<motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  className="relative mb-20 flex flex-col items-center justify-center text-center"
>
  {/* Glow */}
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
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {EVENTS.map((event) => (
          <motion.div
            key={event.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-shadow hover:shadow-xl hover:shadow-purple-500/10"
          >
            {/* Hover glow */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />

            <div className="relative">
              <h2 className="text-xl font-semibold">{event.name}</h2>

              <p className="mt-1 text-sm text-white/60">
                {event.location}
              </p>

              {/* Merch */}
              <div className="mt-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-white/40">
                  Merchandise
                </p>

                <ul className="space-y-1 text-sm text-white/70">
                  {event.merch.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <button className="mt-6 w-full rounded-xl bg-purple-500/10 py-2 text-sm font-medium hover:bg-purple-500/20 transition">
                View Event
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

import FloatingNavbar from "./components/FloatingNavbar"
import { motion } from "framer-motion"

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.15),transparent_40%)]" />

      <FloatingNavbar />

      {/* HERO */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold leading-tight"
        >
          Live Events. <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            On-chain Forever.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 max-w-xl text-white/70"
        >
          Turn live experiences into persistent marketplaces with programmable
          payouts, collectibles, and social discovery.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex gap-4"
        >
          <button className="rounded-full bg-purple-500 px-8 py-3 text-sm font-semibold hover:bg-purple-600 transition">
            Explore Events
          </button>

          <button className="rounded-full border border-white/15 px-8 py-3 text-sm text-white/80 hover:bg-white/5 transition">
            Learn More
          </button>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Event-based Drops",
              desc: "Limited merchandise & collectibles tied directly to live events.",
            },
            {
              title: "Automatic Revenue Splits",
              desc: "Instant, transparent payouts to all collaborators on-chain.",
            },
            {
              title: "Social Profiles & Trading",
              desc: "Discover, showcase, and trade event culture post-event.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/10"
            >
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

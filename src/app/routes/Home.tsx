import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.15),transparent_40%)]" />

      <section className="flex flex-col items-center justify-center px-6 pt-40 pb-24 text-center">
        <motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  className="mb-6 text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide"
>
  On<span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">CuLT</span>
</motion.div>

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
          <button
            onClick={() => navigate("/events")}
            className="rounded-full bg-purple-500 px-8 py-3 text-sm font-semibold hover:bg-purple-600 transition"
          >
            Explore Events
          </button>

         <button
            onClick={() => navigate("/marketplace")}
            className="rounded-full bg-purple-500 px-8 py-3 text-sm font-semibold hover:bg-purple-600 transition"
          >
            Merchstore
          </button>
        </motion.div>
      </section>
      {/* Feature cards */}
<motion.section
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, margin: "-100px" }}
  variants={{
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  }}
  className="grid gap-6 px-6 pb-24 md:grid-cols-3 max-w-6xl mx-auto"
>
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
  ].map((feature) => (
    <motion.div
      key={feature.title}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-shadow hover:shadow-xl hover:shadow-purple-500/10"
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />

      <div className="relative">
        <h3 className="text-lg font-semibold">{feature.title}</h3>
        <p className="mt-2 text-sm text-white/60">
          {feature.desc}
        </p>
      </div>
    </motion.div>
  ))}
</motion.section>
    </div>
  )
}

import { useState } from "react"
import { Link } from "react-router-dom"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Menu } from "lucide-react"

export default function FloatingNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed top-5 left-1/2 z-50 -translate-x-1/2">
      <div className="relative">
        {/* Main navbar */}
        <div className="flex items-center gap-6 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl shadow-lg shadow-black/40">
          
          {/* Logo */}
          <Link to="/" className="text-lg font-semibold tracking-wide">
            On<span className="text-purple-400">CuLT</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-5 text-sm text-white/70">
            <Link to="/events" className="hover:text-white transition">
              Events
            </Link>
            <Link to="/marketplace" className="hover:text-white transition">
              Marketplace
            </Link>
            <Link to="/payout" className="hover:text-white transition">
            Payout
            </Link>
          </nav>

          {/* Wallet */}
          <ConnectButton />

          {/* Mobile menu icon */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden rounded-full p-2 hover:bg-white/10 transition"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="absolute left-1/2 top-[110%] -translate-x-1/2 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-xl">
            <nav className="flex flex-col gap-3 text-sm text-white/80">
              <Link
                to="/events"
                onClick={() => setOpen(false)}
                className="hover:text-white transition"
              >
                Events
              </Link>

              <Link
                to="/marketplace"
                onClick={() => setOpen(false)}
                className="hover:text-white transition"
              >
                Marketplace
              </Link>

              <span className="cursor-not-allowed text-white/40">
                Payout
              </span>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}

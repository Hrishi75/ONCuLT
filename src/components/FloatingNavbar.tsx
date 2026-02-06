import { useState } from "react"
import { Link } from "react-router-dom"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Menu } from "lucide-react"
import { useChainId } from "wagmi"
import { getChainLabel } from "../lib/chainConfig"

export default function FloatingNavbar() {
  const [open, setOpen] = useState(false)
  const chainId = useChainId()
  const chainLabel = getChainLabel(chainId)

  return (
    <div className="fixed top-5 left-1/2 z-50 -translate-x-1/2">
      <div className="relative">
        {/* Main navbar */}
        <div className="rounded-[999px] bg-gradient-to-r from-fuchsia-500/30 via-cyan-400/20 to-emerald-400/30 p-[1px] shadow-[0_0_30px_rgba(168,85,247,0.18)]">
          <div className="flex items-center gap-6 rounded-[999px] bg-[#0a0a0a]/90 px-8 py-3 backdrop-blur-2xl">
            {/* Logo */}
            <Link to="/" className="text-lg font-semibold tracking-wide">
              <span className="text-white">On</span>
              <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                CuLT
              </span>
            </Link>

            <span className="hidden whitespace-nowrap rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-200 md:inline">
              {chainLabel}
            </span>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-5 text-sm text-white/70">
              <Link
                to="/events"
                className="rounded-full px-2 py-1 transition hover:bg-white/5 hover:text-white"
              >
                Events
              </Link>
              <Link
                to="/marketplace"
                className="rounded-full px-2 py-1 transition hover:bg-white/5 hover:text-white"
              >
                Marketplace
              </Link>
              <Link
                to="/community"
                className="rounded-full px-2 py-1 transition hover:bg-white/5 hover:text-white"
              >
                Community
              </Link>
              <Link
                to="/payout"
                className="rounded-full px-2 py-1 transition hover:bg-white/5 hover:text-white"
              >
                Payout
              </Link>
            </nav>

            {/* Wallet */}
            <div className="flex items-center">
              <ConnectButton />
            </div>

            {/* Mobile menu icon */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden rounded-full p-2 transition hover:bg-white/10"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="absolute left-1/2 top-[110%] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0a0a0a]/90 p-4 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <nav className="flex flex-col gap-3 text-sm text-white/80">
              <Link
                to="/events"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-white"
              >
                Events
              </Link>

              <Link
                to="/marketplace"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-white"
              >
                Marketplace
              </Link>
              <Link
                to="/community"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-white"
              >
                Community
              </Link>

              <span className="rounded-lg px-3 py-2 text-white/40">
                Payout
              </span>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}

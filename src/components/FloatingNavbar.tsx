import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function FloatingNavbar() {
  return (
    <div className="fixed top-5 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-6 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl shadow-lg shadow-black/40">
        <span className="text-lg font-semibold tracking-wide">
          On<span className="text-purple-400">CuLT</span>
        </span>

        <nav className="hidden md:flex gap-5 text-sm text-white/70">
          <a className="hover:text-white transition">Explore</a>
          <a className="hover:text-white transition">Events</a>
          <a className="hover:text-white transition">Marketplace</a>
        </nav>

        <ConnectButton />
      </div>
    </div>
  )
}

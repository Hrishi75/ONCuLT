import { defineChain } from "viem"
import { baseSepolia } from "wagmi/chains"

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
    public: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
})

export const getExplorerBase = (chainId?: number) => {
  if (chainId === arcTestnet.id) return "https://testnet.arcscan.app"
  return "https://sepolia-explorer.base.org"
}

export const getExplorerName = (chainId?: number) => {
  if (chainId === arcTestnet.id) return "ArcScan"
  return "BaseScan"
}

export const getChainLabel = (chainId?: number) => {
  if (chainId === arcTestnet.id) return "Arc Testnet"
  if (chainId === baseSepolia.id) return "Base Sepolia"
  return "Unknown Network"
}

export { baseSepolia }

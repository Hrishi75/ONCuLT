import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { sepolia } from "wagmi/chains"

export const config = getDefaultConfig({
  appName: "OnCuLT (Testnet)",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",

  // 🚨 TESTNET ONLY
  chains: [sepolia],

  ssr: false,
})

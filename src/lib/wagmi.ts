import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { http } from "viem"
import { arcTestnet, baseSepolia } from "./chainConfig"

export const config = getDefaultConfig({
  appName: "OnCuLT",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",

  
  chains: [baseSepolia, arcTestnet],
  transports: {
    [baseSepolia.id]: http(),
    [arcTestnet.id]: http(arcTestnet.rpcUrls.default.http[0]),
  },

  ssr: false,
})

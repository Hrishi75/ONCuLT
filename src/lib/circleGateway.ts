import { pad, zeroAddress, maxUint256, type Hex } from "viem"
import { arcTestnet, baseSepolia } from "./chainConfig"

// Circle Gateway Testnet constants
// Domains: Base Sepolia = 6, Arc Testnet = 26
// Gateway contracts: Wallet = 0x0077..., Minter = 0x0022...
export const GATEWAY_API_BASE =
  "https://gateway-api-testnet.circle.com/v1"

export const GATEWAY_WALLET_ADDRESS =
  "0x0077777d7EBA4688BDeF3E311b846F25870A19B9" as `0x${string}`
export const GATEWAY_MINTER_ADDRESS =
  "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B" as `0x${string}`

export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  [baseSepolia.id]:
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  [arcTestnet.id]:
    "0x3600000000000000000000000000000000000000",
}

export const DOMAIN_IDS: Record<number, number> = {
  [baseSepolia.id]: 6,
  [arcTestnet.id]: 26,
}

export const gatewayWalletAbi = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const

export const gatewayMinterAbi = [
  {
    type: "function",
    name: "gatewayMint",
    inputs: [
      { name: "attestationPayload", type: "bytes", internalType: "bytes" },
      { name: "signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const

export const gatewayTypedData = {
  domain: { name: "GatewayWallet", version: "1" },
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
    ],
    TransferSpec: [
      { name: "version", type: "uint32" },
      { name: "sourceDomain", type: "uint32" },
      { name: "destinationDomain", type: "uint32" },
      { name: "sourceContract", type: "bytes32" },
      { name: "destinationContract", type: "bytes32" },
      { name: "sourceToken", type: "bytes32" },
      { name: "destinationToken", type: "bytes32" },
      { name: "sourceDepositor", type: "bytes32" },
      { name: "destinationRecipient", type: "bytes32" },
      { name: "sourceSigner", type: "bytes32" },
      { name: "destinationCaller", type: "bytes32" },
      { name: "value", type: "uint256" },
      { name: "salt", type: "bytes32" },
      { name: "hookData", type: "bytes" },
    ],
    BurnIntent: [
      { name: "maxBlockHeight", type: "uint256" },
      { name: "maxFee", type: "uint256" },
      { name: "spec", type: "TransferSpec" },
    ],
  },
} as const

export const buildBurnIntent = (params: {
  sourceChainId: number
  destinationChainId: number
  depositor: `0x${string}`
  recipient: `0x${string}`
  amountUsdc: bigint
  salt: Hex
}) => {
  const sourceDomain = DOMAIN_IDS[params.sourceChainId]
  const destinationDomain = DOMAIN_IDS[params.destinationChainId]

  if (!sourceDomain || !destinationDomain) {
    throw new Error("Unsupported chain for Gateway")
  }

  return {
    maxBlockHeight: maxUint256,
    maxFee: 2_010000n,
    spec: {
      version: 1,
      sourceDomain: Number(sourceDomain),
      destinationDomain: Number(destinationDomain),
      sourceContract: toBytes32(GATEWAY_WALLET_ADDRESS),
      destinationContract: toBytes32(GATEWAY_MINTER_ADDRESS),
      sourceToken: toBytes32(USDC_ADDRESSES[params.sourceChainId]),
      destinationToken: toBytes32(USDC_ADDRESSES[params.destinationChainId]),
      sourceDepositor: toBytes32(params.depositor),
      destinationRecipient: toBytes32(params.recipient),
      sourceSigner: toBytes32(params.depositor),
      destinationCaller: toBytes32(zeroAddress),
      value: params.amountUsdc,
      salt: params.salt,
      hookData: "0x" as `0x${string}`,
    },
  }
}

export const toBytes32 = (address: string) =>
  pad(address as Hex, { size: 32 })

export const serializeBurnIntent = (burnIntent: any) => {
  const spec = burnIntent.spec
  return {
    ...burnIntent,
    maxBlockHeight: burnIntent.maxBlockHeight.toString(),
    maxFee: burnIntent.maxFee.toString(),
    spec: {
      ...spec,
      value: spec.value.toString(),
    },
  }
}

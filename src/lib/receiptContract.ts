export const BASE_SEPOLIA_RECEIPT_CONTRACT =
  "0x2181D635863e0B51d2c76D9d74271CC23a4101FB" as `0x${string}`
export const ARC_TESTNET_RECEIPT_CONTRACT =
  "0x2181D635863e0B51d2c76D9d74271CC23a4101FB" as `0x${string}` | ""

export const getReceiptContractAddress = (chainId?: number) => {
  if (chainId === 5042002) {
    return ARC_TESTNET_RECEIPT_CONTRACT || undefined
  }
  return BASE_SEPOLIA_RECEIPT_CONTRACT
}

export const getChainIdForReceiptContract = (address?: string | null) => {
  if (!address) return undefined
  const normalized = address.toLowerCase()
  if (normalized === ARC_TESTNET_RECEIPT_CONTRACT?.toLowerCase()) return 5042002
  if (normalized === BASE_SEPOLIA_RECEIPT_CONTRACT?.toLowerCase()) return 84532
  return undefined
}

export const RECEIPT_CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "itemId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "priceWei",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "tokenURI",
        type: "string",
      },
    ],
    name: "ReceiptMinted",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "uint256", name: "itemId", type: "uint256" },
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "uint256", name: "priceWei", type: "uint256" },
      { internalType: "string", name: "tokenURI", type: "string" },
    ],
    name: "mintReceipt",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "receipts",
    outputs: [
      { internalType: "uint256", name: "itemId", type: "uint256" },
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "uint256", name: "priceWei", type: "uint256" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextTokenId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

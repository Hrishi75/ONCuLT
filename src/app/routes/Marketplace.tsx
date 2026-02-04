import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useAccount, useChainId, usePublicClient, useWriteContract } from "wagmi"
import { decodeEventLog, keccak256, parseEther, toHex } from "viem"
import toast from "react-hot-toast"
import {
  createItemDB,
  createPurchaseDB,
  deleteItemDB,
  fetchItemsDB,
  uploadItemImages,
} from "../../services/marketplace.service"
import {
  RECEIPT_CONTRACT_ABI,
  getReceiptContractAddress,
} from "../../lib/receiptContract"
import { getChainLabel } from "../../lib/chainConfig"

/* ================= TYPES ================= */

type EditionType = "open" | "limited" | "extra-limited"
type ListingType = "artist" | "organizer"

type MarketplaceItemRow = {
  id: string
  name: string
  price: string
  event: string
  description: string
  listing_type?: ListingType | null
  edition: EditionType
  supply?: number | null
  owner_address: string
  image_urls?: string[] | null
}

type Item = {
  id: string
  name: string
  price: string
  event: string
  description: string
  listingType?: ListingType
  edition: EditionType
  supply?: number
  owner: string
  imageUrls?: string[]
}

/* ================= INITIAL ITEMS ================= */

const INITIAL_ITEMS: Item[] = [
  {
    id: "hoodie-eth",
    name: "ETH Conf Hoodie",
    price: "0.0005 ETH",
    event: "ETH Conference 2026",
    description: "Official ETH Conf 2026 hoodie",
    edition: "limited",
    supply: 200,
    owner: "0x0000000000000000000000000000000000000000",
  },
]

/* ================= COMPONENT ================= */

export default function Marketplace() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContractAsync, isPending: isMinting } = useWriteContract()
  const publicClient = usePublicClient()

  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  /* Form state */
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [event, setEvent] = useState("")
  const [description, setDescription] = useState("")
  const [listingType, setListingType] = useState<ListingType>("artist")
  const [edition, setEdition] = useState<EditionType>("open")
  const [supply, setSupply] = useState("")
  const [imageFiles, setImageFiles] = useState<File[]>([])

  /* ================= ACTIONS ================= */

  const loadItems = async () => {
    const data = await fetchItemsDB()
    return (data ?? []).map((item: MarketplaceItemRow) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      event: item.event,
      description: item.description,
      listingType: item.listing_type ?? "artist",
      edition: item.edition,
      supply: item.supply ?? undefined,
      owner: item.owner_address,
      imageUrls: Array.isArray(item.image_urls) ? item.image_urls : [],
    })) as Item[]
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const mapped = await loadItems()
        if (!cancelled) setItems(mapped)
      } catch (error) {
        console.error("Failed to fetch marketplace items:", error)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const createItem = async () => {
    if (!isConnected || !address) return

    try {
      const imageUrls = await uploadItemImages(address, imageFiles)
      const payload = {
        name,
        price,
        event,
        description,
        listing_type: listingType,
        edition,
        supply: edition === "open" ? null : Number(supply || 0),
        owner_address: address,
        image_urls: imageUrls,
      }
      await createItemDB(payload)
      const mapped = await loadItems()
      setItems(mapped)
      setCreateOpen(false)
    } catch (error) {
      console.error("Failed to create item:", error)
    }

    setName("")
    setPrice("")
    setEvent("")
    setDescription("")
    setListingType("artist")
    setEdition("open")
    setSupply("")
    setImageFiles([])
  }

  const deleteItem = async (id: string) => {
    try {
      await deleteItemDB(id)
      const mapped = await loadItems()
      setItems(mapped)
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
  }

  const parseEthPrice = (value: string) => {
    const cleaned = value.replace(/eth/i, "").trim()
    const parsed = Number.parseFloat(cleaned)
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid ETH price format")
    }
    return parsed
  }

  const toWei = (value: string) => {
    const cleaned = value.replace(/eth/i, "").trim()
    return parseEther(cleaned)
  }

  const toBase64 = (value: string) => {
    return btoa(unescape(encodeURIComponent(value)))
  }

  const buildTokenUri = (item: Item, buyer: string) => {
    const metadata = {
      name: `Oncult Receipt - ${item.name}`,
      description: "Proof of purchase for Oncult marketplace.",
      image: item.imageUrls?.[0] ?? "",
      attributes: [
        { trait_type: "Item", value: item.name },
        { trait_type: "Price", value: item.price },
        {
          trait_type: "Listing Type",
          value: item.listingType ?? "artist",
        },
        { trait_type: "Seller", value: item.owner },
        { trait_type: "Buyer", value: buyer },
      ],
    }

    return `data:application/json;base64,${toBase64(
      JSON.stringify(metadata)
    )}`
  }

  const toOnchainItemId = (id: string) => {
    const hash = keccak256(toHex(id))
    return BigInt(hash)
  }

  /* ================= UI ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen px-4 pt-32 pb-24 sm:px-6"
    >
      {/* HEADER */}
      <div className="mb-20 grid grid-cols-3 items-center">
        <div />

        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Merchstore
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/60 sm:text-base">
            Buy and sell event merchandise and collectibles
          </p>
        </div>

        <div className="flex justify-end">
          <button
            disabled={!isConnected}
            onClick={() => setCreateOpen(true)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              isConnected
                ? "bg-purple-500 hover:bg-purple-600"
                : "cursor-not-allowed bg-white/10 text-white/40"
            }`}
          >
            + List Item
          </button>
        </div>
      </div>

      {/* GRID */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.18 }}
            className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:shadow-xl hover:shadow-purple-500/10"
          >
            {isConnected && item.owner === address && (
              <button
                onClick={() => deleteItem(item.id)}
                className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 text-xs text-white/70 hover:bg-red-500/20 hover:text-red-400 transition"
              >
                ✕
              </button>
            )}

            {item.imageUrls && item.imageUrls.length > 0 ? (
              <div className="mb-4 overflow-hidden rounded-xl border border-white/10">
                <img
                  src={item.imageUrls[0]}
                  alt={item.name}
                  className="h-40 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="mb-4 h-40 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
            )}

            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="mt-1 text-xs text-white/50">{item.event}</p>

            <div className="mt-3 flex justify-between text-sm">
              <span>{item.price}</span>
              <span className="uppercase text-purple-400">
                {item.edition}
              </span>
            </div>

            <button
              onClick={() => setSelectedItem(item)}
              className="mt-4 w-full rounded-lg bg-purple-500/10 py-2 text-sm hover:bg-purple-500/20 transition"
            >
              View
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* VIEW MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-[#0b0b0b] p-6"
            >
              <h2 className="text-xl font-semibold">
                {selectedItem.name}
              </h2>
              <p className="mt-1 text-sm text-white/60">
                {selectedItem.event}
              </p>

              <p className="mt-4 text-sm text-white/70">
                {selectedItem.description}
              </p>

              {selectedItem.imageUrls &&
                selectedItem.imageUrls.length > 0 && (
                  <div className="mt-6">
                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <img
                        src={selectedItem.imageUrls[0]}
                        alt={selectedItem.name}
                        className="h-56 w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {selectedItem.imageUrls.length > 1 && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {selectedItem.imageUrls.slice(1).map((url) => (
                          <div
                            key={url}
                            className="overflow-hidden rounded-lg border border-white/10"
                          >
                            <img
                              src={url}
                              alt={`${selectedItem.name} preview`}
                              className="h-20 w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              {selectedItem.edition !== "open" && (
                <div className="mt-3 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-sm text-purple-300">
                  {selectedItem.edition} · {selectedItem.supply} items
                </div>
              )}

              <button
                disabled={selectedItem.owner === address}
                onClick={async () => {
                  if (!isConnected || !address) {
                    toast.error("Please connect your wallet to buy items")
                    return
                  }
                  if (!selectedItem) return

                  const itemName = selectedItem.name
                  let txHash: `0x${string}` | undefined
                  let tokenId: string | null = null
                  let tokenUri: string | undefined
                  let receiptContract: `0x${string}` | undefined

                  try {
                    receiptContract = getReceiptContractAddress(chainId)
                    if (!receiptContract) {
                      throw new Error("Receipt contract address not set")
                    }

                    const priceEth = parseEthPrice(selectedItem.price)
                    const priceWei = toWei(selectedItem.price)
                    const platformFeePct =
                      selectedItem.listingType === "organizer" ? 10 : 5

                    tokenUri = buildTokenUri(selectedItem, address)
                    const onchainItemId = toOnchainItemId(selectedItem.id)

                    txHash = (await writeContractAsync({
                      address: receiptContract,
                      abi: RECEIPT_CONTRACT_ABI,
                      functionName: "mintReceipt",
                      value: priceWei,
                      args: [
                        address,
                        onchainItemId,
                        selectedItem.owner,
                        priceWei,
                        tokenUri,
                      ],
                    })) as `0x${string}`

                    if (!publicClient) {
                      throw new Error("Public client not available")
                    }

                    const receipt = await publicClient.waitForTransactionReceipt(
                      { hash: txHash }
                    )
                    const receiptLog = receipt.logs.find((log) => {
                      try {
                        decodeEventLog({
                          abi: RECEIPT_CONTRACT_ABI,
                          data: log.data,
                          topics: log.topics,
                        })
                        return true
                      } catch {
                        return false
                      }
                    })

                    if (receiptLog) {
                      const decoded = decodeEventLog({
                        abi: RECEIPT_CONTRACT_ABI,
                        data: receiptLog.data,
                        topics: receiptLog.topics,
                      })
                      const eventTokenId = decoded.args?.tokenId
                      if (typeof eventTokenId === "bigint") {
                        tokenId = eventTokenId.toString()
                      }
                    }

                    try {
                      await createPurchaseDB({
                        item_id: selectedItem.id,
                        item_name: selectedItem.name,
                        price_display: selectedItem.price,
                        price_eth: priceEth,
                        listing_type: selectedItem.listingType ?? "artist",
                        seller_address: selectedItem.owner,
                        buyer_address: address,
                        platform_fee_pct: platformFeePct,
                        tx_hash: txHash,
                        receipt_contract: receiptContract,
                        receipt_token_id: tokenId,
                        receipt_token_uri: tokenUri ?? null,
                        chain_id: chainId,
                        chain_name: getChainLabel(chainId),
                      })
                    } catch (dbError) {
                      console.error("Failed to store purchase:", dbError)
                    }
                  } catch (error) {
                    console.error("Failed to create purchase:", error)
                    return
                  }

                  setSelectedItem(null)
                  if (txHash) {
                    navigate("/purchase-success", {
                      state: {
                        itemName,
                        txHash,
                        receiptContract: receiptContract ?? null,
                        receiptTokenId: tokenId,
                        chainId,
                      },
                    })
                  }
                }}
                className={`mt-6 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                  selectedItem.owner === address
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : isMinting
                    ? "bg-purple-500/60 text-white/80 cursor-wait"
                    : "bg-purple-500 hover:bg-purple-600"
                }`}
              >
                {isMinting ? "Minting..." : "Buy Item"}
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {createOpen && isConnected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => setCreateOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-[#0b0b0b] p-6"
            >
              <h2 className="mb-4 text-xl font-semibold">List Item</h2>

              <input
                placeholder="Item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mb-3 w-full rounded-lg bg-white/5 p-2"
              />

              <input
                placeholder="Event"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="mb-3 w-full rounded-lg bg-white/5 p-2"
              />

              <input
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mb-3 w-full rounded-lg bg-white/5 p-2"
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mb-3 w-full rounded-lg bg-white/5 p-2"
              />

              <div className="mb-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-white/40">
                  Listing Type
                </p>
                <div className="relative flex rounded-xl border border-white/10 bg-white/5 p-1">
                  <motion.div
                    layout
                    transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                    className={`absolute top-1 bottom-1 w-1/2 rounded-lg bg-purple-500 ${
                      listingType === "artist" ? "left-1" : "left-1/2"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setListingType("artist")}
                    className={`relative z-10 w-1/2 rounded-lg py-2 text-sm font-medium ${
                      listingType === "artist" ? "text-white" : "text-white/60"
                    }`}
                  >
                    Artist / Creator
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingType("organizer")}
                    className={`relative z-10 w-1/2 rounded-lg py-2 text-sm font-medium ${
                      listingType === "organizer"
                        ? "text-white"
                        : "text-white/60"
                    }`}
                  >
                    Event Organizer
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-purple-400/50 hover:bg-purple-500/10"
                >
                  <span className="font-medium">
                    {imageFiles.length > 0
                      ? `${imageFiles.length} file(s) selected`
                      : "Choose item images"}
                  </span>
                  <span className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs uppercase tracking-wide text-white/70 transition group-hover:border-purple-400/40 group-hover:text-purple-200">
                    Browse
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setImageFiles(Array.from(e.target.files ?? []))
                    }
                    className="hidden"
                  />
                </label>
              </div>

              {/* EDITION TYPE */}
              <div className="mb-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-white/40">
                  Edition Type
                </p>

                <div className="relative flex rounded-xl border border-white/10 bg-white/5 p-1">
                  <motion.div
                    layout
                    transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                    className={`absolute top-1 bottom-1 w-1/3 rounded-lg bg-purple-500 ${
                      edition === "open"
                        ? "left-1"
                        : edition === "limited"
                        ? "left-1/3"
                        : "left-2/3"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setEdition("open")}
                    className={`relative z-10 w-1/3 rounded-lg py-2 text-sm font-medium ${
                      edition === "open" ? "text-white" : "text-white/60"
                    }`}
                  >
                    Open
                  </button>

                  <button
                    type="button"
                    onClick={() => setEdition("limited")}
                    className={`relative z-10 w-1/3 rounded-lg py-2 text-sm font-medium ${
                      edition === "limited" ? "text-white" : "text-white/60"
                    }`}
                  >
                    Limited
                  </button>

                  <button
                    type="button"
                    onClick={() => setEdition("extra-limited")}
                    className={`relative z-10 w-1/3 rounded-lg py-2 text-sm font-medium ${
                      edition === "extra-limited"
                        ? "text-white"
                        : "text-white/60"
                    }`}
                  >
                    Extra
                  </button>
                </div>
              </div>

              {(edition === "limited" || edition === "extra-limited") && (
                <input
                  placeholder="Total Supply"
                  value={supply}
                  onChange={(e) => setSupply(e.target.value)}
                  className="mb-3 w-full rounded-lg bg-white/5 p-2"
                />
              )}

              <button
                onClick={createItem}
                className="mt-4 w-full rounded-xl bg-purple-500 py-2 text-sm font-semibold hover:bg-purple-600 transition"
              >
                List Item
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

import { supabase } from "../lib/supabase"

export type CreateItemPayload = {
  name: string
  price: string
  event: string
  description: string
  listing_type: "artist" | "organizer"
  edition: "open" | "limited" | "extra-limited"
  supply?: number | null
  owner_address: string
  image_urls?: string[]
}

export type CreatePurchasePayload = {
  item_id: string
  item_name: string
  price_display: string
  price_eth: number
  listing_type: "artist" | "organizer"
  seller_address: string
  buyer_address: string
  platform_fee_pct: number
  tx_hash?: string | null
  receipt_contract?: string | null
  receipt_token_id?: string | null
  receipt_token_uri?: string | null
  chain_id?: number | null
  chain_name?: string | null
}

export async function createItemDB(payload: CreateItemPayload) {
  const { error } = await supabase.from("marketplace_items").insert(payload)
  if (error) throw error
}

export async function fetchItemsDB() {
  const { data, error } = await supabase
    .from("marketplace_items")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function deleteItemDB(id: string) {
  const { error } = await supabase
    .from("marketplace_items")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function createPurchaseDB(payload: CreatePurchasePayload) {
  const { error } = await supabase
    .from("marketplace_purchases")
    .insert(payload)

  if (error) throw error
}

export async function fetchPurchasesBySeller(address: string) {
  const { data, error } = await supabase
    .from("marketplace_purchases")
    .select("*")
    .eq("seller_address", address)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function fetchPurchasesAll() {
  const { data, error } = await supabase
    .from("marketplace_purchases")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function uploadItemImages(
  ownerAddress: string,
  files: File[]
) {
  if (!files.length) return []

  const bucket = "marketplace-images"
  const uploadedUrls: string[] = []

  for (const file of files) {
    const originalExt = file.name.split(".").pop() ?? ""
    const safeExt = originalExt.replace(/[^a-zA-Z0-9]/g, "")
    const extension = safeExt ? `.${safeExt}` : ""
    const filePath = `${ownerAddress}/${crypto.randomUUID()}${extension}`

    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(filePath, file)

    if (error) throw error

    const publicPath = data?.path ?? filePath
    const { data: publicData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(publicPath)
    if (publicData?.publicUrl) uploadedUrls.push(publicData.publicUrl)
  }

  return uploadedUrls
}

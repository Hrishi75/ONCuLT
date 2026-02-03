import { supabase } from "../lib/supabase"

export type CreateEventPayload = {
  name: string
  location: string
  merch: string[]
  side_events: {
    name: string
    merch: string[]
  }[]
  owner_address: string
  image_urls?: string[]
}

export async function createEventDB(payload: CreateEventPayload) {
  const { error } = await supabase.from("events").insert(payload)

  if (error) {
    throw error
  }
}

export async function fetchEventsDB() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function deleteEventDB(id: string) {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function uploadEventImages(
  ownerAddress: string,
  files: File[]
) {
  if (!files.length) return []

  const bucket = "event-images"
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

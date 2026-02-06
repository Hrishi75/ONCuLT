import { supabase } from "../lib/supabase"

export type CreatePostPayload = {
  title: string
  description: string
  image_url?: string | null
  owner_address: string
}

export async function createPostDB(payload: CreatePostPayload) {
  const { error } = await supabase.from("posts").insert(payload)
  if (error) throw error
}

export async function fetchPostsDB() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function uploadPostImage(
  ownerAddress: string,
  file: File | null
) {
  if (!file) return null

  const bucket = "post-images"
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

  return publicData?.publicUrl ?? null
}

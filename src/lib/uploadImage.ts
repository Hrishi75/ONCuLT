import { supabase } from "./supabase"

export async function uploadImage(
  file: File,
  folder: "events" | "merch"
) {
  const fileName = `${Date.now()}-${file.name}`

  const { error } = await supabase.storage
    .from("media")
    .upload(`${folder}/${fileName}`, file)

  if (error) throw error

  const { data } = supabase.storage
    .from("media")
    .getPublicUrl(`${folder}/${fileName}`)

  return data.publicUrl
}

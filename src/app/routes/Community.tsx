import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import toast from "react-hot-toast"
import {
  createPostDB,
  fetchPostsDB,
  uploadPostImage,
} from "../../services/posts.service"

type PostRow = {
  id: string
  title: string
  description: string
  image_url?: string | null
  owner_address: string
  created_at: string
}

type Post = {
  id: string
  title: string
  description: string
  imageUrl?: string
  owner: string
  createdAt: string
}

export default function Community() {
  const { address, isConnected } = useAccount()
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const loadPosts = async () => {
    try {
      const data = await fetchPostsDB()
      const mapped = (data ?? []).map((post: PostRow) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        imageUrl: post.image_url ?? undefined,
        owner: post.owner_address,
        createdAt: post.created_at,
      })) as Post[]
      setPosts(mapped)
    } catch (error) {
      console.error("Failed to load posts:", error)
    }
  }

  useEffect(() => {
    void loadPosts()
  }, [])

  const createPost = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to post")
      return
    }
    if (!title.trim() || !description.trim()) {
      toast.error("Add a title and description")
      return
    }

    try {
      setLoading(true)
      const imageUrl = await uploadPostImage(address, imageFile)
      await createPostDB({
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl,
        owner_address: address,
      })
      setTitle("")
      setDescription("")
      setImageFile(null)
      await loadPosts()
      toast.success("Posted")
    } catch (error) {
      console.error("Failed to create post:", error)
      toast.error("Could not create post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen px-4 pt-32 pb-24 sm:px-6"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
              Community
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/60 sm:text-base">
            Share your merch, moments, and drops
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-semibold">Create Post</h2>
          <input
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-3 w-full rounded-lg bg-white/5 p-2"
          />
          <textarea
            placeholder="Describe what you got"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-3 w-full rounded-lg bg-white/5 p-2"
          />

          <label className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-purple-400/50 hover:bg-purple-500/10">
            <span className="font-medium">
              {imageFile ? imageFile.name : "Add a photo"}
            </span>
            <span className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs uppercase tracking-wide text-white/70 transition group-hover:border-purple-400/40 group-hover:text-purple-200">
              Browse
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>

          <button
            onClick={createPost}
            disabled={loading}
            className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
              loading
                ? "bg-purple-500/60 text-white/80 cursor-wait"
                : "bg-purple-500 hover:bg-purple-600"
            }`}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              {post.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="h-40 w-full object-contain"
                    loading="lazy"
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="mt-2 text-sm text-white/70">{post.description}</p>
              <div className="mt-4 text-xs text-white/40">
                {post.owner.slice(0, 6)}...{post.owner.slice(-4)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

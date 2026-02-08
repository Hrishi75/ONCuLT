import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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

// Generate gradient based on wallet address
function getGradient(address: string) {
  const gradients = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500",
    "from-cyan-400 to-blue-500",
    "from-emerald-400 to-teal-500",
    "from-orange-400 to-pink-500",
    "from-violet-500 to-purple-500",
  ]
  const index = parseInt(address.slice(-2), 16) % gradients.length
  return gradients[index]
}

// Format time ago
function timeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return "now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`
  return new Date(dateString).toLocaleDateString()
}

export default function Community() {
  const { address, isConnected } = useAccount()
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      setIsModalOpen(false)
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="min-h-screen px-4 pt-32 pb-24 sm:px-6"
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
          {/* Header */}
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

          {/* Posts Feed */}
          <div className="flex flex-col gap-5">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-5">
                  <svg className="h-10 w-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white/80">No posts yet</h3>
                <p className="mt-1 text-sm text-white/50">Be the first to share something!</p>
              </div>
            ) : (
              posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl"
                >
                  {/* Post Header */}
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getGradient(post.owner)} text-[10px] font-bold text-white shadow`}>
                      {post.owner.slice(2, 4).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">
                        {post.owner.slice(0, 6)}...{post.owner.slice(-4)}
                      </p>
                      <p className="text-[10px] text-white/40">{timeAgo(post.createdAt)}</p>
                    </div>
                  </div>

                  {/* Post Image */}
                  {post.imageUrl && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/30">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="px-3 py-2.5">
                    <h3 className="text-sm font-semibold text-white">{post.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-white/70 line-clamp-2">{post.description}</p>
                  </div>
                </motion.article>
              ))
            )}
          </div>
        </div>

        {/* Floating + Button */}
        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white shadow-xl shadow-purple-500/40"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      </motion.div>

      {/* Create Post Modal - Fixed Center */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md"
            >
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <h2 className="text-lg font-semibold text-white">Create Post</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5">
                  <input
                    placeholder="What's happening?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-purple-500/50 focus:bg-white/[0.07]"
                  />
                  <textarea
                    placeholder="Tell us more..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mb-4 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-purple-500/50 focus:bg-white/[0.07]"
                  />

                  <label className="group mb-5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-3 transition hover:border-purple-400/50 hover:bg-purple-500/5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                      <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-white/60 group-hover:text-purple-300">
                      {imageFile ? imageFile.name : "Add a photo"}
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
                    className={`w-full rounded-xl py-3 text-sm font-semibold transition ${loading
                      ? "cursor-wait bg-purple-500/40 text-white/60"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25"
                      }`}
                  >
                    {loading ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

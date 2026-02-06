import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useAccount } from "wagmi"
import { supabase } from "../../lib/supabase"
import {
  createEventDB,
  deleteEventDB,
  fetchEventsDB,
  uploadEventImages,
} from "../../services/events.service"

/* ================= TYPES ================= */

type SideEventForm = {
  name: string
  merchInput: string
}

type SideEvent = {
  name: string
  merch: string[]
}

type EventType = {
  id: string
  name: string
  location: string
  merch: string[]
  sideEvents: SideEvent[]
  owner: string
  imageUrls?: string[]
}

type EventRow = {
  id: string
  name: string
  location: string
  merch?: string[] | null
  side_events?: SideEvent[] | null
  owner_address: string
  image_urls?: string[] | null
}

/* ================= INITIAL DATA ================= */

const INITIAL_EVENTS: EventType[] = [
  {
    id: "ethconf",
    name: "ETH Conference 2026",
    location: "Berlin",
    merch: ["Conference Hoodie", "Genesis NFT Badge"],
    sideEvents: [
      { name: "L2 Builders Meetup", merch: ["Rollup Tee", "Sticker Pack"] },
      { name: "ZK Night", merch: ["ZK NFT", "Limited Poster"] },
    ],
    owner: "0x0000000000000000000000000000000000000000",
  },
]

/* ================= COMPONENT ================= */

export default function Events() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()

  const [events, setEvents] = useState<EventType[]>(INITIAL_EVENTS)
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  // form state
  const [eventName, setEventName] = useState("")
  const [location, setLocation] = useState("")
  const [mainMerch, setMainMerch] = useState("")
  const [sideEvents, setSideEvents] = useState<SideEventForm[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])

  /* ================= HELPERS ================= */

  const loadEvents = async () => {
    try {
      const data = await fetchEventsDB()
      const mapped = (data ?? []).map((event: EventRow) => ({
        id: event.id,
        name: event.name,
        location: event.location,
        merch: Array.isArray(event.merch) ? event.merch : [],
        sideEvents: Array.isArray(event.side_events) ? event.side_events : [],
        owner: event.owner_address,
        imageUrls: (Array.isArray(event.image_urls) ? event.image_urls : [])
          .map((item: string) => {
            if (typeof item !== "string" || !item.trim()) return ""
            if (item.startsWith("http://") || item.startsWith("https://")) {
              return item
            }
            const { data } = supabase
              .storage
              .from("event-images")
              .getPublicUrl(item)
            return data?.publicUrl ?? ""
          })
          .filter(Boolean),
      })) as EventType[]

      setEvents(mapped)
    } catch (error) {
      console.error("Failed to fetch events:", error)
    }
  }

  useEffect(() => {
    void loadEvents()
  }, [])

  const addSideEvent = () => {
    setSideEvents((prev) => [...prev, { name: "", merchInput: "" }])
  }

  const createEvent = async () => {
    if (!isConnected || !address) return

    const parsedSideEvents: SideEvent[] = sideEvents
      .filter((s) => s.name.trim())
      .map((s) => ({
        name: s.name.trim(),
        merch: s.merchInput
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
      }))

    try {
      const imageUrls = await uploadEventImages(address, imageFiles)

      const payload = {
        name: eventName,
        location,
        merch: mainMerch
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
        side_events: parsedSideEvents,
        owner_address: address,
        image_urls: imageUrls,
      }

      await createEventDB(payload)
      await loadEvents()
      setCreateOpen(false)
    } catch (error) {
      console.error("Failed to create event:", error)
    }

    setEventName("")
    setLocation("")
    setMainMerch("")
    setSideEvents([])
    setImageFiles([])
  }

  const deleteEvent = async (id: string) => {
    try {
      await deleteEventDB(id)
      await loadEvents()
    } catch (error) {
      console.error("Failed to delete event:", error)
    } finally {
      setSelectedEvent(null)
    }
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
              Events
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/60 sm:text-base">
            Explore and create live experiences
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
            + Create Event
          </button>
        </div>
      </div>

      {/* EVENTS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <motion.div
            key={event.id}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.18 }}
            className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:shadow-xl hover:shadow-purple-500/10"
          >
            {event.imageUrls && event.imageUrls.length > 0 && (
              <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <img
                  src={event.imageUrls[0]}
                  alt={event.name}
                  className="h-40 w-full object-contain"
                  loading="lazy"
                />
              </div>
            )}
            {isConnected && event.owner === address && (
              <button
                onClick={() => deleteEvent(event.id)}
                className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 text-xs text-white/70 hover:bg-red-500/20 hover:text-red-400 transition"
              >
                ✕
              </button>
            )}

            <h2 className="text-xl font-semibold">{event.name}</h2>
            <p className="mt-1 text-sm text-white/60">{event.location}</p>

            <button
              onClick={() => setSelectedEvent(event)}
              className="mt-6 w-full rounded-xl bg-purple-500/10 py-2 text-sm hover:bg-purple-500/20 transition"
            >
              View Event
            </button>
          </motion.div>
        ))}
      </div>

      {/* CREATE EVENT MODAL */}
      <AnimatePresence>
        {createOpen && isConnected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => setCreateOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg rounded-2xl bg-[#0b0b0b] p-6"
            >
              <h2 className="mb-4 text-xl font-semibold">Create Event</h2>

              <input
                placeholder="Event name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="mb-3 w-full rounded-lg bg-white/5 p-2"
              />

              <input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mb-3 w-full rounded-lg bg-white/5 p-2"
              />

              <input
                placeholder="Main merch (comma separated)"
                value={mainMerch}
                onChange={(e) => setMainMerch(e.target.value)}
                className="mb-4 w-full rounded-lg bg-white/5 p-2"
              />

              <div className="mb-4">
                <label
                  className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-purple-400/50 hover:bg-purple-500/10"
                >
                  <span className="font-medium">
                    {imageFiles.length > 0
                      ? `${imageFiles.length} file(s) selected`
                      : "Choose event images"}
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

              <div className="mt-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-white/40">
                  Side Events
                </p>

                <div className="space-y-3">
                  {sideEvents.map((side, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                      <input
                        placeholder="Side event name"
                        value={side.name}
                        onChange={(e) =>
                          setSideEvents((prev) =>
                            prev.map((s, i) =>
                              i === idx ? { ...s, name: e.target.value } : s
                            )
                          )
                        }
                        className="mb-2 w-full rounded bg-black/30 p-2 text-sm"
                      />

                      <input
                        placeholder="Merch (comma separated)"
                        value={side.merchInput}
                        onChange={(e) =>
                          setSideEvents((prev) =>
                            prev.map((s, i) =>
                              i === idx
                                ? { ...s, merchInput: e.target.value }
                                : s
                            )
                          )
                        }
                        className="w-full rounded bg-black/30 p-2 text-sm"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={addSideEvent}
                  className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition"
                >
                  + Add Side Event
                </button>
              </div>

              <button
                onClick={createEvent}
                className="mt-6 w-full rounded-xl bg-purple-500 py-2 text-sm font-semibold hover:bg-purple-600 transition"
              >
                Create Event
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW EVENT MODAL */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-4xl rounded-2xl bg-[#0b0b0b] p-6"
            >
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="md:w-1/2">
                  {selectedEvent.imageUrls &&
                  selectedEvent.imageUrls.length > 0 ? (
                    <div>
                      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        <img
                          src={selectedEvent.imageUrls[0]}
                          alt={selectedEvent.name}
                          className="h-64 w-full object-contain md:h-80"
                          loading="lazy"
                        />
                      </div>

                      {selectedEvent.imageUrls.length > 1 && (
                        <div className="mt-3 grid grid-cols-3 gap-3">
                          {selectedEvent.imageUrls.slice(1).map((url) => (
                            <div
                              key={url}
                              className="overflow-hidden rounded-lg border border-white/10 bg-black/40"
                            >
                              <img
                                src={url}
                                alt={`${selectedEvent.name} preview`}
                                className="h-20 w-full object-contain"
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 text-sm text-white/40 md:h-80">
                      No image available
                    </div>
                  )}
                </div>

                <div className="md:w-1/2">
                  <h2 className="text-2xl font-semibold">{selectedEvent.name}</h2>
                  <p className="mt-1 text-sm text-white/60">
                    {selectedEvent.location}
                  </p>

                  <div className="mt-6">
                    <p className="mb-2 text-xs uppercase tracking-wide text-white/40">
                      Main Event Merch
                    </p>
                    <ul className="space-y-1 text-sm text-white/80">
                      {selectedEvent.merch.map((m) => (
                        <li key={m}>- {m}</li>
                      ))}
                    </ul>
                  </div>

                  {selectedEvent.sideEvents.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <p className="text-xs uppercase tracking-wide text-white/40">
                        Side Events
                      </p>

                      {selectedEvent.sideEvents.map((side) => (
                        <div
                          key={side.name}
                          className="rounded-xl border border-white/10 bg-white/5 p-4"
                        >
                          <p className="font-medium">{side.name}</p>
                          <ul className="mt-2 space-y-1 text-sm text-white/70">
                            {side.merch.map((m) => (
                              <li key={m}>- {m}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => {
                        setSelectedEvent(null)
                        navigate("/marketplace")
                      }}
                      className="w-full rounded-xl bg-purple-500 py-2.5 text-sm font-semibold hover:bg-purple-600 transition"
                    >
                      Browse Marketplace
                    </button>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="w-full rounded-xl border border-white/20 py-2.5 text-sm hover:bg-white/5 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

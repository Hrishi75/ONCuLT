import { create } from "zustand"

type AppState = {
  selectedEvent: string | null
  setEvent: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedEvent: null,
  setEvent: (id) => set({ selectedEvent: id }),
}))

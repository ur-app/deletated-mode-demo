import { create } from "zustand"
import type { ApiStep } from "../types"

interface ConsoleState {
  actionName: string
  steps: ApiStep[]
  setResult: (actionName: string, steps: ApiStep[]) => void
  clear: () => void
}

export const useConsoleStore = create<ConsoleState>((set) => ({
  actionName: "No action yet",
  steps: [],

  setResult: (actionName, steps) => set({ actionName, steps }),

  clear: () => set({ actionName: "No action yet", steps: [] }),
}))

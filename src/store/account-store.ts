import { create } from "zustand"
import type { AccountState, StatusTone } from "../types"

interface FlatState {
  [key: string]: string
}

function flattenState(viewState: AccountState | null): FlatState {
  const flat: FlatState = {}
  if (!viewState) return flat

  const profile = viewState.profile
  if (profile) {
    flat["profile:urid"] = String(profile.urId || "—")
    flat["profile:status"] = String(profile.statusLabel || "—")
    flat["profile:account"] = String(profile.evmAddress || "—")
    flat["profile:partner"] = String(profile.partnerPublicKey || "—")
    flat["profile:usedLimit"] = String(profile.usedLimitDisplay || "—")
    flat["profile:clientLimit"] = String(profile.clientLimitDisplay || "—")
    flat["profile:kycStep"] = String(profile.kycCurrentStepStr || "—")
    flat["profile:kycRetry"] = String(
      profile.kycRetryVerificationLevelStr || "—",
    )
  }

  viewState.balances?.crypto?.forEach((item) => {
    flat[`crypto:${item.symbol}`] = item.display
  })
  viewState.balances?.fiat?.forEach((item) => {
    flat[`fiat:${item.symbol}`] = item.display
  })

  return flat
}

export function computeChangedKeys(
  prev: AccountState | null,
  next: AccountState | null,
): string[] {
  if (!prev || !next) return []
  const prevFlat = flattenState(prev)
  const nextFlat = flattenState(next)
  const keys = new Set([
    ...Object.keys(prevFlat),
    ...Object.keys(nextFlat),
  ])
  return Array.from(keys).filter(
    (key) => (prevFlat[key] || "") !== (nextFlat[key] || ""),
  )
}

interface AccountStoreState {
  current: AccountState | null
  changedKeys: Set<string>
  statusText: string
  statusTone: StatusTone
  isBusy: boolean

  updateState: (next: AccountState) => void
  clearFlash: () => void
  setStatus: (text: string, tone: StatusTone) => void
  setBusy: (busy: boolean) => void
}

export const useAccountStore = create<AccountStoreState>((set, get) => ({
  current: null,
  changedKeys: new Set<string>(),
  statusText: "Ready",
  statusTone: "neutral" as StatusTone,
  isBusy: false,

  updateState: (next) => {
    const prev = get().current
    const changed = computeChangedKeys(prev, next)
    set({ current: next, changedKeys: new Set(changed) })
  },

  clearFlash: () => set({ changedKeys: new Set<string>() }),

  setStatus: (text, tone) => set({ statusText: text, statusTone: tone }),

  setBusy: (busy) => set({ isBusy: busy }),
}))

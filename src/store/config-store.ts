import { create } from "zustand"
import { DEFAULTS } from "../constants"
import type { ActionConfig } from "../types"

const PK_STORAGE_KEY = "ur_demo_partner_pk"

function readCachedKey(): string {
  try {
    return sessionStorage.getItem(PK_STORAGE_KEY) ?? ""
  } catch {
    return ""
  }
}

function writeCachedKey(value: string) {
  try {
    if (value) sessionStorage.setItem(PK_STORAGE_KEY, value)
    else sessionStorage.removeItem(PK_STORAGE_KEY)
  } catch { /* noop */ }
}

interface ConfigState {
  baseUrl: string
  proxyBaseUrl: string
  partnerPrivateKey: string
  urId: string
  userAddress: string
  chainId: string
  offrampAmount: string
  onrampAmount: string
  fxAmount: string
  partnerPublicKey: string

  setField: (field: string, value: string) => void
  setPartnerPublicKey: (value: string) => void
  loadDefaults: () => void
  getActionConfig: () => ActionConfig
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  baseUrl: DEFAULTS.baseUrl,
  proxyBaseUrl: DEFAULTS.proxyBaseUrl,
  partnerPrivateKey: readCachedKey(),
  urId: DEFAULTS.urId,
  userAddress: DEFAULTS.userAddress,
  chainId: DEFAULTS.chainId,
  offrampAmount: DEFAULTS.offrampAmount,
  onrampAmount: DEFAULTS.onrampAmount,
  fxAmount: DEFAULTS.fxAmount,
  partnerPublicKey: "—",

  setField: (field, value) => {
    if (field === "partnerPrivateKey") writeCachedKey(value)
    set({ [field]: value })
  },

  setPartnerPublicKey: (value) => set({ partnerPublicKey: value }),

  loadDefaults: () =>
    set({
      baseUrl: DEFAULTS.baseUrl,
      proxyBaseUrl: DEFAULTS.proxyBaseUrl,
      urId: DEFAULTS.urId,
      userAddress: DEFAULTS.userAddress,
      chainId: DEFAULTS.chainId,
      offrampAmount: DEFAULTS.offrampAmount,
      onrampAmount: DEFAULTS.onrampAmount,
      fxAmount: DEFAULTS.fxAmount,
      partnerPublicKey: "—",
    }),

  getActionConfig: () => {
    const s = get()
    return {
      baseUrl: s.baseUrl.trim().replace(/\/$/, ""),
      proxyBaseUrl: s.proxyBaseUrl.trim().replace(/\/$/, ""),
      partnerPrivateKey: s.partnerPrivateKey.trim(),
      urId: Number(s.urId),
      userAddress: s.userAddress.trim(),
      chainId: s.chainId,
      amounts: {
        offrampAmount: s.offrampAmount.trim(),
        onrampAmount: s.onrampAmount.trim(),
        fxAmount: s.fxAmount.trim(),
      },
    }
  },
}))

import { create } from "zustand"
import { isAddress } from "viem"
import { DEFAULTS } from "../constants"
import type { ActionConfig, ActionType, ConfigFieldErrors } from "../types"

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

interface ConfigFieldSnapshot {
  partnerPrivateKey: string
  urId: string
  userAddress: string
  chainId: string
  offrampAmount: string
  onrampAmount: string
  fxAmount: string
}

const ACTION_FIELD_MAP: Record<ActionType, Array<keyof ConfigFieldErrors>> = {
  refreshState: ["partnerPrivateKey", "urId", "userAddress", "chainId"],
  offrampQuote: [
    "partnerPrivateKey",
    "urId",
    "userAddress",
    "chainId",
    "offrampAmount",
  ],
  offramp: [
    "partnerPrivateKey",
    "urId",
    "userAddress",
    "chainId",
    "offrampAmount",
  ],
  onrampQuote: [
    "partnerPrivateKey",
    "urId",
    "userAddress",
    "chainId",
    "onrampAmount",
  ],
  onramp: [
    "partnerPrivateKey",
    "urId",
    "userAddress",
    "chainId",
    "onrampAmount",
  ],
  fx: ["partnerPrivateKey", "urId", "userAddress", "chainId", "fxAmount"],
}

export function getConfigFieldErrors(
  fields: ConfigFieldSnapshot,
): ConfigFieldErrors {
  const errors: ConfigFieldErrors = {}

  if (!fields.partnerPrivateKey.trim())
    errors.partnerPrivateKey = "Enter the partner private key"

  if (!fields.urId.trim()) errors.urId = "Enter the URID"
  else if (!/^\d+$/.test(fields.urId.trim()) || Number(fields.urId.trim()) <= 0)
    errors.urId = "URID must be a positive integer"

  if (!fields.userAddress.trim()) errors.userAddress = "Enter the user address"
  else if (!isAddress(fields.userAddress.trim()))
    errors.userAddress = "User address must be a valid EVM address"

  if (!fields.chainId.trim()) errors.chainId = "Select a chain"

  if (!fields.offrampAmount.trim()) errors.offrampAmount = "Enter the Offramp amount"
  else if (!/^\d+(\.\d+)?$/.test(fields.offrampAmount.trim()) || Number(fields.offrampAmount.trim()) <= 0)
    errors.offrampAmount = "Offramp amount must be a number greater than 0"

  if (!fields.onrampAmount.trim()) errors.onrampAmount = "Enter the Onramp amount"
  else if (!/^\d+(\.\d+)?$/.test(fields.onrampAmount.trim()) || Number(fields.onrampAmount.trim()) <= 0)
    errors.onrampAmount = "Onramp amount must be a number greater than 0"

  if (!fields.fxAmount.trim()) errors.fxAmount = "Enter the FX amount"
  else if (!/^\d+(\.\d+)?$/.test(fields.fxAmount.trim()) || Number(fields.fxAmount.trim()) <= 0)
    errors.fxAmount = "FX amount must be a number greater than 0"

  return errors
}

export function getActionFieldErrors(
  fields: ConfigFieldSnapshot,
  action: ActionType,
): ConfigFieldErrors {
  const errors = getConfigFieldErrors(fields)
  const relevantFields = new Set(ACTION_FIELD_MAP[action])

  return Object.fromEntries(
    Object.entries(errors).filter(([field]) =>
      relevantFields.has(field as keyof ConfigFieldErrors),
    ),
  ) as ConfigFieldErrors
}

export function getActionMissingFieldLabels(
  fields: ConfigFieldSnapshot,
  action: ActionType,
): string[] {
  const labels: Record<keyof ConfigFieldErrors, string> = {
    partnerPrivateKey: "Partner private key",
    urId: "URID",
    userAddress: "User address",
    chainId: "Chain ID",
    offrampAmount: "Offramp amount",
    onrampAmount: "Onramp amount",
    fxAmount: "FX amount",
  }

  return Object.keys(getActionFieldErrors(fields, action)).map(
    (field) => labels[field as keyof ConfigFieldErrors],
  )
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

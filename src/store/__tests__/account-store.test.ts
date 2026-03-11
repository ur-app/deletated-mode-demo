import { describe, it, expect, beforeEach } from "vitest"
import { useAccountStore, computeChangedKeys } from "../account-store"
import type { AccountState } from "../../types"

function makeState(overrides: Partial<AccountState> = {}): AccountState {
  return {
    profile: {
      urId: 123,
      chainStatus: 5,
      statusLabel: "Live",
      evmAddress: "0xUser",
      usedLimitDisplay: "10.00 CHF",
      clientLimitDisplay: "100.00 CHF",
      kycCurrentStepStr: "done",
      kycRetryVerificationLevelStr: "—",
      partnerPublicKey: "0xPartner",
    },
    balances: {
      fiat: [{ symbol: "USD", amountRaw: "1000", display: "10.00 USD" }],
      crypto: [{ symbol: "USDC", amountRaw: "5000000", display: "5.000000 USDC" }],
      raw: [],
    },
    ...overrides,
  }
}

beforeEach(() => {
  useAccountStore.setState({
    current: null,
    changedKeys: new Set(),
    statusText: "Ready",
    statusTone: "neutral",
    isBusy: false,
  })
})

describe("computeChangedKeys", () => {
  it("returns empty when both are null", () => {
    expect(computeChangedKeys(null, null)).toEqual([])
  })

  it("returns empty when states are identical", () => {
    const s = makeState()
    expect(computeChangedKeys(s, s)).toEqual([])
  })

  it("detects profile field changes", () => {
    const prev = makeState()
    const next = makeState({
      profile: { ...prev.profile!, statusLabel: "Blocked", chainStatus: 3 },
    })

    const changed = computeChangedKeys(prev, next)
    expect(changed).toContain("profile:status")
  })

  it("detects balance changes", () => {
    const prev = makeState()
    const next = makeState({
      balances: {
        ...prev.balances!,
        fiat: [{ symbol: "USD", amountRaw: "500", display: "5.00 USD" }],
      },
    })

    const changed = computeChangedKeys(prev, next)
    expect(changed).toContain("fiat:USD")
  })
})

describe("useAccountStore", () => {
  it("has correct initial state", () => {
    const state = useAccountStore.getState()
    expect(state.current).toBeNull()
    expect(state.changedKeys.size).toBe(0)
    expect(state.statusText).toBe("Ready")
    expect(state.statusTone).toBe("neutral")
    expect(state.isBusy).toBe(false)
  })

  it("updateState sets current and computes changed keys", () => {
    const first = makeState()
    useAccountStore.getState().updateState(first)
    expect(useAccountStore.getState().current).toEqual(first)

    const second = makeState({
      profile: { ...first.profile!, statusLabel: "Tourist", chainStatus: 2 },
    })
    useAccountStore.getState().updateState(second)
    expect(useAccountStore.getState().changedKeys.has("profile:status")).toBe(true)
  })

  it("clearFlash empties changedKeys", () => {
    useAccountStore.getState().updateState(makeState())
    const next = makeState({
      profile: { ...makeState().profile!, urId: 999 },
    })
    useAccountStore.getState().updateState(next)
    expect(useAccountStore.getState().changedKeys.size).toBeGreaterThan(0)

    useAccountStore.getState().clearFlash()
    expect(useAccountStore.getState().changedKeys.size).toBe(0)
  })

  it("setStatus updates text and tone", () => {
    useAccountStore.getState().setStatus("Loading...", "busy")
    const state = useAccountStore.getState()
    expect(state.statusText).toBe("Loading...")
    expect(state.statusTone).toBe("busy")
  })

  it("setBusy toggles busy flag", () => {
    useAccountStore.getState().setBusy(true)
    expect(useAccountStore.getState().isBusy).toBe(true)

    useAccountStore.getState().setBusy(false)
    expect(useAccountStore.getState().isBusy).toBe(false)
  })
})

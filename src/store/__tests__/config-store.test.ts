import { describe, it, expect, beforeEach } from "vitest"
import { useConfigStore } from "../config-store"
import { DEFAULTS } from "../../constants"

beforeEach(() => {
  useConfigStore.setState({
    baseUrl: DEFAULTS.baseUrl,
    partnerPrivateKey: "",
    urId: DEFAULTS.urId,
    userAddress: DEFAULTS.userAddress,
    chainId: DEFAULTS.chainId,
    offrampAmount: DEFAULTS.offrampAmount,
    onrampAmount: DEFAULTS.onrampAmount,
    fxAmount: DEFAULTS.fxAmount,
    partnerPublicKey: "—",
  })
})

describe("useConfigStore", () => {
  it("has correct initial values from DEFAULTS", () => {
    const state = useConfigStore.getState()
    expect(state.baseUrl).toBe(DEFAULTS.baseUrl)
    expect(state.urId).toBe(DEFAULTS.urId)
    expect(state.partnerPrivateKey).toBe("")
    expect(state.partnerPublicKey).toBe("—")
  })

  it("setField updates individual fields", () => {
    useConfigStore.getState().setField("urId", "999")
    expect(useConfigStore.getState().urId).toBe("999")

    useConfigStore.getState().setField("partnerPrivateKey", "0xabc")
    expect(useConfigStore.getState().partnerPrivateKey).toBe("0xabc")
  })

  it("setPartnerPublicKey updates derived public key", () => {
    useConfigStore.getState().setPartnerPublicKey("0xPublic")
    expect(useConfigStore.getState().partnerPublicKey).toBe("0xPublic")
  })

  it("loadDefaults resets to default values", () => {
    useConfigStore.getState().setField("urId", "custom")
    useConfigStore.getState().setField("baseUrl", "https://custom.url")
    useConfigStore.getState().loadDefaults()

    const state = useConfigStore.getState()
    expect(state.urId).toBe(DEFAULTS.urId)
    expect(state.baseUrl).toBe(DEFAULTS.baseUrl)
  })

  it("loadDefaults does not reset partnerPrivateKey", () => {
    useConfigStore.getState().setField("partnerPrivateKey", "0xSecret")
    useConfigStore.getState().loadDefaults()
    expect(useConfigStore.getState().partnerPrivateKey).toBe("0xSecret")
  })

  it("getActionConfig aggregates and trims config", () => {
    useConfigStore.getState().setField("baseUrl", "  https://api.test.com/  ")
    useConfigStore.getState().setField("partnerPrivateKey", "  0xKey  ")
    useConfigStore.getState().setField("urId", "42")
    useConfigStore.getState().setField("userAddress", "  0xAddr  ")

    const config = useConfigStore.getState().getActionConfig()
    expect(config.baseUrl).toBe("https://api.test.com")
    expect(config.partnerPrivateKey).toBe("0xKey")
    expect(config.urId).toBe(42)
    expect(config.userAddress).toBe("0xAddr")
    expect(config.amounts.offrampAmount).toBe(DEFAULTS.offrampAmount)
  })
})

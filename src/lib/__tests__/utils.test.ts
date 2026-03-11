import { describe, it, expect } from "vitest"
import {
  extractApiCode,
  isStepSuccess,
  getTxHashFromBody,
  buildExplorerUrl,
  createRequestId,
} from "../utils"
import type { ApiStep } from "../../types"

function makeStep(overrides: Partial<ApiStep> = {}): ApiStep {
  return {
    ok: true,
    endpoint: "/v1/test",
    url: "https://api.example.com/v1/test",
    requestHeaders: {},
    requestBody: {},
    responseStatus: 200,
    responseBody: { code: 0, data: {} },
    explorerUrl: null,
    ...overrides,
  }
}

describe("extractApiCode", () => {
  it("extracts code field", () => {
    expect(extractApiCode({ code: 0 })).toBe(0)
    expect(extractApiCode({ code: 42 })).toBe(42)
  })

  it("extracts retCode field", () => {
    expect(extractApiCode({ retCode: 1 })).toBe(1)
  })

  it("prefers code over retCode", () => {
    expect(extractApiCode({ code: 0, retCode: 1 })).toBe(0)
  })

  it("returns undefined for null/non-object", () => {
    expect(extractApiCode(null)).toBeUndefined()
    expect(extractApiCode(undefined)).toBeUndefined()
  })

  it("returns undefined when neither field exists", () => {
    expect(extractApiCode({ data: "hello" })).toBeUndefined()
  })
})

describe("isStepSuccess", () => {
  it("returns true for ok step with code 0", () => {
    expect(isStepSuccess(makeStep())).toBe(true)
  })

  it("returns true for ok step without code", () => {
    expect(isStepSuccess(makeStep({ responseBody: {} }))).toBe(true)
  })

  it("returns false when ok is false", () => {
    expect(isStepSuccess(makeStep({ ok: false }))).toBe(false)
  })

  it("returns false for non-zero api code", () => {
    expect(
      isStepSuccess(makeStep({ responseBody: { code: 500 } })),
    ).toBe(false)
  })

  it("returns false for null/undefined step", () => {
    expect(isStepSuccess(null)).toBe(false)
    expect(isStepSuccess(undefined)).toBe(false)
  })
})

describe("getTxHashFromBody", () => {
  it("extracts from data.txHash", () => {
    expect(getTxHashFromBody({ data: { txHash: "0xabc" } })).toBe("0xabc")
  })

  it("extracts from result.txHash", () => {
    expect(getTxHashFromBody({ result: { txHash: "0xdef" } })).toBe("0xdef")
  })

  it("extracts from data.hash", () => {
    expect(getTxHashFromBody({ data: { hash: "0x123" } })).toBe("0x123")
  })

  it("extracts from top-level txHash", () => {
    expect(getTxHashFromBody({ txHash: "0x456" })).toBe("0x456")
  })

  it("returns null when no hash present", () => {
    expect(getTxHashFromBody({})).toBeNull()
    expect(getTxHashFromBody(null)).toBeNull()
  })
})

describe("buildExplorerUrl", () => {
  it("builds Mantle Sepolia URL", () => {
    expect(buildExplorerUrl("eip155:5003", "0xabc")).toBe(
      "https://sepolia.mantlescan.xyz/tx/0xabc",
    )
  })

  it("builds Mantle Mainnet URL", () => {
    expect(buildExplorerUrl("eip155:5000", "0xabc")).toBe(
      "https://mantlescan.xyz/tx/0xabc",
    )
  })

  it("builds Arbitrum Sepolia URL", () => {
    expect(buildExplorerUrl("eip155:421614", "0xabc")).toBe(
      "https://sepolia.arbiscan.io/tx/0xabc",
    )
  })

  it("returns null for unsupported chain", () => {
    expect(buildExplorerUrl("eip155:1", "0xabc")).toBeNull()
  })

  it("returns null when txHash is null", () => {
    expect(buildExplorerUrl("eip155:5003", null)).toBeNull()
  })
})

describe("createRequestId", () => {
  it("starts with the given prefix", () => {
    const id = createRequestId("offramp")
    expect(id.startsWith("offramp-")).toBe(true)
  })

  it("includes a timestamp", () => {
    const before = Date.now()
    const id = createRequestId("test")
    const parts = id.split("-")
    const ts = Number(parts[1])
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(Date.now())
  })

  it("generates unique ids", () => {
    const a = createRequestId("fx")
    const b = createRequestId("fx")
    expect(a).not.toBe(b)
  })
})

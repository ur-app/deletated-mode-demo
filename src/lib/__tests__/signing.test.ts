import { describe, it, expect, vi, beforeEach } from "vitest"
import { normalizePrivateKey, signedPost, getPublicKeyFromPrivate } from "../signing"

const TEST_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
const EXPECTED_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

describe("normalizePrivateKey", () => {
  it("adds 0x prefix when missing", () => {
    const raw = TEST_PRIVATE_KEY.slice(2)
    expect(normalizePrivateKey(raw)).toBe(TEST_PRIVATE_KEY)
  })

  it("keeps 0x prefix when already present", () => {
    expect(normalizePrivateKey(TEST_PRIVATE_KEY)).toBe(TEST_PRIVATE_KEY)
  })

  it("trims whitespace", () => {
    expect(normalizePrivateKey(`  ${TEST_PRIVATE_KEY}  `)).toBe(
      TEST_PRIVATE_KEY,
    )
  })

  it("throws for empty input", () => {
    expect(() => normalizePrivateKey("")).toThrow("Partner private key is required.")
  })
})

describe("getPublicKeyFromPrivate", () => {
  it("derives correct address from known private key", () => {
    expect(getPublicKeyFromPrivate(TEST_PRIVATE_KEY)).toBe(EXPECTED_ADDRESS)
  })
})

describe("signedPost", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("sends correct headers and returns parsed response", async () => {
    const mockResponse = { code: 0, data: { urId: 123 } }

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      }),
    )

    const result = await signedPost({
      baseUrl: "https://api.example.com",
      proxyBaseUrl: "https://proxy.example.com",
      endpoint: "/v1/profile",
      body: { urId: 123 },
      partnerPrivateKey: TEST_PRIVATE_KEY,
    })

    expect(result.ok).toBe(true)
    expect(result.endpoint).toBe("/v1/profile")
    expect(result.url).toBe("https://api.example.com/v1/profile")
    expect(result.responseStatus).toBe(200)
    expect(result.responseBody).toEqual(mockResponse)
    expect(result.requestBody).toEqual({ urId: 123 })

    expect(result.requestHeaders["X-Api-PublicKey"]).toBe(EXPECTED_ADDRESS)
    expect(result.requestHeaders["X-Api-Signature"]).toBeDefined()
    expect(result.requestHeaders["X-Api-Deadline"]).toBeDefined()
    expect(result.requestHeaders["Content-Type"]).toBe("application/json")

    const deadline = Number(result.requestHeaders["X-Api-Deadline"])
    const now = Math.floor(Date.now() / 1000)
    expect(deadline).toBeGreaterThan(now - 5)
    expect(deadline).toBeLessThanOrEqual(now + 300)
  })

  it("handles non-JSON responses gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        text: () => Promise.resolve("Bad Gateway"),
      }),
    )

    const result = await signedPost({
      baseUrl: "https://api.example.com",
      proxyBaseUrl: "https://proxy.example.com",
      endpoint: "/v1/balance",
      body: { urId: 1 },
      partnerPrivateKey: TEST_PRIVATE_KEY,
    })

    expect(result.ok).toBe(false)
    expect(result.responseStatus).toBe(502)
    expect(result.responseBody).toEqual({ raw: "Bad Gateway" })
  })
})

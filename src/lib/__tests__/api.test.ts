import { describe, it, expect, vi, beforeEach } from "vitest"
import type { ApiStep } from "../../types"

function makeOkStep(endpoint: string, data: unknown = {}): ApiStep {
  return {
    ok: true,
    endpoint,
    url: `https://api.example.com${endpoint}`,
    requestHeaders: {},
    requestBody: {},
    responseStatus: 200,
    responseBody: { code: 0, data },
    explorerUrl: null,
  }
}

const TEST_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

const baseConfig = {
  baseUrl: "https://api.example.com",
  proxyBaseUrl: "https://api.example.com",
  partnerPrivateKey: TEST_PRIVATE_KEY,
  urId: 123,
  userAddress: "0xUser",
  chainId: "eip155:5003",
  amounts: { offrampAmount: "5000000", onrampAmount: "1000", fxAmount: "500" },
}

vi.mock("../signing", () => ({
  signedPost: vi.fn(),
  getPublicKeyFromPrivate: vi.fn().mockReturnValue("0xPartnerAddr"),
}))

import { signedPost, getPublicKeyFromPrivate } from "../signing"
import {
  executeRefreshState,
  executeOfframpQuote,
  executeOfframp,
  executeOnrampQuote,
  executeOnramp,
  executeFx,
} from "../api"

const mockedSignedPost = vi.mocked(signedPost)
vi.mocked(getPublicKeyFromPrivate)

beforeEach(() => {
  vi.clearAllMocks()
})

describe("executeRefreshState", () => {
  it("calls profile and balance endpoints", async () => {
    mockedSignedPost
      .mockResolvedValueOnce(makeOkStep("/v1/profile", { urId: 123, chainStatus: 5 }))
      .mockResolvedValueOnce(makeOkStep("/v1/balance", []))

    const result = await executeRefreshState(baseConfig)

    expect(result.ok).toBe(true)
    expect(result.action).toBe("refreshState")
    expect(result.steps).toHaveLength(2)
    expect(result.postState).toBeDefined()
    expect(mockedSignedPost).toHaveBeenCalledTimes(2)
  })
})

describe("executeOfframpQuote", () => {
  it("calls deposit/quote endpoint", async () => {
    mockedSignedPost
      .mockResolvedValueOnce(makeOkStep("/v1/deposit/quote"))
      .mockResolvedValueOnce(makeOkStep("/v1/profile", { chainStatus: 5 }))
      .mockResolvedValueOnce(makeOkStep("/v1/balance", []))

    const result = await executeOfframpQuote(baseConfig)

    expect(result.ok).toBe(true)
    expect(result.action).toBe("offrampQuote")
    expect(result.steps[0]!.endpoint).toBe("/v1/deposit/quote")
  })
})

describe("executeOfframp", () => {
  it("calls deposit endpoint with requestId", async () => {
    mockedSignedPost
      .mockResolvedValueOnce(makeOkStep("/v1/deposit"))
      .mockResolvedValueOnce(makeOkStep("/v1/profile", { chainStatus: 5 }))
      .mockResolvedValueOnce(makeOkStep("/v1/balance", []))

    const result = await executeOfframp(baseConfig)

    expect(result.ok).toBe(true)
    expect(result.action).toBe("offramp")

    const callBody = mockedSignedPost.mock.calls[0]![0].body
    expect(callBody.requestId).toBeDefined()
    expect((callBody.requestId as string).startsWith("offramp-")).toBe(true)
  })
})

describe("executeOnrampQuote", () => {
  it("calls onramp/quote endpoint", async () => {
    mockedSignedPost
      .mockResolvedValueOnce(makeOkStep("/v1/onramp/quote"))
      .mockResolvedValueOnce(makeOkStep("/v1/profile", { chainStatus: 5 }))
      .mockResolvedValueOnce(makeOkStep("/v1/balance", []))

    const result = await executeOnrampQuote(baseConfig)

    expect(result.ok).toBe(true)
    expect(result.action).toBe("onrampQuote")
  })
})

describe("executeOnramp", () => {
  it("performs two-step flow: quote then execute", async () => {
    const quoteData = {
      quoteId: "q-123",
      best: {
        aggregator: "0xAgg",
        swapCalldata: "0xCalldata",
        minUsdcAmount: "990000",
      },
    }

    mockedSignedPost
      .mockResolvedValueOnce(makeOkStep("/v1/onramp/quote", quoteData))
      .mockResolvedValueOnce(makeOkStep("/v1/onramp"))
      .mockResolvedValueOnce(makeOkStep("/v1/profile", { chainStatus: 5 }))
      .mockResolvedValueOnce(makeOkStep("/v1/balance", []))

    const result = await executeOnramp(baseConfig)

    expect(result.ok).toBe(true)
    expect(result.steps).toHaveLength(2)
    expect(result.steps[0]!.endpoint).toBe("/v1/onramp/quote")
    expect(result.steps[1]!.endpoint).toBe("/v1/onramp")

    const execBody = mockedSignedPost.mock.calls[1]![0].body
    expect(execBody.quoteId).toBe("q-123")
    expect(execBody.dstAggregator).toBe("0xAgg")
  })

  it("throws when quote response missing required fields", async () => {
    mockedSignedPost.mockResolvedValueOnce(
      makeOkStep("/v1/onramp/quote", { quoteId: "q-123" }),
    )

    await expect(executeOnramp(baseConfig)).rejects.toThrow(
      "required fields were missing",
    )
  })
})

describe("executeFx", () => {
  it("performs two-step flow: exchangeRate then exchange", async () => {
    mockedSignedPost
      .mockResolvedValueOnce(makeOkStep("/v1/exchangeRate"))
      .mockResolvedValueOnce(makeOkStep("/v1/exchange"))
      .mockResolvedValueOnce(makeOkStep("/v1/profile", { chainStatus: 5 }))
      .mockResolvedValueOnce(makeOkStep("/v1/balance", []))

    const result = await executeFx(baseConfig)

    expect(result.ok).toBe(true)
    expect(result.steps).toHaveLength(2)
    expect(result.steps[0]!.endpoint).toBe("/v1/exchangeRate")
    expect(result.steps[1]!.endpoint).toBe("/v1/exchange")
  })
})

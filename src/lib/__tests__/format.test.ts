import { describe, it, expect } from "vitest"
import { cleanSymbol, isFiatSymbol, formatUnitsLike, formatTokenAmount } from "../format"

describe("cleanSymbol", () => {
  it("strips trailing '24' and uppercases", () => {
    expect(cleanSymbol("usd24")).toBe("USD")
    expect(cleanSymbol("USDC")).toBe("USDC")
  })

  it("handles empty/null-like input", () => {
    expect(cleanSymbol("")).toBe("")
    expect(cleanSymbol(null as unknown as string)).toBe("")
  })
})

describe("isFiatSymbol", () => {
  it("returns true for fiat symbols", () => {
    expect(isFiatSymbol("USD")).toBe(true)
    expect(isFiatSymbol("EUR")).toBe(true)
    expect(isFiatSymbol("usd24")).toBe(true)
  })

  it("returns false for crypto symbols", () => {
    expect(isFiatSymbol("USDC")).toBe(false)
    expect(isFiatSymbol("BTC")).toBe(false)
  })
})

describe("formatUnitsLike", () => {
  it("formats integer with 2 decimals", () => {
    expect(formatUnitsLike("1000", 2)).toBe("10.00")
    expect(formatUnitsLike("500", 2)).toBe("5.00")
    expect(formatUnitsLike("99", 2)).toBe("0.99")
  })

  it("formats with 6 decimals (USDC)", () => {
    expect(formatUnitsLike("5000000", 6)).toBe("5.000000")
    expect(formatUnitsLike("123456789", 6)).toBe("123.456789")
  })

  it("handles zero", () => {
    expect(formatUnitsLike("0", 2)).toBe("0.00")
    expect(formatUnitsLike("0", 6)).toBe("0.000000")
  })

  it("handles negative values", () => {
    expect(formatUnitsLike("-1000", 2)).toBe("-10.00")
    expect(formatUnitsLike("-5", 2)).toBe("-0.05")
  })

  it("returns dash for null/undefined/empty", () => {
    expect(formatUnitsLike(null)).toBe("—")
    expect(formatUnitsLike(undefined)).toBe("—")
    expect(formatUnitsLike("")).toBe("—")
  })

  it("returns non-numeric strings as-is", () => {
    expect(formatUnitsLike("abc")).toBe("abc")
    expect(formatUnitsLike("12.34")).toBe("12.34")
  })

  it("handles small values needing zero-padding", () => {
    expect(formatUnitsLike("1", 6)).toBe("0.000001")
    expect(formatUnitsLike("10", 6)).toBe("0.000010")
  })
})

describe("formatTokenAmount", () => {
  it("formats known token amounts", () => {
    expect(formatTokenAmount("USDC", "5000000")).toBe("5.000000 USDC")
    expect(formatTokenAmount("USD", "1000")).toBe("10.00 USD")
    expect(formatTokenAmount("EUR", "500")).toBe("5.00 EUR")
  })

  it("returns raw value for unknown tokens", () => {
    expect(formatTokenAmount("BTC", "100000000")).toBe("100000000")
  })

  it("handles symbol with trailing 24", () => {
    expect(formatTokenAmount("usd24", "1000")).toBe("10.00 USD")
  })
})

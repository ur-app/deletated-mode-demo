import { TOKEN_DECIMALS, FIAT_SYMBOLS } from "../constants"

export function cleanSymbol(symbol: string): string {
  return String(symbol || "")
    .replace(/24$/, "")
    .toUpperCase()
}

export function isFiatSymbol(symbol: string): boolean {
  return FIAT_SYMBOLS.has(cleanSymbol(symbol))
}

export function formatUnitsLike(
  rawValue: string | number | null | undefined,
  decimals = 2,
): string {
  if (rawValue === null || rawValue === undefined || rawValue === "") return "—"
  const raw = String(rawValue)
  if (!/^-?\d+$/.test(raw)) return raw

  const negative = raw.startsWith("-")
  const digits = negative ? raw.slice(1) : raw
  const padded = digits.padStart(decimals + 1, "0")
  const integerPart = padded.slice(0, -decimals)
  const decimalPart = padded.slice(-decimals)
  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, "") || "0"
  return `${negative ? "-" : ""}${normalizedInteger}.${decimalPart}`
}

export function formatTokenAmount(
  symbol: string,
  rawAmount: string | number,
): string {
  const cleaned = cleanSymbol(symbol)
  const decimals = TOKEN_DECIMALS[cleaned]
  if (decimals === undefined) return `${rawAmount}`
  return `${formatUnitsLike(rawAmount, decimals)} ${cleaned}`
}

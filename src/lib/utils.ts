import { STATUS_LABELS } from "../constants"
import { cleanSymbol, formatUnitsLike, formatTokenAmount, isFiatSymbol } from "./format"
import type { ApiStep, ParsedProfile, ParsedBalances } from "../types"

export function extractApiCode(
  body: Record<string, unknown> | null | undefined,
): number | undefined {
  if (!body || typeof body !== "object") return undefined
  if (body.code !== undefined) return Number(body.code)
  if (body.retCode !== undefined) return Number(body.retCode)
  return undefined
}

export function isStepSuccess(step: ApiStep | null | undefined): boolean {
  const code = extractApiCode(
    step?.responseBody as Record<string, unknown> | undefined,
  )
  return Boolean(step?.ok) && (code === undefined || code === 0)
}

export function getTxHashFromBody(
  body: Record<string, unknown> | null,
): string | null {
  if (!body || typeof body !== "object") return null
  const data = body.data as Record<string, unknown> | undefined
  const result = body.result as Record<string, unknown> | undefined
  return (
    (data?.txHash as string) ||
    (result?.txHash as string) ||
    (data?.hash as string) ||
    (body.txHash as string) ||
    null
  )
}

export function buildExplorerUrl(
  chainId: string,
  txHash: string | null,
): string | null {
  if (!txHash) return null
  if (chainId === "eip155:5003")
    return `https://sepolia.mantlescan.xyz/tx/${txHash}`
  if (chainId === "eip155:5000")
    return `https://mantlescan.xyz/tx/${txHash}`
  if (chainId === "eip155:421614")
    return `https://sepolia.arbiscan.io/tx/${txHash}`
  return `https://sepolia.mantlescan.xyz/tx/${txHash}`
}

export function createRequestId(prefix: string): string {
  const suffix = crypto.randomUUID().split("-")[0]!
  return `${prefix}-${Date.now()}-${suffix}`
}

export function parseProfile(
  profileResponse: ApiStep,
  fallbackUserAddress: string,
  partnerPublicKey: string,
): ParsedProfile {
  const data = profileResponse.responseBody?.data as
    | Record<string, unknown>
    | undefined
  const profile = data || {}
  const chainStatus =
    profile.chainStatus !== undefined && profile.chainStatus !== null
      ? Number(profile.chainStatus)
      : null

  return {
    urId: (profile.urId as number) ?? null,
    chainStatus,
    statusLabel:
      (chainStatus !== null && STATUS_LABELS[chainStatus]) ||
      (chainStatus === null ? "Unknown" : `Status ${chainStatus}`),
    evmAddress:
      (profile.evmAddress as string) ||
      (profile.address as string) ||
      fallbackUserAddress ||
      null,
    usedLimitDisplay:
      profile.usedLimit !== undefined && profile.usedLimit !== null
        ? `${formatUnitsLike(profile.usedLimit as string, 2)} CHF`
        : "—",
    clientLimitDisplay:
      profile.clientLimit !== undefined && profile.clientLimit !== null
        ? `${formatUnitsLike(profile.clientLimit as string, 2)} CHF`
        : "—",
    kycCurrentStepStr: (profile.kycCurrentStepStr as string) || "—",
    kycRetryVerificationLevelStr:
      (profile.kycRetryVerificationLevelStr as string) || "—",
    partnerPublicKey,
  }
}

export function parseBalances(balanceResponse: ApiStep): ParsedBalances {
  const data = balanceResponse.responseBody?.data
  const items = Array.isArray(data) ? data : []

  const fiat: ParsedBalances["fiat"] = []
  const cryptoArr: ParsedBalances["crypto"] = []

  items.forEach((item: Record<string, unknown>) => {
    const symbol = (item.symbol as string) || "UNKNOWN"
    const amount = (item.amount as string) ?? "0"
    const normalized = {
      symbol,
      amountRaw: amount,
      display: formatTokenAmount(symbol, amount),
    }
    if (isFiatSymbol(normalized.symbol)) fiat.push(normalized)
    else cryptoArr.push(normalized)
  })

  fiat.sort((a, b) =>
    cleanSymbol(a.symbol).localeCompare(cleanSymbol(b.symbol)),
  )
  cryptoArr.sort((a, b) =>
    cleanSymbol(a.symbol).localeCompare(cleanSymbol(b.symbol)),
  )

  return { fiat, crypto: cryptoArr, raw: items }
}

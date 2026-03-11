export interface ApiStep {
  ok: boolean
  endpoint: string
  url: string
  requestHeaders: Record<string, string>
  requestBody: Record<string, unknown>
  responseStatus: number
  responseBody: Record<string, unknown>
  explorerUrl: string | null
}

export interface SignedPostParams {
  baseUrl: string
  proxyBaseUrl: string
  endpoint: string
  body: Record<string, unknown>
  partnerPrivateKey: string
}

export interface ActionConfig {
  baseUrl: string
  proxyBaseUrl: string
  partnerPrivateKey: string
  urId: number
  userAddress: string
  chainId: string
  amounts: {
    offrampAmount: string
    onrampAmount: string
    fxAmount: string
  }
}

export interface BalanceItem {
  symbol: string
  amountRaw: string
  display: string
}

export interface ParsedBalances {
  fiat: BalanceItem[]
  crypto: BalanceItem[]
  raw: unknown[]
}

export interface ParsedProfile {
  urId: number | null
  chainStatus: number | null
  statusLabel: string
  evmAddress: string | null
  usedLimitDisplay: string
  clientLimitDisplay: string
  kycCurrentStepStr: string
  kycRetryVerificationLevelStr: string
  partnerPublicKey: string
}

export interface AccountState {
  profile: ParsedProfile | null
  balances: ParsedBalances | null
}

export interface ActionResult {
  ok: boolean
  action: string
  partnerPublicKey: string
  steps: ApiStep[]
  postState: AccountState | null
}

export type StatusTone = "neutral" | "busy" | "success" | "error"

export type ActionType =
  | "refreshState"
  | "offrampQuote"
  | "offramp"
  | "onrampQuote"
  | "onramp"
  | "fx"

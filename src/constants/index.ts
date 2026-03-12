// Default base URL shown in the sandbox UI
export const DEFAULT_BASE_URL = "https://uropenapi.s7.gomantle.org";
// Requests are proxied through Cloudflare to avoid CORS issues in the browser
export const PROXY_BASE_URL = "https://sandbox-api-proxy.potter.workers.dev";

export const STATUS_LABELS: Record<number, string> = {
  1: "SoftBlocked",
  2: "Tourist",
  3: "Blocked",
  4: "Closed",
  5: "Live",
}

export const FIAT_SYMBOLS = new Set([
  "USD",
  "EUR",
  "CHF",
  "JPY",
  "CNH",
  "SGD",
  "HKD",
])

export const TOKEN_DECIMALS: Record<string, number> = {
  USD: 2,
  EUR: 2,
  CHF: 2,
  JPY: 2,
  CNH: 2,
  SGD: 2,
  HKD: 2,
  USDC: 6,
  USDT: 6,
}

export const CHAIN_OPTIONS = [
  { value: "eip155:5003", label: "eip155:5003 · Mantle Sepolia" },
  { value: "eip155:421614", label: "eip155:421614 · Arbitrum Sepolia" },
  { value: "eip155:5000", label: "eip155:5000 · Mantle Mainnet" },
]

export const DEFAULTS = {
  baseUrl: DEFAULT_BASE_URL,
  proxyBaseUrl: PROXY_BASE_URL,
  urId: "7639951412",
  userAddress: "0x92ca8D358c7298517e0a1c9893a05e59A2641d89",
  chainId: "eip155:5003",
  offrampAmount: "5000000",
  onrampAmount: "1000",
  fxAmount: "500",
}

export const ACTION_DOCS: Record<string, string | null> = {
  offrampQuote:
    "https://docs.ur.app/developer-resources/api-reference-delegated-contract-mode#fetch-offramp-quote",
  offramp:
    "https://docs.ur.app/developer-resources/api-reference-delegated-contract-mode#create-offramp-request",
  onrampQuote:
    "https://docs.ur.app/developer-resources/api-reference-delegated-contract-mode#fetch-onramp-quote",
  onramp:
    "https://docs.ur.app/developer-resources/api-reference-delegated-contract-mode#create-onramp-request",
  fx: "https://docs.ur.app/developer-resources/api-reference-delegated-contract-mode#currency-exchange",
}

export const ACTION_LABELS: Record<string, string> = {
  offrampQuote: "Offramp Quote",
  offramp: "Offramp (5 USDC to USD)",
  onrampQuote: "Onramp Quote",
  onramp: "Onramp (USD to USDC)",
  fx: "FX (5 USD to EUR)",
}

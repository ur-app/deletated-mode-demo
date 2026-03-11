import type { ActionConfig, ActionResult, ApiStep, AccountState } from "../types"
import { signedPost, getPublicKeyFromPrivate } from "./signing"
import { isStepSuccess, parseProfile, parseBalances, createRequestId } from "./utils"

async function fetchState(config: ActionConfig): Promise<{
  steps: ApiStep[]
  state: AccountState
}> {
  const { baseUrl, proxyBaseUrl, partnerPrivateKey, urId, userAddress } = config
  const partnerPublicKey = getPublicKeyFromPrivate(partnerPrivateKey)

  const [profileStep, balanceStep] = await Promise.all([
    signedPost({
      baseUrl,
      proxyBaseUrl,
      endpoint: "/v1/profile",
      body: { urId },
      partnerPrivateKey,
    }),
    signedPost({
      baseUrl,
      proxyBaseUrl,
      endpoint: "/v1/balance",
      body: { urId },
      partnerPrivateKey,
    }),
  ])

  return {
    steps: [profileStep, balanceStep],
    state: {
      profile: parseProfile(profileStep, userAddress, partnerPublicKey),
      balances: parseBalances(balanceStep),
    },
  }
}

export async function executeRefreshState(
  config: ActionConfig,
): Promise<ActionResult> {
  const partnerPublicKey = getPublicKeyFromPrivate(config.partnerPrivateKey)
  const refreshed = await fetchState(config)
  return {
    ok: refreshed.steps.every(isStepSuccess),
    action: "refreshState",
    partnerPublicKey,
    steps: refreshed.steps,
    postState: refreshed.state,
  }
}

export async function executeOfframpQuote(
  config: ActionConfig,
): Promise<ActionResult> {
  const partnerPublicKey = getPublicKeyFromPrivate(config.partnerPrivateKey)
  const { baseUrl, proxyBaseUrl, partnerPrivateKey, urId, userAddress, chainId, amounts } =
    config

  const step = await signedPost({
    baseUrl,
    proxyBaseUrl,
    endpoint: "/v1/deposit/quote",
    body: {
      urId,
      fromToken: "USDC",
      toToken: "USD",
      amount: amounts.offrampAmount || "5000000",
      chainId,
      userAddress,
    },
    partnerPrivateKey,
  })

  return buildResult("offrampQuote", partnerPublicKey, [step], config)
}

export async function executeOfframp(
  config: ActionConfig,
): Promise<ActionResult> {
  const partnerPublicKey = getPublicKeyFromPrivate(config.partnerPrivateKey)
  const { baseUrl, proxyBaseUrl, partnerPrivateKey, urId, userAddress, chainId, amounts } =
    config

  const step = await signedPost({
    baseUrl,
    proxyBaseUrl,
    endpoint: "/v1/deposit",
    body: {
      urId,
      inputToken: "USDC",
      outputToken: "USD",
      amount: amounts.offrampAmount || "5000000",
      requestId: createRequestId("offramp"),
      chainId,
      userAddress,
    },
    partnerPrivateKey,
  })

  return buildResult("offramp", partnerPublicKey, [step], config)
}

export async function executeOnrampQuote(
  config: ActionConfig,
): Promise<ActionResult> {
  const partnerPublicKey = getPublicKeyFromPrivate(config.partnerPrivateKey)
  const { baseUrl, proxyBaseUrl, partnerPrivateKey, urId, chainId, amounts } = config

  const step = await signedPost({
    baseUrl,
    proxyBaseUrl,
    endpoint: "/v1/onramp/quote",
    body: {
      urId,
      chainId,
      fromToken: "USD",
      toToken: "USDC",
      amount: amounts.onrampAmount || "1000",
      slippageBps: 50,
    },
    partnerPrivateKey,
  })

  return buildResult("onrampQuote", partnerPublicKey, [step], config)
}

export async function executeOnramp(
  config: ActionConfig,
): Promise<ActionResult> {
  const partnerPublicKey = getPublicKeyFromPrivate(config.partnerPrivateKey)
  const { baseUrl, proxyBaseUrl, partnerPrivateKey, urId, userAddress, chainId, amounts } =
    config

  const quoteStep = await signedPost({
    baseUrl,
    proxyBaseUrl,
    endpoint: "/v1/onramp/quote",
    body: {
      urId,
      chainId,
      fromToken: "USD",
      toToken: "USDC",
      amount: amounts.onrampAmount || "1000",
      slippageBps: 50,
    },
    partnerPrivateKey,
  })

  const steps: ApiStep[] = [quoteStep]

  if (isStepSuccess(quoteStep)) {
    const quoteData =
      (quoteStep.responseBody?.data as Record<string, unknown>) || {}
    const best =
      (quoteData.best as Record<string, unknown>) ||
      (quoteData.route as Record<string, unknown>) ||
      quoteData

    const quoteId = quoteData.quoteId || quoteData.id
    const dstAggregator =
      best.to;
    const dstSwapCalldata =
      (best.swapCalldata as string) || (quoteData.swapCalldata as string)
    const dstMinAmountOut =
      (best.minUsdcAmount as string) ||
      (best.minAmountOut as string) ||
      (quoteData.minUsdcAmount as string) ||
      (quoteData.minAmountOut as string)

    if (!quoteId || !dstAggregator || !dstSwapCalldata || !dstMinAmountOut)
      throw new Error(
        "Onramp quote succeeded, but required fields were missing from the response.",
      )

    const execStep = await signedPost({
      baseUrl,
      proxyBaseUrl,
      endpoint: "/v1/onramp",
      body: {
        quoteId,
        requestId: createRequestId("onramp"),
        urId,
        chainId,
        tokenIn: "USD",
        amountIn: amounts.onrampAmount || "1000",
        withdrawAddress: userAddress,
        dstChainId: chainId,
        dstAggregator,
        dstTokenOut: "USDC",
        dstSwapCalldata,
        dstMinAmountOut,
      },
      partnerPrivateKey,
    })
    steps.push(execStep)
  }

  return buildResult("onramp", partnerPublicKey, steps, config)
}

export async function executeFx(
  config: ActionConfig,
): Promise<ActionResult> {
  const partnerPublicKey = getPublicKeyFromPrivate(config.partnerPrivateKey)
  const { baseUrl, proxyBaseUrl, partnerPrivateKey, urId, amounts } = config

  const exchangeRateStep = await signedPost({
    baseUrl,
    proxyBaseUrl,
    endpoint: "/v1/exchangeRate",
    body: { inSymbol: "USD", outSymbol: "EUR" },
    partnerPrivateKey,
  })

  const steps: ApiStep[] = [exchangeRateStep]

  if (isStepSuccess(exchangeRateStep)) {
    const fxStep = await signedPost({
      baseUrl,
      proxyBaseUrl,
      endpoint: "/v1/exchange",
      body: {
        urId,
        inputToken: "USD",
        outputToken: "EUR",
        amount: amounts.fxAmount || "500",
        requestId: createRequestId("fx"),
      },
      partnerPrivateKey,
    })
    steps.push(fxStep)
  }

  return buildResult("fx", partnerPublicKey, steps, config)
}

async function buildResult(
  action: string,
  partnerPublicKey: string,
  steps: ApiStep[],
  config: ActionConfig,
): Promise<ActionResult> {
  const success = steps.every(isStepSuccess)
  let postState: AccountState | null = null

  if (success) {
    const refreshed = await fetchState(config)
    postState = refreshed.state
  }

  return { ok: success, action, partnerPublicKey, steps, postState }
}

export const ACTION_EXECUTORS: Record<
  string,
  (config: ActionConfig) => Promise<ActionResult>
> = {
  refreshState: executeRefreshState,
  offrampQuote: executeOfframpQuote,
  offramp: executeOfframp,
  onrampQuote: executeOnrampQuote,
  onramp: executeOnramp,
  fx: executeFx,
}

import type { ActionType, ApiStep } from "../types"
import { extractApiCode, isStepSuccess } from "./utils"

export interface AppError {
  code: string
  userMessage: string
  debugMessage: string
  retryable: boolean
  endpoint?: string
  status?: number
  apiCode?: number
}

export function isAppError(value: unknown): value is AppError {
  return Boolean(
    value &&
      typeof value === "object" &&
      "code" in value &&
      "userMessage" in value &&
      "debugMessage" in value,
  )
}

interface ToAppErrorParams {
  action: ActionType
  step?: ApiStep
  rawError?: unknown
}

const ACTION_LABELS: Record<ActionType, string> = {
  refreshState: "Fetch account info and balances",
  offrampQuote: "Offramp Quote",
  offramp: "Offramp",
  onrampQuote: "Onramp Quote",
  onramp: "Onramp",
  fx: "FX",
}

export function getActionBusyMessage(action: ActionType): string {
  return `${ACTION_LABELS[action]} is running. Please wait.`
}

export function getActionSuccessMessage(action: ActionType): string {
  const copy: Record<ActionType, string> = {
    refreshState: "Account info and balances are loaded. You can continue to the next step.",
    offrampQuote: "Offramp quote received. You can continue with the deposit.",
    offramp: "Offramp submitted. Check the balance changes on the right.",
    onrampQuote: "Onramp quote received. You can continue with the onramp.",
    onramp: "Onramp submitted. Check the balance changes on the right.",
    fx: "FX submitted. Check the balance changes on the right.",
  }

  return copy[action]
}

export function getStepGuidance(step: ApiStep): string {
  if (isStepSuccess(step))
    return "This step completed successfully. You can inspect the response details or move to the next step."

  const code = extractApiCode(step.responseBody)
  const apiMessage = extractApiMessage(step.responseBody)

  if (code === 100401 || /insufficient|balance/i.test(apiMessage))
    return "The balance may be insufficient. Try a smaller amount or fetch the latest account info and balances first."

  if (/kyc|live|status/i.test(apiMessage))
    return "The account may not be ready for this action yet. Confirm that the URID is Live first."

  return "This step failed. Review the response details and check the inputs, account status, or network environment."
}

export function toAppError({
  action,
  step,
  rawError,
}: ToAppErrorParams): AppError {
  if (step) {
    const status = step.responseStatus
    const apiCode = extractApiCode(step.responseBody)
    const apiMessage = extractApiMessage(step.responseBody)

    if (status === 401 || status === 403 || /signature|private key/i.test(apiMessage))
      return {
        code: "SIGNATURE_INVALID",
        userMessage: "Signing failed. Please check whether the partner private key is correct.",
        debugMessage: `${step.endpoint} failed with ${status} ${apiMessage}`.trim(),
        retryable: false,
        endpoint: step.endpoint,
        status,
        apiCode,
      }

    if (/insufficient|balance/i.test(apiMessage))
      return {
        code: "INSUFFICIENT_BALANCE",
        userMessage: "Insufficient balance. Reduce the amount and try again.",
        debugMessage: `${step.endpoint} failed with ${status} ${apiMessage}`.trim(),
        retryable: true,
        endpoint: step.endpoint,
        status,
        apiCode,
      }

    if (/kyc|live|status/i.test(apiMessage))
      return {
        code: "ACCOUNT_NOT_READY",
        userMessage: "This action is not available for the current account state. Confirm that the URID is Live first.",
        debugMessage: `${step.endpoint} failed with ${status} ${apiMessage}`.trim(),
        retryable: true,
        endpoint: step.endpoint,
        status,
        apiCode,
      }

    return {
      code: "API_REQUEST_FAILED",
      userMessage: `${ACTION_LABELS[action]} failed. Please review the inputs and API response details.`,
      debugMessage: `${step.endpoint} failed with ${status} ${apiCode ?? "unknown"} ${apiMessage}`.trim(),
      retryable: true,
      endpoint: step.endpoint,
      status,
      apiCode,
    }
  }

  const rawMessage =
    rawError instanceof Error ? rawError.message : String(rawError || "")

  if (/private key/i.test(rawMessage))
    return {
      code: "PRIVATE_KEY_INVALID",
      userMessage: "The partner private key format is invalid. Paste the demo key again.",
      debugMessage: rawMessage,
      retryable: false,
    }

  if (/required fields were missing/i.test(rawMessage))
    return {
      code: "QUOTE_RESPONSE_INVALID",
      userMessage: "The quote response was incomplete. Try again or change the amount before executing.",
      debugMessage: rawMessage,
      retryable: true,
    }

  if (/fetch/i.test(rawMessage) || /network/i.test(rawMessage))
    return {
      code: "NETWORK_ERROR",
      userMessage: "The network request failed. Please try again shortly.",
      debugMessage: rawMessage,
      retryable: true,
    }

  return {
    code: "UNKNOWN_ERROR",
    userMessage: `${ACTION_LABELS[action]} failed. Check the console for details.`,
    debugMessage: rawMessage || "Unknown error",
    retryable: true,
  }
}

function extractApiMessage(body: Record<string, unknown> | null | undefined): string {
  if (!body || typeof body !== "object") return ""

  const data = body.data
  const candidates = [
    body.message,
    body.msg,
    body.retMsg,
    body.error,
    body.detail,
    typeof data === "object" && data !== null
      ? (data as Record<string, unknown>).message
      : undefined,
  ]

  return candidates.find((value) => typeof value === "string") as string || ""
}

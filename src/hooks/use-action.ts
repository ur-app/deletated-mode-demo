import { useCallback, useRef } from "react"
import {
  getActionFieldErrors,
  getActionMissingFieldLabels,
  useConfigStore,
} from "../store/config-store"
import { useConsoleStore } from "../store/console-store"
import { useAccountStore } from "../store/account-store"
import { ACTION_EXECUTORS } from "../lib/api"
import type { ActionType } from "../types"
import {
  getActionBusyMessage,
  getActionSuccessMessage,
  isAppError,
  toAppError,
} from "../lib/errors"
import { isStepSuccess } from "../lib/utils"

export function useAction() {
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runAction = useCallback(async (action: ActionType) => {
    const configState = useConfigStore.getState()
    const { getActionConfig } = configState
    const config = getActionConfig()
    const { setResult } = useConsoleStore.getState()
    const { setStatus, setBusy, updateState, clearFlash, setActionOutcome } =
      useAccountStore.getState()
    const { setPartnerPublicKey } = useConfigStore.getState()
    const fieldErrors = getActionFieldErrors(
      {
        partnerPrivateKey: configState.partnerPrivateKey,
        urId: configState.urId,
        userAddress: configState.userAddress,
        chainId: configState.chainId,
        offrampAmount: configState.offrampAmount,
        onrampAmount: configState.onrampAmount,
        fxAmount: configState.fxAmount,
      },
      action,
    )

    if (Object.keys(fieldErrors).length > 0) {
      const missingFields = getActionMissingFieldLabels(
        {
          partnerPrivateKey: configState.partnerPrivateKey,
          urId: configState.urId,
          userAddress: configState.userAddress,
          chainId: configState.chainId,
          offrampAmount: configState.offrampAmount,
          onrampAmount: configState.onrampAmount,
          fxAmount: configState.fxAmount,
        },
        action,
      )
      setStatus(`Please complete or correct: ${missingFields.join(", ")}`, "error")
      setActionOutcome(action, false)
      return
    }

    const executor = ACTION_EXECUTORS[action]
    if (!executor) {
      setStatus(`Unsupported action: ${action}`, "error")
      setActionOutcome(action, false)
      return
    }

    setBusy(true)
    setStatus(getActionBusyMessage(action), "busy")

    try {
      const result = await executor(config)

      if (!result.ok) {
        if (result.steps.length > 0) setResult(action, result.steps)
        const failedStep =
          result.steps.find((step) => !isStepSuccess(step)) ??
          result.steps[result.steps.length - 1]
        throw toAppError({ action, step: failedStep })
      }

      if (result.partnerPublicKey)
        setPartnerPublicKey(result.partnerPublicKey)

      setResult(action, result.steps)

      if (result.postState) {
        updateState(result.postState)

        if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
        flashTimerRef.current = setTimeout(clearFlash, 3000)
      }

      setActionOutcome(action, true)
      setStatus(getActionSuccessMessage(action), "success")
    } catch (error) {
      const appError = isAppError(error)
        ? error
        : toAppError({ action, rawError: error })
      setActionOutcome(action, false)
      setStatus(appError.userMessage, "error")
    } finally {
      setBusy(false)
    }
  }, [])

  return { runAction }
}

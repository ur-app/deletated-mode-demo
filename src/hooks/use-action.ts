import { useCallback, useRef } from "react"
import { useConfigStore } from "../store/config-store"
import { useConsoleStore } from "../store/console-store"
import { useAccountStore } from "../store/account-store"
import { ACTION_EXECUTORS } from "../lib/api"
import type { ActionType } from "../types"

export function useAction() {
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runAction = useCallback(async (action: ActionType) => {
    const { getActionConfig } = useConfigStore.getState()
    const config = getActionConfig()
    const { setResult } = useConsoleStore.getState()
    const { setStatus, setBusy, updateState, clearFlash } =
      useAccountStore.getState()
    const { setPartnerPublicKey } = useConfigStore.getState()

    if (!config.partnerPrivateKey) {
      setStatus("Paste a partner private key first", "error")
      return
    }
    if (!config.urId || !config.userAddress) {
      setStatus("URID and user address are required", "error")
      return
    }

    const executor = ACTION_EXECUTORS[action]
    if (!executor) {
      setStatus(`Unsupported action: ${action}`, "error")
      return
    }

    setBusy(true)
    setStatus("Calling API…", "busy")

    try {
      const result = await executor(config)

      if (!result.ok) {
        if (result.steps.length > 0) setResult(action, result.steps)
        throw new Error("The UR API call failed.")
      }

      if (result.partnerPublicKey)
        setPartnerPublicKey(result.partnerPublicKey)

      setResult(action, result.steps)

      if (result.postState) {
        updateState(result.postState)

        if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
        flashTimerRef.current = setTimeout(clearFlash, 3000)
      }

      setStatus("Success", "success")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Request failed"
      setStatus(message, "error")
    } finally {
      setBusy(false)
    }
  }, [])

  return { runAction }
}

import { describe, it, expect, beforeEach } from "vitest"
import { useConsoleStore } from "../console-store"
import type { ApiStep } from "../../types"

function makeStep(endpoint: string): ApiStep {
  return {
    ok: true,
    endpoint,
    url: `https://api.example.com${endpoint}`,
    requestHeaders: {},
    requestBody: {},
    responseStatus: 200,
    responseBody: { code: 0 },
    explorerUrl: null,
  }
}

beforeEach(() => {
  useConsoleStore.setState({
    actionName: "No action yet",
    steps: [],
  })
})

describe("useConsoleStore", () => {
  it("has correct initial state", () => {
    const state = useConsoleStore.getState()
    expect(state.actionName).toBe("No action yet")
    expect(state.steps).toEqual([])
  })

  it("setResult updates action name and steps", () => {
    const steps = [makeStep("/v1/profile"), makeStep("/v1/balance")]
    useConsoleStore.getState().setResult("refreshState", steps)

    const state = useConsoleStore.getState()
    expect(state.actionName).toBe("refreshState")
    expect(state.steps).toHaveLength(2)
    expect(state.steps[0]!.endpoint).toBe("/v1/profile")
  })

  it("clear resets to initial state", () => {
    useConsoleStore.getState().setResult("offramp", [makeStep("/v1/deposit")])
    useConsoleStore.getState().clear()

    const state = useConsoleStore.getState()
    expect(state.actionName).toBe("No action yet")
    expect(state.steps).toEqual([])
  })
})

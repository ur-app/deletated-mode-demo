import { useAccountStore } from "../../store/account-store"
import { useConfigStore } from "../../store/config-store"
import { useAction } from "../../hooks/use-action"
import { ACTION_DOCS, ACTION_LABELS } from "../../constants"
import type { ActionType } from "../../types"

interface FlowStep {
  key: "offramp" | "onramp" | "fx"
  stepLabel: string
  title: string
  description: string
  inputSummary: string
  executeAction: ActionType
  executeId?: string
  quoteAction?: ActionType
  quoteId?: string
  docs: string[]
  canExecute: boolean
  status: "done" | "ready" | "blocked"
  helperText: string
}

export function ActionsPanel() {
  const isBusy = useAccountStore((s) => s.isBusy)
  const current = useAccountStore((s) => s.current)
  const actionOutcomes = useAccountStore((s) => s.actionOutcomes)
  const offrampAmount = useConfigStore((s) => s.offrampAmount)
  const onrampAmount = useConfigStore((s) => s.onrampAmount)
  const fxAmount = useConfigStore((s) => s.fxAmount)
  const { runAction } = useAction()

  const profile = current?.profile
  const hasPreparedState = Boolean(actionOutcomes.refreshState?.ok || current)
  const isProfileLive = profile?.chainStatus === 5
  const hasOfframpQuote = Boolean(actionOutcomes.offrampQuote?.ok)
  const hasOnrampQuote = Boolean(actionOutcomes.onrampQuote?.ok)
  const steps: FlowStep[] = [
    {
      key: "offramp" as const,
      stepLabel: "Step 2",
      title: "Offramp / Deposit",
      description: "Convert crypto into fiat. Get a quote first, then submit the deposit.",
      inputSummary: `${offrampAmount || "—"} USDC(raw) -> USD`,
      quoteAction: "offrampQuote" as const,
      executeAction: "offramp" as const,
      executeId: "tour-offramp-execute",
      quoteId: "tour-offramp-quote",
      docs: [ACTION_DOCS.offrampQuote, ACTION_DOCS.offramp].filter(isDefined),
      canExecute: hasPreparedState && hasOfframpQuote,
      status: actionOutcomes.offramp?.ok
        ? "done"
        : hasPreparedState
          ? "ready"
          : "blocked",
      helperText: !hasPreparedState
        ? "Complete Step 1 first so profile and balance data are available"
        : hasOfframpQuote
          ? "Quote received. You can continue with Offramp now."
          : "Start with Quote so you can confirm the deposit parameters first.",
    },
    {
      key: "onramp" as const,
      stepLabel: "Step 3",
      title: "Onramp",
      description: "Convert fiat into crypto. Get a quote first, then execute the onramp.",
      inputSummary: `${onrampAmount || "—"} USD(raw) -> USDC`,
      quoteAction: "onrampQuote" as const,
      executeAction: "onramp" as const,
      executeId: "",
      quoteId: "",
      docs: [ACTION_DOCS.onrampQuote, ACTION_DOCS.onramp].filter(isDefined),
      canExecute: hasPreparedState && hasOnrampQuote,
      status: actionOutcomes.onramp?.ok
        ? "done"
        : hasPreparedState
          ? "ready"
          : "blocked",
      helperText: !hasPreparedState
        ? "Complete Step 1 first to verify the user profile and balances"
        : hasOnrampQuote
          ? "Quote received. You can continue with Onramp now."
          : "Execution depends on the quote response, so fetch a quote first.",
    },
    {
      key: "fx" as const,
      stepLabel: "Step 4",
      title: "FX Exchange",
      description: "Exchange one fiat balance into another. This demo uses USD -> EUR.",
      inputSummary: `${fxAmount || "—"} USD(raw) -> EUR`,
      executeAction: "fx" as const,
      executeId: "",
      docs: [ACTION_DOCS.fx].filter(isDefined),
      canExecute: hasPreparedState,
      status: actionOutcomes.fx?.ok
        ? "done"
        : hasPreparedState
          ? "ready"
          : "blocked",
      helperText: hasPreparedState
        ? "FX is ready once Step 1 is completed."
        : "Complete Step 1 first to confirm account context and balances.",
    },
  ]

  return (
    <section className="card">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="step-kicker">Step 2-4</div>
          <div className="card-title !mb-1">Run core actions in order</div>
        </div>
        <span className={`step-badge ${hasPreparedState ? "step-badge-ready" : "step-badge-pending"}`}>
          {hasPreparedState ? "Flow unlocked" : "Locked"}
        </span>
      </div>
      <p className="card-copy">
        After Step 1, follow the flow in order: Offramp, Onramp, then FX. Each
        section separates Quote and Execute so the next move is always clear.
      </p>

      {!hasPreparedState && (
        <div className="warning-box mb-3.5">
          Account profile and balances have not been loaded yet. Click `Fetch account info and balances` above before starting the core flow.
        </div>
      )}

      {hasPreparedState && profile && !isProfileLive && (
        <div className="warning-box mb-3.5">
          The current URID status is {profile.statusLabel}. Core banking actions
          should ideally run only when the URID is Live.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {steps.map((step) => (
          <section key={step.key} className="flow-card">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="step-kicker">{step.stepLabel}</div>
                <h3 className="m-0 text-base font-semibold">{step.title}</h3>
              </div>
              <span className={`step-badge ${getStepBadgeClass(step.status)}`}>
                {getStepBadgeLabel(step.status)}
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              {step.description}
            </p>
            <div className="flow-summary mb-3">
              <span className="flow-summary-label">Input to Output</span>
              <span>{step.inputSummary}</span>
            </div>
            <div className="text-xs text-slate-400 mb-3">{step.helperText}</div>

            {step.quoteAction ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  id={step.quoteId}
                  className="action-btn-primary"
                  disabled={isBusy || !hasPreparedState}
                  onClick={() => runAction(step.quoteAction!)}
                >
                  {ACTION_LABELS[step.quoteAction!]}
                </button>
                <button
                  id={step.executeId}
                  className="action-btn"
                  disabled={isBusy || !step.canExecute}
                  onClick={() => runAction(step.executeAction!)}
                >
                  {ACTION_LABELS[step.executeAction!]}
                </button>
              </div>
            ) : (
              <button
                className="action-btn-primary w-full"
                disabled={isBusy || !step.canExecute}
                onClick={() => runAction(step.executeAction)}
              >
                {ACTION_LABELS[step.executeAction]}
              </button>
            )}

            <div className="flex gap-3 flex-wrap mt-3">
              {step.docs.map((docUrl) => (
                <a
                  key={docUrl}
                  href={docUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-300 text-sm hover:underline"
                >
                  Docs
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

function getStepBadgeClass(status: "done" | "ready" | "blocked"): string {
  if (status === "done") return "step-badge-success"
  if (status === "ready") return "step-badge-ready"
  return "step-badge-pending"
}

function getStepBadgeLabel(status: "done" | "ready" | "blocked"): string {
  if (status === "done") return "Done"
  if (status === "ready") return "Ready"
  return "Blocked"
}

function isDefined(value: string | null | undefined): value is string {
  return Boolean(value)
}

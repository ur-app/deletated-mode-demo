import { useAccountStore } from "../../store/account-store"
import { useAction } from "../../hooks/use-action"
import { ACTION_DOCS, ACTION_LABELS } from "../../constants"
import type { ActionType } from "../../types"

const ACTIONS: { key: ActionType; primary?: boolean }[] = [
  { key: "offrampQuote", primary: true },
  { key: "offramp" },
  { key: "onrampQuote" },
  { key: "onramp" },
  { key: "fx" },
]

export function ActionsPanel() {
  const isBusy = useAccountStore((s) => s.isBusy)
  const current = useAccountStore((s) => s.current)
  const { runAction } = useAction()

  const profile = current?.profile
  const showWarning = profile && profile.chainStatus !== 5

  return (
    <section className="card">
      <div className="card-title">Core banking actions</div>
      <p className="card-copy">
        In Delegated Mode, once authorization is complete, the partner can
        trigger core banking operations by API without requiring a fresh wallet
        signature for every action.
      </p>

      {showWarning && (
        <div className="warning-box mb-3.5">
          Current URID status is {profile.statusLabel}. Core banking actions
          should only be run when the URID is Live.
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {ACTIONS.map(({ key, primary }) => {
          const docUrl = ACTION_DOCS[key]
          return (
            <div
              key={key}
              className="grid grid-cols-[1fr_auto] gap-3 items-center"
            >
              <button
                className={primary ? "action-btn-primary" : "action-btn"}
                disabled={isBusy}
                onClick={() => runAction(key)}
              >
                {ACTION_LABELS[key]}
              </button>
              {docUrl ? (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-300 text-sm hover:underline"
                >
                  Docs
                </a>
              ) : (
                <span className="text-slate-500 text-sm whitespace-nowrap">
                  No PRD link
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

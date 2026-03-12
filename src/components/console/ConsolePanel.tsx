import { useConsoleStore } from "../../store/console-store"
import { ACTION_LABELS } from "../../constants"
import { ConsoleEmpty } from "./ConsoleEmpty"
import { ConsoleStep } from "./ConsoleStep"

export function ConsolePanel() {
  const actionName = useConsoleStore((s) => s.actionName)
  const steps = useConsoleStore((s) => s.steps)
  const actionLabel = ACTION_LABELS[actionName] || actionName

  return (
    <section className="flex flex-col gap-4">
      <div id="tour-console-panel" className="card console-card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="card-title">API interactive console</div>
            <p className="card-copy">
              Review the latest action's requests, responses, and explorer links here. This panel keeps the technical details visible for debugging.
            </p>
          </div>
          <div className="shrink-0 px-3.5 py-2.5 rounded-full border border-slate-600/20 text-violet-200 bg-slate-900/70 font-semibold text-sm">
            {actionLabel}
          </div>
        </div>

        {steps.length === 0 ? (
          <ConsoleEmpty />
        ) : (
          <div className="flex flex-col gap-3.5">
            {steps.map((step, i) => (
              <ConsoleStep key={`${step.endpoint}-${i}`} step={step} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

import { useConsoleStore } from "../../store/console-store"
import { ConsoleEmpty } from "./ConsoleEmpty"
import { ConsoleStep } from "./ConsoleStep"

export function ConsolePanel() {
  const actionName = useConsoleStore((s) => s.actionName)
  const steps = useConsoleStore((s) => s.steps)

  return (
    <section className="flex flex-col gap-4">
      <div className="card console-card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="card-title">API interactive console</div>
            <p className="card-copy">
              URL, headers, request body, response body, and explorer links for
              the most recent action.
            </p>
          </div>
          <div className="shrink-0 px-3.5 py-2.5 rounded-full border border-slate-600/20 text-violet-200 bg-slate-900/70 font-semibold text-sm">
            {actionName}
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

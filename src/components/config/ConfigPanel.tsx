import { ConfigForm } from "./ConfigForm"
import { ActionsPanel } from "./ActionsPanel"
import { useAccountStore } from "../../store/account-store"

export function ConfigPanel() {
  const current = useAccountStore((s) => s.current)
  const actionOutcomes = useAccountStore((s) => s.actionOutcomes)
  const hasPreparedState = Boolean(actionOutcomes.refreshState?.ok || current)
  const steps = [
    {
      label: "1. Prepare",
      done: hasPreparedState,
    },
    {
      label: "2. Offramp",
      done: Boolean(actionOutcomes.offramp?.ok),
    },
    {
      label: "3. Onramp",
      done: Boolean(actionOutcomes.onramp?.ok),
    },
    {
      label: "4. FX",
      done: Boolean(actionOutcomes.fx?.ok),
    },
  ]

  return (
    <aside className="flex flex-col gap-4">
      <section className="card">
        <div className="card-title">Recommended flow</div>
        <div className="grid grid-cols-2 gap-2">
          {steps.map((step) => (
            <div key={step.label} className="flow-overview-item">
              <span
                className={`flow-overview-dot ${step.done ? "flow-overview-dot-done" : ""}`}
              />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </section>
      <ConfigForm />
      <ActionsPanel />
    </aside>
  )
}

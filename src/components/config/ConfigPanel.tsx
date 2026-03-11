import { ConfigForm } from "./ConfigForm"
import { ActionsPanel } from "./ActionsPanel"

export function ConfigPanel() {
  return (
    <aside className="flex flex-col gap-4">
      <ConfigForm />
      <ActionsPanel />
    </aside>
  )
}

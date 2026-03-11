import { Header } from "./components/layout/Header"
import { ConfigPanel } from "./components/config/ConfigPanel"
import { ConsolePanel } from "./components/console/ConsolePanel"
import { StatusPanel } from "./components/status/StatusPanel"

export function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="layout-grid">
        <ConfigPanel />
        <ConsolePanel />
        <StatusPanel />
      </main>
    </div>
  )
}

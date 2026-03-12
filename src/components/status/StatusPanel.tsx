import { ProfileSection } from "./ProfileSection"
import { BalanceSection } from "./BalanceSection"
import { CardInfoSection } from "./CardInfoSection"

export function StatusPanel() {
  return (
    <aside id="tour-status-panel" className="flex flex-col gap-4">
      <section className="card min-h-[280px]">
        <div className="card-title">User&apos;s UR Account Status</div>
        <ProfileSection />
        <BalanceSection title="Crypto balance" type="crypto" />
        <BalanceSection title="Fiat balance" type="fiat" />
      </section>
      <CardInfoSection />
    </aside>
  )
}

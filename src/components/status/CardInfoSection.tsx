import { StatusRow } from "./StatusRow"

const CARD_ROWS = [
  "Masked Number",
  "Secure Token",
  "Expire Date",
  "Daily Limit",
  "Monthly Limit",
]

export function CardInfoSection() {
  return (
    <section className="card mt-0.5">
      <div className="card-title">Card info</div>
      <p className="card-copy">
        This sandbox focuses on the delegated-mode core banking APIs from the
        quick start guide. Card details are left as placeholders.
      </p>
      <div className="flex flex-col gap-2">
        {CARD_ROWS.map((label) => (
          <StatusRow key={label} label={label} value="—" />
        ))}
      </div>
    </section>
  )
}

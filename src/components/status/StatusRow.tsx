interface StatusRowProps {
  label: string
  value: string
  isFlashing?: boolean
}

export function StatusRow({ label, value, isFlashing }: StatusRowProps) {
  return (
    <div
      className={`status-row ${isFlashing ? "animate-flash-row" : ""}`}
    >
      <span className="text-muted text-sm">{label}</span>
      <strong className="text-right break-all">{value || "—"}</strong>
    </div>
  )
}

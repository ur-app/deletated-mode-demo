import { useAccountStore } from "../../store/account-store"
import { StatusRow } from "./StatusRow"
import type { BalanceItem } from "../../types"

const EMPTY: BalanceItem[] = []

interface BalanceSectionProps {
  title: string
  type: "crypto" | "fiat"
}

export function BalanceSection({ title, type }: BalanceSectionProps) {
  const items =
    useAccountStore((s) =>
      type === "crypto"
        ? s.current?.balances?.crypto
        : s.current?.balances?.fiat,
    ) ?? EMPTY
  const changedKeys = useAccountStore((s) => s.changedKeys)

  return (
    <>
      <div className="status-section-title">{title}</div>
      <div className="flex flex-col gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <StatusRow
              key={item.symbol}
              label={item.symbol}
              value={item.display}
              isFlashing={changedKeys.has(`${type}:${item.symbol}`)}
            />
          ))
        ) : (
          <StatusRow label="—" value="0" />
        )}
      </div>
    </>
  )
}

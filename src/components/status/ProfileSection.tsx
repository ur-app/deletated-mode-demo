import { useAccountStore } from "../../store/account-store"
import { StatusRow } from "./StatusRow"

const PROFILE_ROWS: { label: string; key: string; field: string }[] = [
  { label: "URID", key: "profile:urid", field: "urId" },
  { label: "URID Status", key: "profile:status", field: "statusLabel" },
  { label: "UR Account", key: "profile:account", field: "evmAddress" },
  { label: "Partner signer", key: "profile:partner", field: "partnerPublicKey" },
  { label: "Used Limit", key: "profile:usedLimit", field: "usedLimitDisplay" },
  { label: "Monthly Limit", key: "profile:clientLimit", field: "clientLimitDisplay" },
  { label: "KYC Step", key: "profile:kycStep", field: "kycCurrentStepStr" },
  { label: "KYC Retry", key: "profile:kycRetry", field: "kycRetryVerificationLevelStr" },
]

export function ProfileSection() {
  const profile = useAccountStore((s) => s.current?.profile)
  const changedKeys = useAccountStore((s) => s.changedKeys)

  return (
    <>
      <div className="status-section-title">User profile</div>
      <div className="flex flex-col gap-2">
        {PROFILE_ROWS.map(({ label, key, field }) => (
          <StatusRow
            key={key}
            label={label}
            value={
              profile
                ? String(profile[field as keyof typeof profile] ?? "—")
                : "Empty"
            }
            isFlashing={changedKeys.has(key)}
          />
        ))}
      </div>
    </>
  )
}

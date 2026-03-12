import { useState } from "react"
import {
  getActionMissingFieldLabels,
  getConfigFieldErrors,
  useConfigStore,
} from "../../store/config-store"
import { useAccountStore } from "../../store/account-store"
import { useAction } from "../../hooks/use-action"
import { CHAIN_OPTIONS } from "../../constants"
import type { ConfigFieldErrors } from "../../types"

export function ConfigForm() {
  const store = useConfigStore()
  const isBusy = useAccountStore((s) => s.isBusy)
  const { runAction } = useAction()
  const [showKey, setShowKey] = useState(false)
  const fieldErrors = getConfigFieldErrors({
    partnerPrivateKey: store.partnerPrivateKey,
    urId: store.urId,
    userAddress: store.userAddress,
    chainId: store.chainId,
    offrampAmount: store.offrampAmount,
    onrampAmount: store.onrampAmount,
    fxAmount: store.fxAmount,
  })
  const refreshMissingFields = getActionMissingFieldLabels(
    {
      partnerPrivateKey: store.partnerPrivateKey,
      urId: store.urId,
      userAddress: store.userAddress,
      chainId: store.chainId,
      offrampAmount: store.offrampAmount,
      onrampAmount: store.onrampAmount,
      fxAmount: store.fxAmount,
    },
    "refreshState",
  )
  const isRefreshReady = refreshMissingFields.length === 0

  function renderTextField({
    name,
    label,
    value,
    placeholder,
    hint,
  }: {
    name: keyof ConfigFieldErrors
    label: string
    value: string
    placeholder?: string
    hint?: string
  }) {
    const hasError = Boolean(fieldErrors[name])

    return (
      <div className="field-group">
        <label>{label}</label>
        <input
          type="text"
          className={`input-field ${hasError ? "input-field-error" : ""}`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => store.setField(name, e.target.value)}
        />
        {fieldErrors[name] ? (
          <small className="field-error">{fieldErrors[name]}</small>
        ) : hint ? (
          <small className="text-muted text-xs mt-1">{hint}</small>
        ) : null}
      </div>
    )
  }

  return (
    <section className="card" data-tour="step-prepare">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="step-kicker">Step 1</div>
          <div className="card-title !mb-1">Prepare signer and account context</div>
        </div>
        <span className={`step-badge ${isRefreshReady ? "step-badge-ready" : "step-badge-pending"}`}>
          {isRefreshReady ? "Ready" : "Input needed"}
        </span>
      </div>
      <p className="card-copy">
        Fill in the partner key, URID, user address, and chain first, then click
        `Fetch account info and balances` to load the latest profile and balances.
        Offramp, Onramp, and FX all depend on this step.
      </p>

      <div className="card-section-label">Required inputs</div>

      <div className="field-group">
        <label>Base URL</label>
        <input
          type="text"
          className="input-field text-slate-400"
          value={store.baseUrl}
          readOnly
        />
        <small className="text-muted text-xs mt-1">
          Requests are proxied to avoid browser CORS restrictions
        </small>
      </div>

      <div className="field-group">
        <label>Demo Partner Private Key</label>
        <div className="grid grid-cols-[1fr_auto] gap-2.5">
          <input
            id="tour-partner-private-key"
            type={showKey ? "text" : "password"}
            className={`input-field ${fieldErrors.partnerPrivateKey ? "input-field-error" : ""}`}
            placeholder="Paste the demo partner key from the quick start guide"
            value={store.partnerPrivateKey}
            onChange={(e) => store.setField("partnerPrivateKey", e.target.value)}
          />
          <button
            type="button"
            className="ghost-btn px-4"
            disabled={isBusy}
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
        {fieldErrors.partnerPrivateKey ? (
          <small className="field-error">{fieldErrors.partnerPrivateKey}</small>
        ) : (
          <small className="text-muted text-xs mt-1">
            Use only the sandbox/demo partner key. Do not enter a production key.
          </small>
        )}
      </div>

      {renderTextField({
        name: "urId",
        label: "User URID",
        value: store.urId,
        placeholder: "e.g. 7639951412",
      })}

      {renderTextField({
        name: "userAddress",
        label: "User Address",
        value: store.userAddress,
        placeholder: "0x...",
      })}

      <div className="grid grid-cols-2 gap-3">
        <div className="field-group">
          <label>Chain ID</label>
          <select
            className={`input-field ${fieldErrors.chainId ? "input-field-error" : ""}`}
            value={store.chainId}
            onChange={(e) => store.setField("chainId", e.target.value)}
          >
            {CHAIN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {fieldErrors.chainId && (
            <small className="field-error">{fieldErrors.chainId}</small>
          )}
        </div>
        <div className="field-group">
          <label>Derived Partner Public Key</label>
          <input
            type="text"
            className="input-field text-slate-400"
            value={store.partnerPublicKey}
            readOnly
          />
          <small className="text-muted text-xs mt-1">
            The signer address derived from the partner key will appear here after a successful request
          </small>
        </div>
      </div>

      <div className="card-section-label mt-1">Transaction parameters</div>
      <div className="grid grid-cols-3 gap-3">
        {renderTextField({
          name: "offrampAmount",
          label: "Offramp Amount",
          value: store.offrampAmount,
          hint: "Example: 5 USDC = 5000000",
        })}
        {renderTextField({
          name: "onrampAmount",
          label: "Onramp Amount",
          value: store.onrampAmount,
          hint: "Example: 10.00 USD = 1000",
        })}
        {renderTextField({
          name: "fxAmount",
          label: "FX Amount",
          value: store.fxAmount,
          hint: "Example: 5.00 USD = 500",
        })}
      </div>

      <div className="card-section-label mt-1">Next action</div>
      <div className="flex gap-2.5 flex-wrap items-start">
        <button
          type="button"
          className="ghost-btn"
          disabled={isBusy}
          onClick={store.loadDefaults}
        >
          Load quick start defaults
        </button>
        <button
          id="tour-refresh-state"
          type="button"
          className="ghost-btn"
          disabled={isBusy || !isRefreshReady}
          onClick={() => runAction("refreshState")}
        >
          Fetch account info and balances
        </button>
      </div>
      {isRefreshReady ? (
        <small className="text-emerald-300 text-xs mt-2 block">
          Inputs are ready. Fetch account info and balances before continuing.
        </small>
      ) : (
        <small className="text-amber-300 text-xs mt-2 block">
          Step 1 is not ready yet. Please complete: {refreshMissingFields.join(", ")}
        </small>
      )}
    </section>
  )
}

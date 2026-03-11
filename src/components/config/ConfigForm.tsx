import { useState } from "react"
import { useConfigStore } from "../../store/config-store"
import { useAccountStore } from "../../store/account-store"
import { useAction } from "../../hooks/use-action"
import { CHAIN_OPTIONS } from "../../constants"

export function ConfigForm() {
  const store = useConfigStore()
  const isBusy = useAccountStore((s) => s.isBusy)
  const { runAction } = useAction()
  const [showKey, setShowKey] = useState(false)

  const field = (name: string, value: string) => (
    <input
      type="text"
      className="input-field"
      value={value}
      onChange={(e) => store.setField(name, e.target.value)}
    />
  )

  return (
    <section className="card">
      <div className="card-title">Input test accounts</div>
      <p className="card-copy">
        This sandbox signs UR partner-auth requests in your browser using viem.
        Use only the sandbox/demo partner key from the quick start guide.
      </p>

      <div className="field-group">
        <label>Base URL</label>
        <input
          type="text"
          className="input-field text-slate-400"
          value={store.baseUrl}
          readOnly
        />
        <small className="text-muted text-xs mt-1">
          Requests are proxied via Cloudflare to avoid CORS
        </small>
      </div>

      <div className="field-group">
        <label>Demo Partner Private Key</label>
        <div className="grid grid-cols-[1fr_auto] gap-2.5">
          <input
            type={showKey ? "text" : "password"}
            className="input-field"
            placeholder="Paste the demo partner key here"
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
      </div>

      <div className="field-group">
        <label>User URID</label>
        {field("urId", store.urId)}
      </div>

      <div className="field-group">
        <label>User Address</label>
        {field("userAddress", store.userAddress)}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="field-group">
          <label>Chain ID</label>
          <select
            className="input-field"
            value={store.chainId}
            onChange={(e) => store.setField("chainId", e.target.value)}
          >
            {CHAIN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label>Derived Partner Public Key</label>
          <input
            type="text"
            className="input-field text-slate-400"
            value={store.partnerPublicKey}
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="field-group">
          <label>Offramp Amount</label>
          {field("offrampAmount", store.offrampAmount)}
          <small className="text-muted text-xs mt-1">5 USDC = 5000000</small>
        </div>
        <div className="field-group">
          <label>Onramp Amount</label>
          {field("onrampAmount", store.onrampAmount)}
          <small className="text-muted text-xs mt-1">10.00 USD = 1000</small>
        </div>
        <div className="field-group">
          <label>FX Amount</label>
          {field("fxAmount", store.fxAmount)}
          <small className="text-muted text-xs mt-1">5.00 USD = 500</small>
        </div>
      </div>

      <div className="flex gap-2.5 flex-wrap">
        <button
          type="button"
          className="ghost-btn"
          disabled={isBusy}
          onClick={store.loadDefaults}
        >
          Load quick start defaults
        </button>
        <button
          type="button"
          className="ghost-btn"
          disabled={isBusy}
          onClick={() => runAction("refreshState")}
        >
          Refresh state
        </button>
      </div>
    </section>
  )
}

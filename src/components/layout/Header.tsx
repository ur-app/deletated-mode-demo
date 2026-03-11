import { useAccountStore } from "../../store/account-store"

const toneClasses: Record<string, string> = {
  neutral:
    "border-slate-600/20 bg-slate-900/70 text-muted",
  busy: "border-yellow-500/35 bg-yellow-500/[0.18] text-white",
  success: "border-green-600/36 bg-green-600/20 text-white",
  error: "border-red-600/36 bg-red-600/20 text-white",
}

export function Header() {
  const statusText = useAccountStore((s) => s.statusText)
  const statusTone = useAccountStore((s) => s.statusTone)

  return (
    <header className="flex items-start justify-between gap-6 mb-5">
      <div>
        <div className="flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-700 to-violet-500 inline-flex items-center justify-center font-extrabold tracking-wide text-sm">
            UR
          </span>
          <h1 className="text-2xl font-bold">
            Delegated Mode Demo Sandbox
          </h1>
        </div>
        <p className="mt-2.5 text-muted max-w-[900px] leading-relaxed">
          Paste the Partner private key from the quick start guide, the user
          URID, and the user address. Then trigger delegated-mode core banking
          actions and inspect the API calls and resulting account state.
        </p>
      </div>
      <div
        className={`shrink-0 border rounded-full px-3.5 py-2.5 font-semibold text-sm ${toneClasses[statusTone] ?? toneClasses.neutral}`}
      >
        {statusText}
      </div>
    </header>
  )
}

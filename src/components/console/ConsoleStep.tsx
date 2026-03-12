import type { ApiStep } from "../../types"
import { extractApiCode, isStepSuccess } from "../../lib/utils"
import { getStepGuidance } from "../../lib/errors"

interface ConsoleStepProps {
  step: ApiStep
  index: number
}

export function ConsoleStep({ step, index }: ConsoleStepProps) {
  const successful = isStepSuccess(step)
  const code = extractApiCode(step.responseBody)

  const statusLabel = `${step.responseStatus} ${
    successful ? "OK" : code !== undefined ? `API Error (${code})` : "Error"
  }`
  const guidance = getStepGuidance(step)

  const baseUrlDisplay = step.url.includes("/v1/")
    ? step.url.split("/v1/")[0]
    : step.url

  return (
    <section className="console-step">
      <div className="flex justify-between items-center gap-3 mb-3">
        <h3 className="font-semibold text-base m-0">
          Step {index + 1}: {step.endpoint}
        </h3>
        <span
          className={`text-xs rounded-full px-2.5 py-1.5 whitespace-nowrap ${
            successful
              ? "bg-green-600/[0.16] text-green-300"
              : "bg-red-600/[0.18] text-red-200"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div
        className={`rounded-xl px-3.5 py-3 text-sm mb-3 ${
          successful
            ? "bg-emerald-500/10 border border-emerald-400/20 text-emerald-100"
            : "bg-red-500/10 border border-red-400/20 text-red-100"
        }`}
      >
        {guidance}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="console-label">Base URL</div>
          <pre className="console-block">{baseUrlDisplay}</pre>
        </div>
        <div>
          <div className="console-label">Request URL</div>
          <pre className="console-block">{step.url}</pre>
        </div>
        <div>
          <div className="console-label">Headers</div>
          <pre className="console-block">
            {JSON.stringify(step.requestHeaders, null, 2)}
          </pre>
        </div>
        <div>
          <div className="console-label">Request Body</div>
          <pre className="console-block">
            {JSON.stringify(step.requestBody, null, 2)}
          </pre>
        </div>
        <div className="col-span-2">
          <div className="console-label">Response</div>
          <pre className="console-block">
            {JSON.stringify(step.responseBody, null, 2)}
          </pre>
        </div>
      </div>

      {step.explorerUrl && (
        <div className="flex justify-end mt-3">
          <a
            href={step.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="text-violet-300 text-sm hover:underline"
          >
            Open transaction in explorer
          </a>
        </div>
      )}
    </section>
  )
}

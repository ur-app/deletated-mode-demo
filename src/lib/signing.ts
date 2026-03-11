import { privateKeyToAccount } from "viem/accounts"
import type { Hex } from "viem"
import type { ApiStep, SignedPostParams } from "../types"
import { buildExplorerUrl, getTxHashFromBody } from "./utils"

export function normalizePrivateKey(value: string): Hex {
  if (!value || typeof value !== "string")
    throw new Error("Partner private key is required.")
  const trimmed = value.trim()
  return (trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`) as Hex
}

export async function signedPost({
  baseUrl,
  proxyBaseUrl,
  endpoint,
  body,
  partnerPrivateKey,
}: SignedPostParams): Promise<ApiStep> {
  const account = privateKeyToAccount(normalizePrivateKey(partnerPrivateKey))
  const deadline = Math.floor(Date.now() / 1000) + 300
  const rawBody = JSON.stringify(body)
  const messageToSign = `${rawBody} ${deadline}`
  const signature = await account.signMessage({ message: messageToSign })

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Api-Signature": signature,
    "X-Api-Deadline": String(deadline),
    "X-Api-PublicKey": account.address,
  }

  const fetchUrl = proxyBaseUrl || baseUrl
  const response = await fetch(`${fetchUrl}${endpoint}`, {
    method: "POST",
    headers,
    body: rawBody,
  })

  const responseText = await response.text()
  let responseBody: Record<string, unknown>
  try {
    responseBody = JSON.parse(responseText)
  } catch {
    responseBody = { raw: responseText }
  }

  return {
    ok: response.ok,
    endpoint,
    url: `${baseUrl}${endpoint}`,
    requestHeaders: headers,
    requestBody: body,
    responseStatus: response.status,
    responseBody,
    explorerUrl: buildExplorerUrl(
      (body.chainId || body.dstChainId) as string,
      getTxHashFromBody(responseBody),
    ),
  }
}

export function getPublicKeyFromPrivate(partnerPrivateKey: string): string {
  const account = privateKeyToAccount(normalizePrivateKey(partnerPrivateKey))
  return account.address
}

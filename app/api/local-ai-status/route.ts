import { NextResponse } from "next/server"

// Phase 1, Block 1: Detect local Ollama availability and report health
// Smallest change: expose a simple status endpoint consumed by existing UI

const DEFAULT_OLLAMA_BASE = "http://localhost:11434"
const TAGS_PATH = "/api/tags"
const TIMEOUT_MS = 5000

type Status = "reachable" | "unavailable" | "error"

export async function GET() {
  const baseUrl = process.env.OLLAMA_BASE_URL?.trim() || DEFAULT_OLLAMA_BASE
  const url = `${baseUrl}${TAGS_PATH}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let available = false as boolean
  let status: Status = "unavailable"
  let error: string | undefined

  try {
    const res = await fetch(url, { method: "GET", signal: controller.signal })
    clearTimeout(timeoutId)

    if (res.ok) {
      available = true
      status = "reachable"
    } else {
      available = false
      status = "error"
      error = `HTTP ${res.status}`
    }
  } catch (e: unknown) {
    clearTimeout(timeoutId)
    available = false
    status = "unavailable"
    error = e instanceof Error ? e.message : "connection failed"
  }

  // Keep backward-compat field `localAIAvailable` for existing UI, while also
  // returning a structured status object for newer consumers.
  return NextResponse.json({
    // Structured fields
    available,
    status,
    provider: "ollama",
    baseUrl,
    ...(error ? { error } : {}),
    // Legacy compatibility
    localAIAvailable: available,
  })
}

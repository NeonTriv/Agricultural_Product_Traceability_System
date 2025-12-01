import type { TraceResponse } from '../types/trace'

/**
 * Fetch product traceability information by QR code
 * This connects to the backend API endpoint: /api/trace/:code
 *
 * @param baseUrl - Backend server URL (e.g., http://localhost:5001)
 * @param code - QR code value to lookup
 * @returns TraceResponse with product, batch, farm, processing, distributor, and price data
 */
export async function fetchTraceByCode(
  baseUrl: string,
  code: string
): Promise<TraceResponse> {
  const url = `${baseUrl}/api/trace/${encodeURIComponent(code)}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

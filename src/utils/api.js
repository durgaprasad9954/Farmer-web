/* ─── API Utilities ─────────────────────────────────────────────────────── */
const BASE_URL = 'https://newapi.alumnx.com/agrigpt/fastapi/'

/**
 * Send a text query to AgriGPT
 * @param {string} query - User's text question
 * @param {string} phone - User identifier (defaults to demo)
 * @returns {Promise<string>} AI response text
 */
export async function sendTextQuery(query, phone = '919999999999') {
  const params = new URLSearchParams({ query, phone })
  const res = await fetch(`${BASE_URL}/query-text?${params}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  // Normalize response - API may return { response }, { answer }, or plain string
  return data?.response ?? data?.answer ?? data?.message ?? JSON.stringify(data)
}

/**
 * Send an image (with optional text query) to AgriGPT for crop diagnosis
 * @param {File} file - Image file
 * @param {string} query - Optional question about the image
 * @param {string} phone - User identifier
 * @returns {Promise<string>} AI response text
 */
export async function sendImageQuery(file, query = 'What crop disease or issue do you see?', phone = '919999999999') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('query', query)
  formData.append('phone', phone)

  const res = await fetch(`${BASE_URL}/query-text`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  return data?.response ?? data?.answer ?? data?.message ?? JSON.stringify(data)
}

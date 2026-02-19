/**
 * API service for AgriGPT backend
 * Docs: https://newapi.alumnx.com/agrigpt/fastapi/docs
 */
const BASE_URL = 'https://newapi.alumnx.com/agrigpt/fastapi'

/** Extract response text from various API response shapes */
function extractText(data) {
  return data.response || data.answer || data.message || data.result || JSON.stringify(data)
}

/**
 * Send a plain-text farming query to AgriGPT
 * @param {string} query
 * @param {string} lang - en | hi | te
 */
export async function sendTextQuery(query, lang = 'en') {
  const formData = new FormData()
  formData.append('query', query)
  formData.append('language', lang)

  const res = await fetch(`${BASE_URL}/query-text`, { method: 'POST', body: formData })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Server error ${res.status}`)
  }
  return extractText(await res.json())
}

/**
 * Send an image (with optional text query) for crop diagnosis
 * @param {File} imageFile
 * @param {string} query - optional
 * @param {string} lang - en | hi | te
 */
export async function sendImageQuery(imageFile, query = '', lang = 'en') {
  const formData = new FormData()
  formData.append('file', imageFile)
  if (query.trim()) formData.append('query', query)
  formData.append('language', lang)

  const res = await fetch(`${BASE_URL}/query-image-upload`, { method: 'POST', body: formData })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Server error ${res.status}`)
  }
  return extractText(await res.json())
}

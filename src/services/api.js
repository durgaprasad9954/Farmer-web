import API_CONFIG from '../config/api.config.js'

const BASE_URL = API_CONFIG.BASE_URL
const IMAGE_BASE_URL = 'http://13.200.178.118:8008'

function extractResponse(data) {
  if (typeof data === 'string') return data
  if (data.response) return data.response
  if (data.message) return data.message
  if (data.answer) return data.answer
  if (data.result) return data.result
  if (data.results && Array.isArray(data.results)) {
    return data.results.map((r, i) => `${i + 1}. ${r.disease || r.name || JSON.stringify(r)}`).join('\n\n')
  }
  return JSON.stringify(data, null, 2)
}

export async function sendTextQuery(phoneNumber, query) {
  const response = await fetch(`${BASE_URL}${API_CONFIG.ENDPOINTS.WHATSAPP}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, message: query }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(errorText || `Request failed with status ${response.status}`)
  }

  const data = await response.json()
  return extractResponse(data)
}

export async function sendImageQuery(imageFile, phoneNumber, query, topK = 5) {
  const formData = new FormData()
  formData.append('file', imageFile)
  formData.append('phone_number', phoneNumber)
  formData.append('query', query)

  const response = await fetch(`${IMAGE_BASE_URL}/query-image-upload?top_k=${topK}`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(errorText || `Upload failed with status ${response.status}`)
  }

  const data = await response.json()
  return extractResponse(data)
}

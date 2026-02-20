import API_CONFIG from '../config/api.config.js'

const BASE_URL = API_CONFIG.BASE_URL
const IMAGE_BASE_URL = API_CONFIG.IMAGE_BASE_URL

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
  try {
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
  } catch (error) {
    console.error('Text query error:', error)
    throw new Error(`Failed to send query: ${error.message}`)
  }
}

export async function sendImageQuery(imageFile, phoneNumber, query, topK = 5) {
  const formData = new FormData()
  formData.append('file', imageFile)
  formData.append('phone_number', phoneNumber)
  formData.append('query', query)

  const imageUrl = `${IMAGE_BASE_URL}/query-image-upload?top_k=${topK}`
  
  try {
    const response = await fetch(imageUrl, {
      method: 'POST',
      mode: 'cors',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(errorText || `Upload failed with status ${response.status}`)
    }

    const data = await response.json()
    return extractResponse(data)
  } catch (error) {
    console.error('Image upload error:', error)
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to image server. The server may not support HTTPS requests or CORS is not enabled.')
    }
    
    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

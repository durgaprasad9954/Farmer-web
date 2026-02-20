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

  // In production, use Vercel serverless proxy to avoid HTTPS/HTTP mixed content
  // In development, call backend directly
  const imageUrl = API_CONFIG.IMAGE_PROXY 
    ? `${API_CONFIG.IMAGE_PROXY}?top_k=${topK}`
    : `${IMAGE_BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_UPLOAD}?top_k=${topK}`
  
  console.log('[Image Upload] Sending to:', imageUrl)
  console.log('[Image Upload] Environment:', import.meta.env.PROD ? 'production' : 'development')
  console.log('[Image Upload] File:', imageFile.name, imageFile.type, imageFile.size, 'bytes')
  
  try {
    const response = await fetch(imageUrl, {
      method: 'POST',
      mode: 'cors',
      body: formData,
    })

    console.log('[Image Upload] Response status:', response.status, response.statusText)
    console.log('[Image Upload] Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error('[Image Upload] Error response:', errorText)
      throw new Error(errorText || `Upload failed with status ${response.status}`)
    }

    const data = await response.json()
    console.log('[Image Upload] Success response:', data)
    return extractResponse(data)
  } catch (error) {
    console.error('[Image Upload] Exception caught:', error)
    console.error('[Image Upload] Error stack:', error.stack)
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to image server. Please check if the backend is accessible and CORS is properly configured.')
    }
    
    if (error.message.includes('NOT_FOUND') || error.message.includes('404')) {
      throw new Error('Image upload endpoint not found. The proxy route may not be configured correctly.')
    }
    
    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

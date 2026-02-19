/**
 * API service for AgriGPT backend
 * Docs: https://newapi.alumnx.com/agrigpt/fastapi/docs
 */

import API_CONFIG from '../config/api.config.js'

const BASE_URL = API_CONFIG.BASE_URL

/**
 * Get or generate a phone number for the current session
 * Uses localStorage to persist across page reloads
 */
function getPhoneNumber() {
  const STORAGE_KEY = API_CONFIG.STORAGE_KEYS.PHONE_NUMBER
  let phoneNumber = localStorage.getItem(STORAGE_KEY)
  
  if (!phoneNumber) {
    // Generate a unique phone number based on timestamp and random number
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    phoneNumber = `${API_CONFIG.PHONE.COUNTRY_CODE}${timestamp}${random}`.slice(0, API_CONFIG.PHONE.LENGTH)
    localStorage.setItem(STORAGE_KEY, phoneNumber)
  }
  
  return phoneNumber
}

/**
 * Extract response message from API response
 */
function extractMessage(data) {
  return data?.message || data?.response || data?.answer || data?.result || JSON.stringify(data)
}

/**
 * Send a message to the WhatsApp bot endpoint
 * @param {string} message - The message to send
 * @returns {Promise<string>} - The bot's response message
 */
async function sendWhatsAppMessage(message) {
  const phoneNumber = getPhoneNumber()
  
  const response = await fetch(`${BASE_URL}${API_CONFIG.ENDPOINTS.WHATSAPP}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      phoneNumber,
      message,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(errorText || `Server error ${response.status}`)
  }

  const data = await response.json()
  return extractMessage(data)
}

/**
 * Send a plain-text farming query to AgriGPT
 * @param {string} query - User's question
 * @param {string} lang - Language code (en | hi | te)
 * @returns {Promise<string>} - AI response
 */
export async function sendTextQuery(query, lang = 'en') {
  // Format message with language preference
  const message = lang !== 'en' 
    ? `[Language: ${lang}] ${query}` 
    : query
  
  return sendWhatsAppMessage(message)
}

/**
 * Send an image query for crop diagnosis
 * Note: The current API only accepts text messages. For image handling,
 * we'll need to either convert to base64 or use a different approach.
 * 
 * @param {File} imageFile - Image file to analyze
 * @param {string} query - Optional text query about the image
 * @param {string} lang - Language code (en | hi | te)
 * @returns {Promise<string>} - AI response
 */
export async function sendImageQuery(imageFile, query = '', lang = 'en') {
  // Convert image to base64
  const base64Image = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(imageFile)
  })

  // Format message with image data and query
  const message = {
    type: 'image',
    language: lang,
    query: query || 'Analyze this crop image and provide diagnosis',
    image: base64Image,
    filename: imageFile.name,
  }

  try {
    // Try sending as JSON stringified message
    return await sendWhatsAppMessage(JSON.stringify(message))
  } catch (error) {
    // If that fails, try the alternative FormData approach
    // (in case there are undocumented endpoints)
    return await sendImageQueryFormData(imageFile, query, lang)
  }
}

/**
 * Fallback method to send image using FormData
 * (for undocumented endpoints that might exist)
 */
async function sendImageQueryFormData(imageFile, query = '', lang = 'en') {
  const formData = new FormData()
  formData.append('file', imageFile)
  formData.append('query', query || 'Analyze this crop image and provide diagnosis')
  formData.append('language', lang)
  formData.append('phone', getPhoneNumber())

  const response = await fetch(`${BASE_URL}/query-image-upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(errorText || `Image upload failed with status ${response.status}`)
  }

  const data = await response.json()
  return extractMessage(data)
}

/**
 * Reset the stored phone number (for testing/debugging)
 */
export function resetPhoneNumber() {
  localStorage.removeItem(API_CONFIG.STORAGE_KEYS.PHONE_NUMBER)
}

/**
 * Get the current session's phone number
 * @returns {string} - The phone number
 */
export function getCurrentPhoneNumber() {
  return getPhoneNumber()
}

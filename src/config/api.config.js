/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  // Base URL for the AgriGPT backend
  BASE_URL: 'https://newapi.alumnx.com/agrigpt/fastapi',
  
  // Image upload base URL (use HTTPS in production)
  IMAGE_BASE_URL: import.meta.env.PROD 
    ? 'https://newapi.alumnx.com/agrigpt/fastapi' 
    : 'http://13.200.178.118:8008',
  
  // API endpoints
  ENDPOINTS: {
    WHATSAPP: '/whatsapp',
    IMAGE_UPLOAD: '/query-image-upload',
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // Initial delay in ms
    BACKOFF_MULTIPLIER: 2, // Exponential backoff
  },
  
  // Supported languages
  LANGUAGES: {
    ENGLISH: 'en',
    HINDI: 'hi',
    TELUGU: 'te',
  },
  
  // LocalStorage keys
  STORAGE_KEYS: {
    PHONE_NUMBER: 'agrigpt_phone_number',
    USER_PREFERENCES: 'agrigpt_user_preferences',
    CHAT_HISTORY: 'agrigpt_chat_history',
  },
  
  // Phone number generation config
  PHONE: {
    COUNTRY_CODE: '91', // India
    LENGTH: 12, // Total length including country code
  },
  
  // Image upload settings
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    COMPRESSION_QUALITY: 0.9,
  },
}

// Environment-specific overrides
if (import.meta.env.DEV) {
  // Development mode settings
  API_CONFIG.TIMEOUT = 60000 // Longer timeout for dev
}

export default API_CONFIG

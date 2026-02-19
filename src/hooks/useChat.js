import { useState, useCallback } from 'react'
import { sendTextQuery, sendImageQuery } from '../services/api'

export function useChat(lang = 'en') {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const appendMessage = useCallback((role, content, imageUrl = null) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now() + Math.random(), role, content, imageUrl, timestamp: new Date() },
    ])
  }, [])

  const sendText = useCallback(async (text) => {
    if (!text.trim()) return
    setError(null)
    appendMessage('user', text)
    setIsLoading(true)
    try {
      const reply = await sendTextQuery(text, lang)
      appendMessage('assistant', reply)
    } catch (err) {
      setError(err.message || 'Failed to get response')
    } finally {
      setIsLoading(false)
    }
  }, [lang, appendMessage])

  const sendImage = useCallback(async (file, caption = '') => {
    setError(null)
    const imageUrl = URL.createObjectURL(file)
    appendMessage('user', caption || '📷 Photo sent for analysis', imageUrl)
    setIsLoading(true)
    try {
      const reply = await sendImageQuery(file, caption, lang)
      appendMessage('assistant', reply)
    } catch (err) {
      setError(err.message || 'Failed to analyze image')
    } finally {
      setIsLoading(false)
    }
  }, [lang, appendMessage])

  const clearError = useCallback(() => setError(null), [])
  return { messages, isLoading, error, sendText, sendImage, clearError }
}

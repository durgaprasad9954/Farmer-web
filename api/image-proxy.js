/**
 * Vercel Serverless Function to proxy image requests from HTTP backend
 * This solves the Mixed Content issue: Vercel is HTTPS but backend serves images
 * over HTTP, which browsers block. This proxy fetches images server-side and
 * delivers them over HTTPS to the browser.
 */

import fetch from 'node-fetch'

const ALLOWED_HOST = '13.200.178.118:8008'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' })
  }

  // Decode in case it was double-encoded
  const decodedUrl = decodeURIComponent(url)

  // Security: only allow proxying from the known backend host
  let parsedUrl
  try {
    parsedUrl = new URL(decodedUrl)
  } catch {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  if (parsedUrl.host !== ALLOWED_HOST) {
    console.error('[ImageProxy] Blocked request to unauthorized host:', parsedUrl.host)
    return res.status(403).json({ error: 'Forbidden: unauthorized image host' })
  }

  try {
    console.log('[ImageProxy] Fetching:', decodedUrl)
    const response = await fetch(decodedUrl, { timeout: 15000 })

    if (!response.ok) {
      console.error('[ImageProxy] Backend returned:', response.status)
      return res.status(response.status).json({ error: 'Image not found on backend' })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = await response.buffer()

    // Cache images for 1 day (86400s) to reduce repeated backend calls
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600')
    res.setHeader('Content-Length', buffer.length)
    return res.status(200).send(buffer)
  } catch (error) {
    console.error('[ImageProxy] Error fetching image:', error.message)
    return res.status(500).json({ error: 'Failed to proxy image: ' + error.message })
  }
}

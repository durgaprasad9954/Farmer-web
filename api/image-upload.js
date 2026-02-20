import fetch from 'node-fetch'
import FormData from 'form-data'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const topK = req.query.top_k || '5'
    const chunks = []
    
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    
    const buffer = Buffer.concat(chunks)
    
    const response = await fetch(`http://13.200.178.118:8008/query-image-upload?top_k=${topK}`, {
      method: 'POST',
      headers: req.headers,
      body: buffer,
    })

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return res.status(500).json({ error: error.message })
  }
}

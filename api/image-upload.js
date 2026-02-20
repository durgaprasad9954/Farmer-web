export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const topK = req.query.top_k || '5'
    const formData = new FormData()
    
    // Forward the file and form fields
    if (req.body.file) formData.append('file', req.body.file)
    if (req.body.phone_number) formData.append('phone_number', req.body.phone_number)
    if (req.body.query) formData.append('query', req.body.query)

    const response = await fetch(`http://13.200.178.118:8008/query-image-upload?top_k=${topK}`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
    return res.status(response.status).json(data)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

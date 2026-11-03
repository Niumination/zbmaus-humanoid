export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, state } = req.body || {}

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' })
  }

  const endpoint = process.env.LLM_ENDPOINT || 'https://api.openai.com/v1/chat/completions'
  const apiKey = process.env.LLM_API_KEY || ''
  const model = process.env.LLM_MODEL || 'gpt-3.5-turbo'

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `Kamu adalah zbmaus-humanoid, asisten humanoid interaktif yang terhubung ke OMB (OpenMausBot). State saat ini: ${state || 'idle'}. Jawab dalam Bahasa Indonesia, singkat dan membantu. Kamu adalah asisten nyata, bukan chatbot biasa.`,
          },
          { role: 'user', content: message },
        ],
        max_tokens: 256,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      console.error('LLM API error:', response.status)
      return res.status(200).json({ reply: 'Maaf, terjadi kesalahan saat memproses pesan. Silakan coba lagi.' })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'Maaf, saya tidak bisa memproses pesan ini.'
    return res.status(200).json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    return res.status(200).json({ reply: 'Terjadi kesalahan jaringan. Silakan coba lagi.' })
  }
}

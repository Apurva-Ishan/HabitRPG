import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })
)

app.post('/api/claude', async (c) => {
  const apiKey = c.env?.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY
  if (!apiKey) {
    return c.json({ error: 'GEMINI_API_KEY not set' }, 500)
  }

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  // Translate Anthropic-shaped request → Gemini API
  const { system, messages, max_tokens } = body as {
    system?: string
    messages: { role: string; content: string }[]
    max_tokens?: number
  }

  // Gemini uses 'model' and 'user'/'model' roles (not 'assistant')
  const geminiMessages = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  // Prepend system prompt as a user/model exchange if present
  const contents = system
    ? [
        { role: 'user', parts: [{ text: system }] },
        { role: 'model', parts: [{ text: 'Understood.' }] },
        ...geminiMessages,
      ]
    : geminiMessages

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: max_tokens ?? 1024 },
      }),
    }
  )

  const geminiData = await geminiRes.json() as {
    candidates?: { content: { parts: { text: string }[] } }[]
    error?: { message: string }
  }

  if (!geminiRes.ok || geminiData.error) {
    return c.json({ error: geminiData.error?.message ?? 'Gemini error' }, 500)
  }

  const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Return Anthropic-shaped response so aiService.ts needs zero changes
  return c.json({
    content: [{ type: 'text', text }],
  })
})

app.get('/api/health', (c) => c.json({ ok: true }))

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  const { serve } = await import('@hono/node-server')
  serve({ fetch: app.fetch, port: 3000 }, () => {
    console.log('Proxy running at http://localhost:3000')
  })
}

export default app
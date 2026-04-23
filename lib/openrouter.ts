export interface ExtractedExpense {
  amount: number
  description: string
  date: string
  category: string
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout = 90000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

function parseJSONResponse(content: string): ExtractedExpense {
  const defaultResult: ExtractedExpense = {
    amount: 0,
    description: 'Sin descripción',
    date: new Date().toISOString().split('T')[0],
    category: 'Otros',
  }

  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed)
        return {
          amount: parsed.amount ?? defaultResult.amount,
          description: parsed.description ?? defaultResult.description,
          date: parsed.date ?? defaultResult.date,
          category: parsed.category ?? defaultResult.category,
        }
      } catch {
        continue
      }
    }
  }

  const amountMatch = content.match(/"amount":\s*(\d+(?:\.\d+)?)/)
  if (amountMatch) {
    defaultResult.amount = parseFloat(amountMatch[1])
  }

  const descMatch = content.match(/"description":\s*"([^"]+)"/)
  if (descMatch) {
    defaultResult.description = descMatch[1]
  }

  const dateMatch = content.match(/"date":\s*"(\d{4}-\d{2}-\d{2})"/)
  if (dateMatch) {
    defaultResult.date = dateMatch[1]
  }

  const catMatch = content.match(/"category":\s*"([^"]+)"/)
  if (catMatch) {
    defaultResult.category = catMatch[1]
  }

  return defaultResult
}

export async function processReceiptImage(imageBase64: string): Promise<ExtractedExpense> {
  const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY no está definida en .env')
  }

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

  const response = await fetchWithTimeout(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'GastoTrack',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analiza esta imagen de un receipt y extrae: amount (número), description (texto), date (YYYY-MM-DD), category (Comida|Transporte|Utilities|Entretenimiento|Salud|Shopping|Otros).
Responde SOLO con JSON válido, nada más.`
              },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64Data}` }
              }
            ]
          }
        ],
        max_tokens: 500,
      }),
    },
    90000
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter error: ${error}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No response from AI')
  }

  console.log('[OCR] Response:', content.substring(0, 200))

  return parseJSONResponse(content)
}
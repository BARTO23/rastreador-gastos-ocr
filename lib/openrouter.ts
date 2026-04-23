export interface ExtractedExpense {
  amount: number
  description: string
  date: string
  category: string
}

export async function processReceiptImage(imageBase64: string): Promise<ExtractedExpense> {
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'X-Title': 'GastoTrack',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analiza esta imagen de un receipt/ticket y extrae la información del gasto.
Responde SOLO con JSON (sin texto adicional):
{"amount": numero, "description": "texto", "date": "YYYY-MM-DD", "category": "Comida|Transporte|Utilities|Entretenimiento|Salud|Shopping|Otros"}
Si no ves monto: amount 0.
Si no hay fecha: usa hoy.
Categorías válidas: Comida, Transporte, Utilities, Entretenimiento, Salud, Shopping, Otros`
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
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter error: ${error}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No response from AI')
  }

  try {
    const start = content.indexOf('{')
    const end = content.lastIndexOf('}')
    if (start > -1 && end > -1) {
      const jsonStr = content.substring(start, end + 1)
      const parsed = JSON.parse(jsonStr)
      return {
        amount: parsed.amount ?? 0,
        description: parsed.description ?? 'Sin descripción',
        date: parsed.date ?? new Date().toISOString().split('T')[0],
        category: parsed.category ?? 'Otros',
      }
    }
    throw new Error('No JSON in response')
  } catch (err) {
    console.error('Parse error:', err, content)
    throw new Error('Error al procesar el receipt')
  }
}

export async function categorizeDescription(description: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'X-Title': 'GastoTrack',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'user',
          content: `Clasifica este gasto en una categoría. Responde SOLO con el nombre: Comida, Transporte, Utilities, Entretenimiento, Salud, Shopping, Otros
Descripción: "${description}"`
        }
      ],
      max_tokens: 20,
    }),
  })

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || 'Otros'
}
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ExtractedExpense {
  amount: number
  description: string
  date: string
  category: string
}

export async function processReceiptImage(imageBase64: string): Promise<ExtractedExpense> {
  const base64Image = imageBase64.replace(/^data:image\/\w+;base64,/, '')

  const prompt = `Analiza esta imagen de un receipt/ticket y extrae la info del gasto. 
Responde SOLO con JSON: {"amount": numero, "description": texto, "date": "YYYY-MM-DD", "category": "Comida|Transporte|Utilities|Entretenimiento|Salud|Shopping|Otros"}
Si no ves monto: amount 0.
Si no hay fecha: usa hoy.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
        ],
      },
    ],
    max_tokens: 500,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Noresponse')

  try {
    const start = content.indexOf('{')
    const end = content.lastIndexOf('}')
    if (start > -1 && end > -1) {
      const jsonStr = content.substring(start, end + 1)
      const parsed = JSON.parse(jsonStr)
      return {
        amount: parsed.amount ?? 0,
        description: parsed.description ?? 'Sin descripcion',
        date: parsed.date ?? new Date().toISOString().split('T')[0],
        category: parsed.category ?? 'Otros',
      }
    }
    throw new Error('No JSON found')
  } catch (err) {
    console.error('Parse error:', err, content)
    throw new Error('Error al procesar')
  }
}

export async function categorizeDescription(description: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Clasifica: Comida, Transporte, Utilities, Entretenimiento, Salud, Shopping, Otros. 
Solo el nombre.
Descripcion: "${description}"`,
      },
    ],
    max_tokens: 20,
  })

  return response.choices[0]?.message?.content?.trim() || 'Otros'
}
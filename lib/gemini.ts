import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface ExtractedExpense {
  amount: number
  description: string
  date: string
  category: string
}

export async function processReceiptImage(imageBase64: string): Promise<ExtractedExpense> {
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `Analiza esta imagen de un receipt/ticket y extrae la información del gasto.
Responde SOLO con JSON (sin texto adicional):
{"amount": numero, "description": "texto", "date": "YYYY-MM-DD", "category": "Comida|Transporte|Utilities|Entretenimiento|Salud|Shopping|Otros"}
Si no ves monto: amount 0.
Si no hay fecha: usa hoy.
Categorías válidas: Comida, Transporte, Utilities, Entretenimiento, Salud, Shopping, Otros`

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: 'image/jpeg',
    },
  }

  const result = await model.generateContent([prompt, imagePart])
  const response = result.response
  const text = response.text()

  try {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start > -1 && end > -1) {
      const jsonStr = text.substring(start, end + 1)
      const parsed = JSON.parse(jsonStr)
      return {
        amount: parsed.amount ?? 0,
        description: parsed.description ?? 'Sin descripción',
        date: parsed.date ?? new Date().toISOString().split('T')[0],
        category: parsed.category ?? 'Otros',
      }
    }
    throw new Error('No JSON found')
  } catch (err) {
    console.error('Parse error:', err, text)
    throw new Error('Error al procesar el receipt')
  }
}

export async function categorizeDescription(description: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `Clasifica este gasto en una categoría.
Responde SOLO con el nombre: Comida, Transporte, Utilities, Entretenimiento, Salud, Shopping, Otros
Descripción: "${description}"`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  return text.trim() || 'Otros'
}
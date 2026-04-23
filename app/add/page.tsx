'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createWorker } from 'tesseract.js'
import { Upload, Loader2, Receipt, ArrowRight, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export default function AddExpensePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [image, setImage] = useState<string | null>(null)
  const [ocrText, setOcrText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories')
        if (res.ok) {
          const data = await res.json()
          setCategories(data.categories || [])
          if (data.categories?.length > 0) {
            setCategoryId(data.categories[0].id)
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        processImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = async (imageData: string) => {
    setIsProcessing(true)
    setProcessingProgress(0)
    setOcrText('')

    try {
      const worker = await createWorker('spa+eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProcessingProgress(Math.round(m.progress * 100))
          }
        },
      })

      const { data: { text } } = await worker.recognize(imageData)
      await worker.terminate()

      setOcrText(text)
      extractDataFromText(text)
    } catch (err) {
      console.error('OCR Error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const extractDataFromText = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim())

    const amountPatterns = [
      /total[:\s]*\$?([\d,]+\.?\d*)/i,
      /importe[:\s]*\$?([\d,]+\.?\d*)/i,
      /monto[:\s]*\$?([\d,]+\.?\d*)/i,
      /[\d,]+\.\d{2}\s*$/m,
    ]

    for (const pattern of amountPatterns) {
      const match = text.match(pattern)
      if (match) {
        const value = match[1] || match[0]
        const cleanValue = value.replace(/[,$]/g, '')
        const parsed = parseFloat(cleanValue)
        if (!isNaN(parsed) && parsed > 0 && parsed < 1000000) {
          setAmount(parsed.toFixed(2))
          break
        }
      }
    }

    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    ]

    for (const pattern of datePatterns) {
      const match = text.match(pattern)
      if (match) {
        try {
          const dateStr = match[0]
          const parsed = new Date(dateStr)
          if (!isNaN(parsed.getTime())) {
            setDate(parsed.toISOString().split('T')[0])
            break
          }
        } catch {
          // continue
        }
      }
    }

    const firstMeaningfulLine = lines.find(
      (line) => line.length > 3 && !/^[\d\s\-\/]+$/.test(line)
    )
    if (firstMeaningfulLine) {
      setDescription(firstMeaningfulLine.substring(0, 50))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          date,
          categoryId,
          ocrText,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al guardar')
        setSaving(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Error al guardar el gasto')
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">
          Agregar Gasto con OCR
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              1. Sube tu ticket o factura
            </h2>

            {!image ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 py-12 transition hover:border-[#6366f1]"
              >
                <Upload className="mb-2 h-10 w-10 text-slate-400" />
                <p className="text-sm text-slate-600">
                  Haz clic para subir una imagen
                </p>
                <p className="text-xs text-slate-400">
                  JPG, PNG o PDF
                </p>
              </button>
            ) : (
              <div className="relative">
                <img
                  src={image}
                  alt="Receipt"
                  className="mx-auto max-h-64 rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null)
                    setOcrText('')
                  }}
                  className="absolute right-2 top-2 rounded-full bg-slate-800 p-1 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {isProcessing && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-center gap-2 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando OCR... {processingProgress}%
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-[#6366f1] transition-all"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {ocrText && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Texto reconocido:
                </p>
                <pre className="max-h-32 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600 whitespace-pre-wrap">
                  {ocrText}
                </pre>
              </div>
            )}
          </div>

          {/* Manual Input */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              2. Verifica los datos
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Monto
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-3 pl-8 pr-4 text-slate-800 focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Descripción
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-3 px-4 text-slate-800 focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                  placeholder="¿Qué compraste?"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-3 px-4 text-slate-800 focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Categoría
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-3 px-4 text-slate-800 focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !amount || !description}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366f1] py-3 font-medium text-white transition hover:bg-[#4f46e5] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Receipt className="h-5 w-5" />
                Guardar gasto
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
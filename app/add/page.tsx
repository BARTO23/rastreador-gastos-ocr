'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, Receipt, X } from 'lucide-react'

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
  const [ocrLoading, setOcrLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
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
    }
  }

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
    setOcrLoading(true)
    setError('')

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al procesar')
        return
      }

      setAmount(data.amount?.toString() || '')
      setDescription(data.description || '')
      setDate(data.date || new Date().toISOString().split('T')[0])

      const normalizedCategory = normalizeCategory(data.category)
      const matchedCategory = categories.find(
        (c) => c.name.toLowerCase() === normalizedCategory.toLowerCase()
      )
      if (matchedCategory) {
        setCategoryId(matchedCategory.id)
      }
    } catch (err) {
      console.error('OCR Error:', err)
      setError('Error al procesar la imagen')
    } finally {
      setOcrLoading(false)
    }
  }

  const normalizeCategory = (category: string): string => {
    const cat = category.toLowerCase().trim()
    const map: Record<string, string> = {
      comida: 'comida',
      food: 'comida',
      transports: 'transporte',
      transporte: 'transporte',
      utilities: 'utilities',
      luz: 'utilities',
      agua: 'utilities',
      entertainment: 'entertainment',
      entretenimiento: 'entertainment',
      health: 'salud',
      salud: 'salud',
      shopping: 'shopping',
      otros: 'otros',
      other: 'otros',
    }
    return map[cat] || category
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
          Agregar Gasto con AI
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              1. Sube tu ticket (OpenAI Vision)
            </h2>

            {!image ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 py-12 transition hover:border-[#6366f1]"
              >
                <Upload className="mb-2 h-10 w-10 text-slate-400" />
                <p className="text-sm text-slate-600">Haz clic para subir</p>
                <p className="text-xs text-slate-400">JPG, PNG</p>
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
                    setAmount('')
                    setDescription('')
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

            {ocrLoading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando con IA...
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              2. Verifica los datos (auto-detectado)
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
                <label className="mb-2 block text-sm font-medium text-slate-700">Fecha</label>
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
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
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
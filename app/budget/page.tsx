'use client'

import { useState, useEffect } from 'react'
import { saveAs } from 'file-saver'
import { DollarSign, AlertTriangle, Download, TrendingUp } from 'lucide-react'

interface Budget {
  limitAmount: number
  month: number
  year: number
}

export default function BudgetPage() {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [amount, setAmount] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/expenses')
      if (res.ok) {
        const data = await res.json()
        setTotalSpent(data.totalSpent || 0)
        setBudget(data.budget)
        if (data.budget?.limitAmount) {
          setAmount(data.budget.limitAmount.toString())
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error('Error saving budget:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    if (!startDate || !endDate) {
      return
    }

    try {
      const res = await fetch(
        `/api/reports?startDate=${startDate}&endDate=${endDate}`
      )
      if (res.ok) {
        const data = await res.json()

        const csvContent = [
          ['Fecha', 'Descripción', 'Monto', 'Categoría'].join(','),
          ...data.expenses.map(
            (exp: any) =>
              `${exp.date},${exp.description},${exp.amount},${exp.category}`
          ),
          [],
          ['Total', '', data.total.toString()],
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `reporte-gastos-${startDate}-${endDate}.csv`
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Error exporting:', err)
    }
  }

  const percentage = budget && budget.limitAmount > 0 
    ? (totalSpent / budget.limitAmount) * 100 
    : 0

  const isOverBudget = budget && totalSpent > budget.limitAmount
  const isNearLimit = budget && percentage >= 80

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        {/* Budget Section */}
        <div className="mb-8">
          <h1 className="mb-6 text-2xl font-bold text-slate-800">
            Presupuesto Mensual
          </h1>

          <div className="rounded-xl border bg-white p-6">
            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Límite mensual
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

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366f1] py-3 font-medium text-white transition hover:bg-[#4f46e5] disabled:opacity-50"
              >
                <DollarSign className="h-5 w-5" />
                {saving ? 'Guardando...' : 'Guardar presupuesto'}
              </button>
            </form>

            {budget && budget.limitAmount > 0 && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Gastado: ${totalSpent.toFixed(2)}
                  </span>
                  <span className="text-sm text-slate-600">
                    Límite: ${budget.limitAmount.toFixed(2)}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all ${
                      isOverBudget
                        ? 'bg-red-500'
                        : isNearLimit
                        ? 'bg-amber-500'
                        : 'bg-[#6366f1]'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  {isOverBudget && (
                    <div className="flex items-center gap-1 text-sm font-medium text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      Has excedido tu presupuesto
                    </div>
                  )}
                  {isNearLimit && !isOverBudget && (
                    <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
                      <TrendingUp className="h-4 w-4" />
                      {percentage.toFixed(0)}% usado
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reports Section */}
        <div>
          <h1 className="mb-6 text-2xl font-bold text-slate-800">
            Exportar Reportes
          </h1>

          <div className="rounded-xl border bg-white p-6">
            <p className="mb-4 text-slate-600">
              Exporta tus gastos en formato CSV para tu declaración de
              impuestos o registros personales.
            </p>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-3 px-4 text-slate-800 focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-3 px-4 text-slate-800 focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                  />
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={!startDate || !endDate}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366f1] py-3 font-medium text-white transition hover:bg-[#4f46e5] disabled:opacity-50"
              >
                <Download className="h-5 w-5" />
                Descargar CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
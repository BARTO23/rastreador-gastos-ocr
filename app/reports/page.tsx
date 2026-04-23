'use client'

import { useState, useEffect } from 'react'
import { Download, Calendar, FileText } from 'lucide-react'

interface Expense {
  id: string
  date: string
  description: string
  amount: number
  category: string
}

export default function ReportsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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
              `${exp.date},"${exp.description}",${exp.amount},${exp.category}`
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

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">
          Reportes Fiscales
        </h1>

        <div className="rounded-xl border bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <FileText className="h-8 w-8 text-[#6366f1]" />
            <div>
              <p className="font-medium text-slate-800">
                Exportar gastos
              </p>
              <p className="text-sm text-slate-600">
                Descarga un CSV para tu declaración de impuestos
              </p>
            </div>
          </div>

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
  )
}
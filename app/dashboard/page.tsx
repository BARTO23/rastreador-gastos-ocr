'use client'

import { useState, useEffect } from 'react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { Plus, Calendar, TrendingUp, AlertTriangle } from 'lucide-react'

interface Expense {
  id: string
  amount: number
  description: string
  date: string
  category: {
    name: string
    icon: string
    color: string
  }
}

interface Budget {
  limitAmount: number
  month: number
  year: number
}

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budget, setBudget] = useState<Budget | null>(null)
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/expenses')
        if (res.ok) {
          const data = await res.json()
          setExpenses(data.expenses || [])
          setTotalSpent(data.totalSpent || 0)
          setBudget(data.budget)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const percentage = budget ? (totalSpent / budget.limitAmount) * 100 : 0
  const isOverBudget = budget && totalSpent > budget.limitAmount
  const isNearLimit = budget && percentage >= 80

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis Gastos</h1>
          <p className="text-slate-600">Resumen de tus gastos mensuales</p>
        </div>
        <Link
          href="/add"
          className="flex items-center gap-2 rounded-lg bg-[#6366f1] px-4 py-2 font-medium text-white transition hover:bg-[#4f46e5]"
        >
          <Plus className="h-5 w-5" />
          Agregar gasto
        </Link>
      </div>

      {/* Budget Card */}
      {budget && (
        <div className="mb-6 rounded-xl border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Presupuesto del mes</h2>
              <p className="text-sm text-slate-500">
                ${totalSpent.toFixed(2)} de ${budget.limitAmount.toFixed(2)}
              </p>
            </div>
            {isOverBudget && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Excedido
              </div>
            )}
            {isNearLimit && !isOverBudget && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-600">
                <TrendingUp className="h-4 w-4" />
                {percentage.toFixed(0)}% usado
              </div>
            )}
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full transition-all ${
                isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-[#6366f1]'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      <div className="rounded-xl border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Gastos recientes</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-500">Cargando...</div>
        ) : expenses.length === 0 ? (
          <div className="p-6 text-center">
            <p className="mb-4 text-slate-500">No hay gastos registrados</p>
            <Link
              href="/add"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#6366f1] hover:underline"
            >
              <Plus className="h-4 w-4" />
              Agrega tu primer gasto
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {expenses.slice(0, 10).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: expense.category.color + '20' }}
                  >
                    {expense.category.icon}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {expense.description}
                    </p>
                    <p className="text-sm text-slate-500">
                      {expense.category.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">
                    ${expense.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(expense.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
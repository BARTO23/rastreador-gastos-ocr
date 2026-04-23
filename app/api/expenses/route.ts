import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const startOfMonth = new Date(currentYear, currentMonth - 1, 1)
  const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59)

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      category: {
        select: {
          name: true,
          icon: true,
          color: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  })

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const budget = await prisma.budget.findUnique({
    where: {
      userId_month_year: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
    },
  })

  return NextResponse.json({
    expenses: expenses.map((exp) => ({
      id: exp.id,
      amount: exp.amount,
      description: exp.description,
      date: exp.date.toISOString(),
      category: {
        name: exp.category.name,
        icon: exp.category.icon,
        color: exp.category.color,
      },
    })),
    totalSpent,
    budget: budget
      ? {
          limitAmount: budget.limitAmount,
          month: budget.month,
          year: budget.year,
        }
      : null,
  })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { amount, description, date, categoryId, ocrText } = body

    if (!amount || !description || !date || !categoryId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        categoryId,
        userId: session.user.id,
        ocrText: ocrText || null,
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Create expense error:', error)
    return NextResponse.json(
      { error: 'Error al crear el gasto' },
      { status: 500 }
    )
  }
}
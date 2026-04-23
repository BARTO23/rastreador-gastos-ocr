import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { amount } = body

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    const budget = await prisma.budget.upsert({
      where: {
        userId_month_year: {
          userId: session.user.id,
          month,
          year,
        },
      },
      update: {
        limitAmount: parseFloat(amount),
      },
      create: {
        limitAmount: parseFloat(amount),
        month,
        year,
        userId: session.user.id,
      },
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error('Save budget error:', error)
    return NextResponse.json(
      { error: 'Error al guardar el presupuesto' },
      { status: 500 }
    )
  }
}
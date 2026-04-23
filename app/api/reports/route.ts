import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'Fechas requeridas' },
      { status: 400 }
    )
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59'),
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

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  return NextResponse.json({
    expenses: expenses.map((exp) => ({
      id: exp.id,
      date: exp.date.toISOString().split('T')[0],
      description: exp.description,
      amount: exp.amount,
      category: exp.category.name,
    })),
    total,
  })
}
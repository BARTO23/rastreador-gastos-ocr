import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const DEFAULT_CATEGORIES = [
  { name: 'Comida', icon: '🍔', color: '#ef4444' },
  { name: 'Transporte', icon: '🚗', color: '#3b82f6' },
  { name: 'Utilities', icon: '💡', color: '#f59e0b' },
  { name: 'Entretenimiento', icon: '🎬', color: '#8b5cf6' },
  { name: 'Salud', icon: '🏥', color: '#22c55e' },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { name: 'Otros', icon: '📦', color: '#6b7280' },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        categories: {
          create: DEFAULT_CATEGORIES.map(cat => ({
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            isDefault: true,
          }))
        }
      }
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    )
  }
}
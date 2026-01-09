import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, tenantName } = body

    // Validate input
    if (!name || !email || !password || !tenantName) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contrasena debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
        },
      })

      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'admin', // First user is always admin
          tenantId: tenant.id,
        },
      })

      // Create default payment methods for the tenant
      await tx.paymentMethod.createMany({
        data: [
          { nombre: 'Efectivo', tenantId: tenant.id },
          { nombre: 'Transferencia', tenantId: tenant.id },
          { nombre: 'Tarjeta', tenantId: tenant.id },
        ],
      })

      return { tenant, user }
    })

    return NextResponse.json({
      success: true,
      message: 'Cuenta creada exitosamente',
      tenantId: result.tenant.id,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Error al crear la cuenta' },
      { status: 500 }
    )
  }
}

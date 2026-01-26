import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantId, getCurrentUser } from '@/lib/session'
import { normalizePhoneNumber } from '@/lib/whatsapp/service'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * GET - Obtener configuración de WhatsApp
 */
export async function GET() {
  try {
    const tenantId = await getTenantId()
    const user = await getCurrentUser()

    const config = await prisma.whatsAppConfig.findUnique({
      where: { tenantId },
    })

    return NextResponse.json({
      config: config ? {
        isActive: config.isActive,
        webhookVerifyToken: config.webhookVerifyToken,
        hasPhoneNumberId: !!config.phoneNumberId,
        hasAccessToken: !!config.accessToken,
      } : null,
      userPhone: user?.whatsappPhone || null,
    })
  } catch (error) {
    console.error('Error getting WhatsApp config:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

/**
 * POST - Crear o actualizar configuración de WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const body = await request.json()
    const { phoneNumberId, accessToken, userPhone } = body

    // Generar token de verificación si no existe
    let config = await prisma.whatsAppConfig.findUnique({
      where: { tenantId },
    })

    const webhookVerifyToken = config?.webhookVerifyToken || randomBytes(32).toString('hex')

    // Crear o actualizar configuración
    config = await prisma.whatsAppConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        phoneNumberId: phoneNumberId || null,
        accessToken: accessToken || null,
        webhookVerifyToken,
        isActive: !!(phoneNumberId && accessToken),
      },
      update: {
        ...(phoneNumberId !== undefined && { phoneNumberId }),
        ...(accessToken !== undefined && { accessToken }),
        isActive: !!(
          (phoneNumberId || config?.phoneNumberId) &&
          (accessToken || config?.accessToken)
        ),
      },
    })

    // Actualizar teléfono del usuario si se proporcionó
    if (userPhone !== undefined) {
      const user = await getCurrentUser()
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            whatsappPhone: userPhone ? normalizePhoneNumber(userPhone) : null,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      config: {
        isActive: config.isActive,
        webhookVerifyToken: config.webhookVerifyToken,
        hasPhoneNumberId: !!config.phoneNumberId,
        hasAccessToken: !!config.accessToken,
      },
    })
  } catch (error) {
    console.error('Error saving WhatsApp config:', error)
    return NextResponse.json(
      { error: 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}

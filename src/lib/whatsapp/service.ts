/**
 * Servicio de WhatsApp Business API
 *
 * Documentación: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'

interface WhatsAppMessage {
  from: string        // Número del remitente
  text: string        // Contenido del mensaje
  timestamp: string   // Timestamp del mensaje
  messageId: string   // ID único del mensaje
}

interface SendMessageResponse {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Envía un mensaje de texto por WhatsApp
 */
export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  message: string
): Promise<SendMessageResponse> {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('WhatsApp API error:', data)
      return {
        success: false,
        error: data.error?.message || 'Error al enviar mensaje',
      }
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

/**
 * Envía un mensaje con botones de confirmación
 */
export async function sendWhatsAppConfirmation(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  headerText: string,
  bodyText: string,
  confirmButtonText: string = 'Confirmar',
  cancelButtonText: string = 'Cancelar'
): Promise<SendMessageResponse> {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'button',
            header: {
              type: 'text',
              text: headerText,
            },
            body: {
              text: bodyText,
            },
            action: {
              buttons: [
                {
                  type: 'reply',
                  reply: {
                    id: 'confirm_entry',
                    title: confirmButtonText,
                  },
                },
                {
                  type: 'reply',
                  reply: {
                    id: 'cancel_entry',
                    title: cancelButtonText,
                  },
                },
              ],
            },
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('WhatsApp API error:', data)
      return {
        success: false,
        error: data.error?.message || 'Error al enviar mensaje',
      }
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    }
  } catch (error) {
    console.error('Error sending WhatsApp confirmation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

/**
 * Parsea un mensaje entrante del webhook de WhatsApp
 */
export function parseIncomingMessage(webhookBody: any): WhatsAppMessage | null {
  try {
    const entry = webhookBody.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages

    if (!messages || messages.length === 0) {
      return null
    }

    const message = messages[0]

    // Solo procesamos mensajes de texto o respuestas a botones
    if (message.type === 'text') {
      return {
        from: message.from,
        text: message.text.body,
        timestamp: message.timestamp,
        messageId: message.id,
      }
    }

    // Respuesta a botón interactivo
    if (message.type === 'interactive') {
      const buttonReply = message.interactive?.button_reply
      if (buttonReply) {
        return {
          from: message.from,
          text: buttonReply.id, // 'confirm_entry' o 'cancel_entry'
          timestamp: message.timestamp,
          messageId: message.id,
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error parsing WhatsApp message:', error)
    return null
  }
}

/**
 * Normaliza un número de teléfono al formato de WhatsApp
 * Ejemplo: +54 9 11 1234-5678 -> 5491112345678
 */
export function normalizePhoneNumber(phone: string): string {
  // Remover todo excepto números
  let normalized = phone.replace(/\D/g, '')

  // Si empieza con 0, removerlo (Argentina)
  if (normalized.startsWith('0')) {
    normalized = normalized.substring(1)
  }

  // Si no tiene código de país, asumir Argentina (+54)
  if (normalized.length <= 10) {
    normalized = '54' + normalized
  }

  return normalized
}

/**
 * Formatea un número para mostrar
 * Ejemplo: 5491112345678 -> +54 9 11 1234-5678
 */
export function formatPhoneNumber(phone: string): string {
  const normalized = normalizePhoneNumber(phone)

  if (normalized.startsWith('54') && normalized.length === 13) {
    // Formato argentino
    return `+54 9 ${normalized.substring(3, 5)} ${normalized.substring(5, 9)}-${normalized.substring(9)}`
  }

  return `+${normalized}`
}

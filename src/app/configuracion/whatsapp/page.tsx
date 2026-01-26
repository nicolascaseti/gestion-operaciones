'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Loader2,
  Phone,
  Key,
  Link as LinkIcon,
} from 'lucide-react'

interface WhatsAppConfig {
  isActive: boolean
  webhookVerifyToken: string
  hasPhoneNumberId: boolean
  hasAccessToken: boolean
}

export default function WhatsAppConfigPage() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null)
  const [userPhone, setUserPhone] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/whatsapp`
    : ''

  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/whatsapp/config')
      const data = await response.json()

      if (data.config) {
        setConfig(data.config)
      }
      if (data.userPhone) {
        setUserPhone(data.userPhone)
      }
    } catch (err) {
      setError('Error al cargar configuración')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId: phoneNumberId || undefined,
          accessToken: accessToken || undefined,
          userPhone: userPhone || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar')
      }

      setConfig(data.config)
      setSuccess('Configuración guardada correctamente')
      setPhoneNumberId('')
      setAccessToken('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copiado al portapapeles')
    setTimeout(() => setSuccess(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Configuracion de WhatsApp</h2>
        <p className="text-dark-300 mt-1">
          Configura WhatsApp Business API para registrar compras y ventas por mensaje
        </p>
      </div>

      {/* Estado actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gold-400" />
            Estado de la Integracion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {config?.isActive ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-success">WhatsApp Activo</p>
                  <p className="text-sm text-dark-400">
                    Puedes enviar mensajes para registrar operaciones
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dark-600">
                  <AlertCircle className="h-5 w-5 text-dark-400" />
                </div>
                <div>
                  <p className="font-medium text-dark-200">WhatsApp No Configurado</p>
                  <p className="text-sm text-dark-400">
                    Completa la configuración para habilitar WhatsApp
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>Pasos para Configurar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-dark-800 p-4">
            <h4 className="font-medium text-white mb-3">1. Crear App en Meta for Developers</h4>
            <ol className="text-sm text-dark-300 space-y-2 list-decimal list-inside">
              <li>Ve a <a href="https://developers.facebook.com/" target="_blank" rel="noopener" className="text-gold-400 hover:underline">developers.facebook.com</a></li>
              <li>Crea una nueva app de tipo "Business"</li>
              <li>Agrega el producto "WhatsApp" a tu app</li>
              <li>En WhatsApp → API Setup, obtén tu Phone Number ID y Access Token</li>
            </ol>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => window.open('https://developers.facebook.com/apps/', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ir a Meta for Developers
            </Button>
          </div>

          <div className="rounded-lg bg-dark-800 p-4">
            <h4 className="font-medium text-white mb-3">2. Configurar Webhook</h4>
            <p className="text-sm text-dark-300 mb-3">
              En la configuración de WhatsApp de Meta, configura el webhook con estos datos:
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-dark-400">Callback URL:</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-dark-900 px-3 py-2 rounded text-sm text-gold-400 overflow-x-auto">
                    {webhookUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(webhookUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {config?.webhookVerifyToken && (
                <div>
                  <label className="text-xs text-dark-400">Verify Token:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-dark-900 px-3 py-2 rounded text-sm text-gold-400 overflow-x-auto">
                      {config.webhookVerifyToken}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.webhookVerifyToken)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-dark-400">Webhook Fields (suscribirse a):</label>
                <code className="block bg-dark-900 px-3 py-2 rounded text-sm text-dark-300 mt-1">
                  messages
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Credenciales de WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-danger" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-success/10 border border-success/20 p-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <p className="text-sm text-success">{success}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-dark-200 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Phone Number ID
              {config?.hasPhoneNumberId && (
                <span className="text-xs text-success">(configurado)</span>
              )}
            </label>
            <Input
              type="text"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder={config?.hasPhoneNumberId ? '••••••••••' : 'Ej: 123456789012345'}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-dark-200 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Access Token
              {config?.hasAccessToken && (
                <span className="text-xs text-success">(configurado)</span>
              )}
            </label>
            <Input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder={config?.hasAccessToken ? '••••••••••' : 'Token de acceso de WhatsApp'}
            />
          </div>

          <div className="border-t border-dark-600 pt-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm text-dark-200 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Tu Numero de WhatsApp
              </label>
              <Input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="Ej: +54 9 11 1234-5678"
              />
              <p className="text-xs text-dark-400">
                Este es el número desde el cual enviarás mensajes para registrar operaciones
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                'Guardar Configuracion'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cómo usar */}
      {config?.isActive && (
        <Card>
          <CardHeader>
            <CardTitle>Como Usar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-dark-300">
              <p>Una vez configurado, puedes enviar mensajes a tu número de WhatsApp Business con el siguiente formato:</p>

              <div className="rounded-lg bg-dark-800 p-4 space-y-2">
                <p className="text-white font-medium">Ejemplos:</p>
                <p className="text-gold-400">"Compré 10 unidades de PROD001 a Proveedor ABC por $500"</p>
                <p className="text-gold-400">"Vendí 5 cajas de producto XYZ al cliente Juan por $1500"</p>
              </div>

              <p>El sistema te enviará una confirmación con los detalles antes de registrar la operación.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

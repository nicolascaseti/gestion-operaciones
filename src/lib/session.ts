import { auth } from '@/lib/auth'

export async function getSession() {
  const session = await auth()
  return session
}

export async function getTenantId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.tenantId) {
    throw new Error('No tenant found in session')
  }
  return session.user.tenantId
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Not authenticated')
  }
  return session.user
}

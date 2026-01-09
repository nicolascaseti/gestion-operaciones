import { NextRequest, NextResponse } from 'next/server'
import { getAnalytics } from '@/lib/analytics'
import { getTenantId } from '@/lib/session'
import { subDays, parseISO } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const searchParams = request.nextUrl.searchParams
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    const range = searchParams.get('range') // 7, 30, 90

    let from: Date
    let to: Date = new Date()

    if (fromParam && toParam) {
      from = parseISO(fromParam)
      to = parseISO(toParam)
    } else if (range) {
      const days = parseInt(range)
      from = subDays(new Date(), days)
    } else {
      // Default: últimos 30 días
      from = subDays(new Date(), 30)
    }

    const analytics = await getAnalytics(tenantId, { from, to })

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Error al obtener las analíticas' },
      { status: 500 }
    )
  }
}

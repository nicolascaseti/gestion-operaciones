'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export function useFilters<T extends Record<string, string | undefined>>() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters = useMemo(() => {
    const params: Record<string, string | undefined> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params as T
  }, [searchParams])

  const setFilter = useCallback(
    (key: keyof T, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === undefined || value === '') {
        params.delete(key as string)
      } else {
        params.set(key as string, value)
      }
      if (key !== 'page') {
        params.set('page', '1')
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const setFilters = useCallback(
    (newFilters: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key)
        } else {
          params.set(key, value as string)
        }
      })
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const clearFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  const buildExportUrl = useCallback(
    (baseUrl: string) => {
      const params = new URLSearchParams()
      searchParams.forEach((value, key) => {
        if (key !== 'page' && key !== 'pageSize') {
          params.set(key, value)
        }
      })
      const queryString = params.toString()
      return queryString ? `${baseUrl}?${queryString}` : baseUrl
    },
    [searchParams]
  )

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    buildExportUrl,
  }
}

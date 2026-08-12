import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { DashboardStats, AnalyticsSummary, TopProduct, Period } from '@/types/admin'

interface DashboardData {
  stats: DashboardStats | null
  analytics: AnalyticsSummary | null
  topProducts: TopProduct[]
  customersTotal: number | null
  ordersTotal: number | null
  loading: boolean
  error: string | null
}

export function useAdminDashboard(period: Period, startDate?: string, endDate?: string) {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    analytics: null,
    topProducts: [],
    customersTotal: null,
    ordersTotal: null,
    loading: true,
    error: null,
  })

  const fetch = useCallback(async () => {
    if (period === 'custom' && (!startDate || !endDate)) {
      setData((d) => ({
        ...d,
        loading: false,
        error: null,
      }))
      return
    }

    setData((d) => ({ ...d, loading: true, error: null }))
    try {
      const [dashRes, customersRes, ordersRes] = await Promise.all([
        api.admin.getDashboard(period, startDate, endDate, 10),
        api.admin.getCustomers({ page: 1, limit: 1 }).catch(() => null),
        api.admin.getOrders({ page: 1, limit: 1 }).catch(() => null),
      ])

      const { stats, analytics, topProducts } = dashRes

      setData({
        stats,
        analytics,
        topProducts,
        customersTotal: customersRes?.meta?.total ?? null,
        ordersTotal: ordersRes?.meta?.total ?? null,
        loading: false,
        error: null,
      })
    } catch (err) {
      setData((d) => ({
        ...d,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load dashboard',
      }))
    }
  }, [period, startDate, endDate])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...data, refresh: fetch }
}

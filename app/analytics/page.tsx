"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Zap, RefreshCw } from "lucide-react"
import { COLORS } from "@/constant/colors"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"

type ImprovementItem = {
  _id: string
  title?: string
  source?: string
  status?: string
  date?: string
  issueDate?: string
  createdAt?: string
  cost?: number | string
}

function toDateValue(item: ImprovementItem) {
  const raw = item.date || item.issueDate || item.createdAt
  const d = raw ? new Date(raw) : null
  return d && !Number.isNaN(d.getTime()) ? d : null
}

function formatDateInput(value: Date) {
  return value.toISOString().split("T")[0]
}

function monthShort(date: Date) {
  return date.toLocaleString("en", { month: "short" })
}

export default function AnalyticsPage() {
  const [items, setItems] = useState<ImprovementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 5)
    return formatDateInput(d)
  })
  const [endDate, setEndDate] = useState(() => formatDateInput(new Date()))

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/improvement-register", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        throw new Error("Failed to fetch analytics data")
      }
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredItems = useMemo(() => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    return items.filter((item) => {
      const d = toDateValue(item)
      if (!d) return false
      return d >= start && d <= end
    })
  }, [items, startDate, endDate])

  const improvementData = useMemo(() => {
    const result: { name: string; value: number }[] = []
    const cursor = new Date(startDate)
    cursor.setDate(1)
    const end = new Date(endDate)
    end.setDate(1)
    const monthMap = new Map<string, number>()
    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}`
      monthMap.set(key, 0)
      result.push({ name: monthShort(cursor), value: 0 })
      cursor.setMonth(cursor.getMonth() + 1)
    }
    filteredItems.forEach((item) => {
      const d = toDateValue(item)
      if (!d) return
      const key = `${d.getFullYear()}-${d.getMonth()}`
      monthMap.set(key, (monthMap.get(key) || 0) + 1)
    })
    return result.map((entry, i) => {
      const date = new Date(startDate)
      date.setDate(1)
      date.setMonth(date.getMonth() + i)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      return { ...entry, value: monthMap.get(key) || 0 }
    })
  }, [filteredItems, startDate, endDate])

  const achievementData = useMemo(() => {
    const group = new Map<string, { name: string; late: number; onTime: number }>()
    filteredItems.forEach((item) => {
      const area = item.source || "Unspecified"
      const status = String(item.status || "").toLowerCase()
      const isOnTime = ["closed", "completed", "done", "approved"].some((k) => status.includes(k))
      const row = group.get(area) || { name: area, late: 0, onTime: 0 }
      if (isOnTime) row.onTime += 1
      else row.late += 1
      group.set(area, row)
    })
    return Array.from(group.values()).slice(0, 10)
  }, [filteredItems])

  const costData = useMemo(() => {
    const monthTotals = new Map<string, number>()
    const monthList: { name: string; key: string }[] = []
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - 11)
    for (let i = 0; i < 12; i++) {
      const key = `${d.getFullYear()}-${d.getMonth()}`
      monthTotals.set(key, 0)
      monthList.push({ key, name: monthShort(d) })
      d.setMonth(d.getMonth() + 1)
    }
    filteredItems.forEach((item) => {
      const date = toDateValue(item)
      if (!date) return
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (!monthTotals.has(key)) return
      const raw = typeof item.cost === "number" ? item.cost : Number(item.cost || 0)
      const value = Number.isFinite(raw) ? raw : 0
      monthTotals.set(key, (monthTotals.get(key) || 0) + value)
    })
    return monthList.map((m) => ({ name: m.name, cost: Number((monthTotals.get(m.key) || 0).toFixed(2)) }))
  }, [filteredItems])

  const totalCost = useMemo(() => costData.reduce((sum, m) => sum + m.cost, 0), [costData])
  const totalItems = filteredItems.length
  const avgCost = totalItems > 0 ? totalCost / totalItems : 0

  return (
    <div className="min-h-screen p-8" style={{ background: COLORS.bgGrayLight }}>
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors text-sm font-medium" style={{ borderColor: COLORS.border, color: COLORS.primary }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </Link>
        <h1 className="text-2xl font-bold text-black">Analytics Dashboard</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: COLORS.border }}>
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: COLORS.primary }}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Analytics Dashboard</h2>
            <p className="text-gray-500 text-sm mt-1">Real-time insights from Improvement Register data</p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-6 mb-8 p-4 rounded-xl" style={{ background: COLORS.bgGrayLight }}>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-black uppercase tracking-wider">Start date</label>
            <input
              type="date"
              className="pl-4 pr-4 py-2.5 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48 text-black"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ borderColor: COLORS.border }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-black uppercase tracking-wider">End date</label>
            <input
              type="date"
              className="pl-4 pr-4 py-2.5 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48 text-black"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ borderColor: COLORS.border }}
            />
          </div>

          <button
            onClick={loadData}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium shadow-md hover:shadow-lg transition-all active:scale-95"
            style={{ background: COLORS.primary }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ background: COLORS.pink50, color: COLORS.pink700 }}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: COLORS.border }}>
            <h3 className="text-sm font-semibold text-black mb-6">Improvement Register - Root Cause Analysis</h3>
            <div className="h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center relative overflow-hidden" style={{ borderColor: COLORS.neutral200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={improvementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.primaryLight} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-3 h-3 rounded-sm" style={{ background: COLORS.primaryLight }}></div>
              <span className="text-sm text-gray-600 font-medium">Count by month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-black">Areas and Achievement Rate</h3>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={achievementData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 10, fill: COLORS.textSecondary }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: COLORS.textSecondary }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                  <Bar dataKey="late" name="Late" fill={COLORS.pink500} radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="onTime" name="On Time" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: COLORS.pink500 }}></div>
                <span className="text-sm text-gray-600 font-medium">Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: COLORS.primary }}></div>
                <span className="text-sm text-gray-600 font-medium">On Time</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: COLORS.border }}>
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-black">Cost of Quality (12-Month Period)</h3>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span>Total Cost: <strong className="text-gray-900">£{totalCost.toFixed(2)}</strong></span>
              <span>Total Items: <strong className="text-gray-900">{totalItems}</strong></span>
              <span>Average Cost: <strong className="text-gray-900">£{avgCost.toFixed(2)}</strong></span>
            </div>
          </div>

          <div className="h-48 border-2 border-dashed rounded-lg" style={{ borderColor: COLORS.neutral200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="cost" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

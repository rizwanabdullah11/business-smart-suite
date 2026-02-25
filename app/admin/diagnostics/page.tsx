"use client"

import { useState, useEffect } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import { Permission } from "@/lib/types/permissions"
import { useRouter } from "next/navigation"
import { Activity, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { COLORS } from "@/constant/colors"

interface EndpointStatus {
  path: string
  method: string
  status: string | number
  available: boolean | string
  requiresAuth: boolean
  error?: string
}

interface HealthData {
  timestamp: string
  backendUrl: string
  endpoints: Record<string, EndpointStatus>
  summary: {
    total: number
    available: number
    unavailable: number
    untested: number
  }
  authenticated: boolean
}

export default function DiagnosticsPage() {
  const { can, isAdmin, loading: permLoading } = usePermissions()
  const router = useRouter()
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!permLoading && !isAdmin) {
      router.push("/unauthorized")
    }
  }, [isAdmin, permLoading, router])

  useEffect(() => {
    if (isAdmin) {
      checkHealth()
    }
  }, [isAdmin])

  const checkHealth = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/health", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHealthData(data)
      }
    } catch (error) {
      console.error("Error checking health:", error)
    } finally {
      setLoading(false)
    }
  }

  if (permLoading || loading) {
    return <div className="p-8">Loading diagnostics...</div>
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{
                backgroundColor: `${COLORS.blue500}15`,
                color: COLORS.blue500,
              }}
            >
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                Backend Diagnostics
              </h1>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Check backend endpoint availability
              </p>
            </div>
          </div>

          <button
            onClick={checkHealth}
            className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
            style={{
              background: COLORS.primary,
              color: COLORS.textWhite,
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {healthData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div
                className="p-4 rounded-xl"
                style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      Total Endpoints
                    </p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
                      {healthData.summary.total}
                    </p>
                  </div>
                  <Activity className="w-8 h-8" style={{ color: COLORS.blue500 }} />
                </div>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      Available
                    </p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.green500 }}>
                      {healthData.summary.available}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8" style={{ color: COLORS.green500 }} />
                </div>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      Missing
                    </p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.pink600 }}>
                      {healthData.summary.unavailable}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8" style={{ color: COLORS.pink600 }} />
                </div>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      Untested
                    </p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.gray500 }}>
                      {healthData.summary.untested}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8" style={{ color: COLORS.gray500 }} />
                </div>
              </div>
            </div>

            {/* Backend Info */}
            <div
              className="p-4 rounded-xl mb-6"
              style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
                    Backend URL
                  </p>
                  <code className="text-sm px-2 py-1 bg-gray-100 rounded">
                    {healthData.backendUrl}
                  </code>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
                    Authenticated
                  </p>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      healthData.authenticated ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {healthData.authenticated ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
                    Last Checked
                  </p>
                  <p className="text-sm" style={{ color: COLORS.textPrimary }}>
                    {new Date(healthData.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Endpoints Table */}
            <div
              className="rounded-xl overflow-hidden shadow-sm"
              style={{
                background: COLORS.bgWhite,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ background: COLORS.bgGray }}>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                      Endpoint
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                      Path
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                      Auth Required
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                      Response
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(healthData.endpoints).map(([name, endpoint]) => (
                    <tr
                      key={name}
                      className="border-t hover:bg-opacity-50"
                      style={{ borderColor: COLORS.border }}
                    >
                      <td className="px-6 py-4">
                        {endpoint.available === true ? (
                          <CheckCircle className="w-5 h-5" style={{ color: COLORS.green500 }} />
                        ) : endpoint.available === false ? (
                          <XCircle className="w-5 h-5" style={{ color: COLORS.pink600 }} />
                        ) : (
                          <AlertCircle className="w-5 h-5" style={{ color: COLORS.gray500 }} />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium" style={{ color: COLORS.textPrimary }}>
                          {name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            background:
                              endpoint.method === "GET"
                                ? `${COLORS.blue500}20`
                                : endpoint.method === "POST"
                                ? `${COLORS.green500}20`
                                : endpoint.method === "PUT"
                                ? `${COLORS.orange500}20`
                                : `${COLORS.pink600}20`,
                            color:
                              endpoint.method === "GET"
                                ? COLORS.blue500
                                : endpoint.method === "POST"
                                ? COLORS.green500
                                : endpoint.method === "PUT"
                                ? COLORS.orange500
                                : COLORS.pink600,
                          }}
                        >
                          {endpoint.method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm" style={{ color: COLORS.textSecondary }}>
                          {endpoint.path}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                          {endpoint.requiresAuth ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            endpoint.status === 200 || endpoint.status === 201
                              ? "bg-green-100 text-green-700"
                              : endpoint.status === 404
                              ? "bg-red-100 text-red-700"
                              : endpoint.status === "untested"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {endpoint.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Missing Endpoints Warning */}
            {healthData.summary.unavailable > 0 && (
              <div
                className="mt-6 p-4 rounded-lg border-2"
                style={{
                  background: `${COLORS.pink600}10`,
                  borderColor: COLORS.pink600,
                }}
              >
                <h3 className="font-semibold mb-2" style={{ color: COLORS.pink600 }}>
                  ⚠️ Missing Endpoints Detected
                </h3>
                <p className="text-sm mb-2" style={{ color: COLORS.textSecondary }}>
                  Your backend is missing {healthData.summary.unavailable} endpoint(s). These need to be implemented for full functionality.
                </p>
                <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                  See <code className="px-2 py-0.5 bg-white rounded text-xs">backend-example-users-route.js</code> for implementation.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

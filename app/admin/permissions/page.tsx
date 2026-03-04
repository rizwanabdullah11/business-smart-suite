"use client"

import { usePermissions } from "@/hooks/use-permissions"
import { Permission, Role, ROLE_PERMISSIONS } from "@/lib/types/permissions"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import React from "react"
import { Shield, Users, Eye, Lock, CheckCircle2, XCircle } from "lucide-react"

export default function PermissionsPage() {
  const { isAdmin, loading } = usePermissions()
  const router = useRouter()
  const [selectedView, setSelectedView] = useState<"cards" | "table">("cards")

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/unauthorized")
    }
  }, [isAdmin, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Role Permissions</h1>
              <p className="text-gray-600 mt-1">Manage and view system access controls</p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex gap-2 bg-white p-1 rounded-lg shadow-sm w-fit">
          <button
            onClick={() => setSelectedView("cards")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedView === "cards"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Card View
          </button>
          <button
            onClick={() => setSelectedView("table")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedView === "table"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Table View
          </button>
        </div>

        {/* Cards View */}
        {selectedView === "cards" && (
          <div className="grid gap-6 mb-8">
            <RoleCard
              role={Role.ADMIN}
              title="Administrator"
              description="Full system access with all permissions"
              permissions={ROLE_PERMISSIONS[Role.ADMIN]}
              color="blue"
              icon={<Shield className="w-6 h-6" />}
            />

            <RoleCard
              role={Role.ORGANIZATION}
              title="Organization Manager"
              description="Can manage content and operations but not users or system settings"
              permissions={ROLE_PERMISSIONS[Role.ORGANIZATION]}
              color="green"
              icon={<Users className="w-6 h-6" />}
            />

            <RoleCard
              role={Role.EMPLOYEE}
              title="Employee"
              description="Read-only access with limited actions"
              permissions={ROLE_PERMISSIONS[Role.EMPLOYEE]}
              color="purple"
              icon={<Eye className="w-6 h-6" />}
            />
          </div>
        )}

        {/* Table View */}
        {selectedView === "table" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Permission Matrix</h2>
              <p className="text-gray-600 mt-1">Compare permissions across all roles</p>
            </div>
            <PermissionComparisonTable />
          </div>
        )}
      </div>
    </div>
  )
}

interface RoleCardProps {
  role: Role
  title: string
  description: string
  permissions: Permission[]
  color: "blue" | "green" | "purple"
  icon: React.ReactNode
}

function RoleCard({ role, title, description, permissions, color, icon }: RoleCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const colorClasses = {
    blue: {
      border: "border-blue-500",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-blue-600",
      badge: "bg-blue-600 text-white",
      permissionBg: "bg-white hover:bg-blue-50"
    },
    green: {
      border: "border-green-500",
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      iconBg: "bg-green-600",
      badge: "bg-green-600 text-white",
      permissionBg: "bg-white hover:bg-green-50"
    },
    purple: {
      border: "border-purple-500",
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconBg: "bg-purple-600",
      badge: "bg-purple-600 text-white",
      permissionBg: "bg-white hover:bg-purple-50"
    },
  }

  const colors = colorClasses[color]

  return (
    <div className={`border-l-4 ${colors.border} ${colors.bg} rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 ${colors.iconBg} rounded-lg text-white`}>
              {icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-700 mt-1">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 ${colors.badge} rounded-full text-sm font-semibold shadow-sm`}>
              {permissions.length} permissions
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <svg
                className={`w-5 h-5 text-gray-700 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 animate-in fade-in duration-300">
            <h3 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Permissions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {permissions.map((permission) => (
                <div
                  key={permission}
                  className={`text-sm ${colors.permissionBg} px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 transition-all duration-200 flex items-center gap-2 shadow-sm`}
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="truncate">{formatPermission(permission)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PermissionComparisonTable() {
  const permissionCategories = {
    "Dashboard & Analytics": [
      Permission.VIEW_DASHBOARD,
      Permission.VIEW_ANALYTICS,
    ],
    "Manuals": [
      Permission.VIEW_MANUALS,
      Permission.CREATE_MANUAL,
      Permission.EDIT_MANUAL,
      Permission.DELETE_MANUAL,
      Permission.UPLOAD_MANUAL,
    ],
    "Procedures": [
      Permission.VIEW_PROCEDURES,
      Permission.CREATE_PROCEDURE,
      Permission.EDIT_PROCEDURE,
      Permission.DELETE_PROCEDURE,
      Permission.ARCHIVE_PROCEDURE,
    ],
    "Policies": [
      Permission.VIEW_POLICIES,
      Permission.CREATE_POLICY,
      Permission.EDIT_POLICY,
      Permission.DELETE_POLICY,
    ],
    "Forms": [
      Permission.VIEW_FORMS,
      Permission.CREATE_FORM,
      Permission.EDIT_FORM,
      Permission.DELETE_FORM,
      Permission.SUBMIT_FORM,
    ],
    "Certificates": [
      Permission.VIEW_CERTIFICATES,
      Permission.CREATE_CERTIFICATE,
      Permission.EDIT_CERTIFICATE,
      Permission.DELETE_CERTIFICATE,
      Permission.REVIEW_CERTIFICATE,
    ],
    "Risk & Compliance": [
      Permission.VIEW_RISK_ASSESSMENTS,
      Permission.CREATE_RISK_ASSESSMENT,
      Permission.EDIT_RISK_ASSESSMENT,
      Permission.DELETE_RISK_ASSESSMENT,
      Permission.VIEW_COSHH,
      Permission.CREATE_COSHH,
      Permission.EDIT_COSHH,
      Permission.DELETE_COSHH,
    ],
    "Audits & Improvements": [
      Permission.VIEW_AUDIT_SCHEDULE,
      Permission.CREATE_AUDIT_SCHEDULE,
      Permission.EDIT_AUDIT_SCHEDULE,
      Permission.DELETE_AUDIT_SCHEDULE,
      Permission.REVIEW_AUDIT,
      Permission.VIEW_IMPROVEMENTS,
      Permission.CREATE_IMPROVEMENT,
      Permission.EDIT_IMPROVEMENT,
      Permission.DELETE_IMPROVEMENT,
    ],
    "User Management": [
      Permission.VIEW_USERS,
      Permission.CREATE_USER,
      Permission.EDIT_USER,
      Permission.DELETE_USER,
      Permission.MANAGE_ROLES,
    ],
    "Organization": [
      Permission.VIEW_ORGANIZATION,
      Permission.EDIT_ORGANIZATION,
      Permission.MANAGE_ORGANIZATION_SETTINGS,
    ],
    "Categories": [
      Permission.VIEW_CATEGORIES,
      Permission.CREATE_CATEGORY,
      Permission.EDIT_CATEGORY,
      Permission.DELETE_CATEGORY,
    ],
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 sticky left-0 bg-gray-100">
              Category
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Permission</th>
            <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Admin
              </div>
            </th>
            <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                Organization
              </div>
            </th>
            <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
              <div className="flex items-center justify-center gap-2">
                <Eye className="w-4 h-4 text-purple-600" />
                Employee
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Object.entries(permissionCategories).map(([category, permissions]) => (
            <React.Fragment key={category}>
              {permissions.map((permission, index) => (
                <tr key={permission} className="hover:bg-gray-50 transition-colors">
                  {index === 0 && (
                    <td
                      className="px-6 py-4 font-bold text-sm bg-gradient-to-r from-gray-50 to-white text-gray-900 sticky left-0"
                      rowSpan={permissions.length}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                        {category}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {formatPermission(permission)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {hasPermissionForRole(Role.ADMIN, permission) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {hasPermissionForRole(Role.ORGANIZATION, permission) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {hasPermissionForRole(Role.EMPLOYEE, permission) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatPermission(permission: Permission): string {
  return permission
    .split(":")
    .map((part) => part.replace(/_/g, " "))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" - ")
}

function hasPermissionForRole(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

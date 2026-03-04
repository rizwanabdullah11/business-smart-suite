"use client"

import { usePermissions } from "@/hooks/use-permissions"
import { Permission, Role, ROLE_PERMISSIONS } from "@/lib/types/permissions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import React from "react"

export default function PermissionsPage() {
  const { isAdmin, loading } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/unauthorized")
    }
  }, [isAdmin, loading, router])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Role Permissions Management</h1>
      
      <div className="mb-8">
        <p className="text-gray-700">
          This page shows the permission matrix for all roles in the system.
          Only administrators can view this page.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Admin Role */}
        <RoleCard
          role={Role.ADMIN}
          title="Administrator"
          description="Full system access with all permissions"
          permissions={ROLE_PERMISSIONS[Role.ADMIN]}
          color="blue"
        />

        {/* Organization Role */}
        <RoleCard
          role={Role.ORGANIZATION}
          title="Organization Manager"
          description="Can manage content and operations but not users or system settings"
          permissions={ROLE_PERMISSIONS[Role.ORGANIZATION]}
          color="green"
        />

        {/* Employee Role */}
        <RoleCard
          role={Role.EMPLOYEE}
          title="Employee"
          description="Read-only access with limited actions"
          permissions={ROLE_PERMISSIONS[Role.EMPLOYEE]}
          color="gray"
        />
      </div>

      {/* Permission Comparison Table */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Permission Comparison</h2>
        <PermissionComparisonTable />
      </div>
    </div>
  )
}

interface RoleCardProps {
  role: Role
  title: string
  description: string
  permissions: Permission[]
  color: "blue" | "green" | "gray"
}

function RoleCard({ role, title, description, permissions, color }: RoleCardProps) {
  const colorClasses = {
    blue: "border-blue-500 bg-blue-50",
    green: "border-green-500 bg-green-50",
    gray: "border-gray-500 bg-gray-50",
  }

  return (
    <div className={`border-l-4 ${colorClasses[color]} p-6 rounded-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-700 mt-1">{description}</p>
        </div>
        <span className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-gray-900">
          {permissions.length} permissions
        </span>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold mb-2 text-gray-900">Permissions:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {permissions.map((permission) => (
            <div
              key={permission}
              className="text-sm bg-white px-3 py-2 rounded border text-gray-800"
            >
              {formatPermission(permission)}
            </div>
          ))}
        </div>
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
    "User Management": [
      Permission.VIEW_USERS,
      Permission.CREATE_USER,
      Permission.EDIT_USER,
      Permission.DELETE_USER,
      Permission.MANAGE_ROLES,
    ],
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Permission</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Admin</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Organization</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Employee</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(permissionCategories).map(([category, permissions]) => (
            <React.Fragment key={category}>
              {permissions.map((permission, index) => (
                <tr key={permission} className="border-t hover:bg-gray-50">
                  {index === 0 && (
                    <td
                      className="px-6 py-3 font-semibold text-sm bg-gray-50 text-gray-900"
                      rowSpan={permissions.length}
                    >
                      {category}
                    </td>
                  )}
                  <td className="px-6 py-3 text-sm text-gray-800">{formatPermission(permission)}</td>
                  <td className="px-6 py-3 text-center text-gray-800 text-base">
                    {hasPermissionForRole(Role.ADMIN, permission) ? "✓" : "✗"}
                  </td>
                  <td className="px-6 py-3 text-center text-gray-800 text-base">
                    {hasPermissionForRole(Role.ORGANIZATION, permission) ? "✓" : "✗"}
                  </td>
                  <td className="px-6 py-3 text-center text-gray-800 text-base">
                    {hasPermissionForRole(Role.EMPLOYEE, permission) ? "✓" : "✗"}
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

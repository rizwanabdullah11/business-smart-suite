"use client"

import { usePermissions } from "@/hooks/use-permissions"
import { Permission } from "@/lib/types/permissions"
import { useState } from "react"

/**
 * Debug component to show current user permissions
 * Only visible in development mode
 * Add to any page to see permission status
 */
export function PermissionDebug() {
  const { user, loading, can, isAdmin, isOrganization, isEmployee } = usePermissions()
  const [isOpen, setIsOpen] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 shadow-lg z-50">
        <p className="text-sm font-semibold">Loading permissions...</p>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        🔍 Debug Permissions
      </button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white border-2 border-blue-500 rounded-lg shadow-xl w-96 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-bold">Permission Debug</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* User Info */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold mb-2">Current User</h4>
              {user ? (
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Name:</span> {user.name}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p>
                    <span className="font-medium">Role:</span>{" "}
                    <span className={`px-2 py-1 rounded ${
                      user.role === "admin" ? "bg-blue-100 text-blue-800" :
                      user.role === "organization" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {user.role}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-600">No user loaded</p>
              )}
            </div>

            {/* Role Checks */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold mb-2">Role Checks</h4>
              <div className="text-sm space-y-1">
                <p>isAdmin: {isAdmin ? "✅ Yes" : "❌ No"}</p>
                <p>isOrganization: {isOrganization ? "✅ Yes" : "❌ No"}</p>
                <p>isEmployee: {isEmployee ? "✅ Yes" : "❌ No"}</p>
              </div>
            </div>

            {/* Key Permissions */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold mb-2">Key Permissions</h4>
              <div className="text-sm space-y-1">
                <PermissionCheck permission={Permission.VIEW_MANUALS} label="View Manuals" />
                <PermissionCheck permission={Permission.CREATE_MANUAL} label="Create Manual" />
                <PermissionCheck permission={Permission.EDIT_MANUAL} label="Edit Manual" />
                <PermissionCheck permission={Permission.DELETE_MANUAL} label="Delete Manual" />
                <PermissionCheck permission={Permission.VIEW_PROCEDURES} label="View Procedures" />
                <PermissionCheck permission={Permission.CREATE_PROCEDURE} label="Create Procedure" />
                <PermissionCheck permission={Permission.MANAGE_ROLES} label="Manage Roles (Admin)" />
                <PermissionCheck permission={Permission.VIEW_ANALYTICS} label="View Analytics" />
              </div>
            </div>

            {/* API Check */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold mb-2">API Status</h4>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/auth/me")
                    const data = await response.json()
                    console.log("API Response:", data)
                    alert(JSON.stringify(data, null, 2))
                  } catch (error) {
                    console.error("API Error:", error)
                    alert("Error fetching user data")
                  }
                }}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Test /api/auth/me
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PermissionCheck({ permission, label }: { permission: Permission; label: string }) {
  const { can } = usePermissions()
  const hasPermission = can(permission)

  return (
    <p className={hasPermission ? "text-green-600" : "text-red-600"}>
      {hasPermission ? "✅" : "❌"} {label}
    </p>
  )
}

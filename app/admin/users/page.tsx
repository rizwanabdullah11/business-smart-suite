"use client"

import { useState, useEffect } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import { Permission } from "@/lib/types/permissions"
import { useRouter } from "next/navigation"
import { Users, Plus, Edit, Trash2, Building2, User } from "lucide-react"
import { COLORS } from "@/constant/colors"

interface User {
  _id: string
  name: string
  email: string
  role?: string
  organizationId?: string
  organizationName?: string
  createdAt?: string
}

export default function UsersPage() {
  const { can, isAdmin, isOrganization, loading: permLoading } = usePermissions()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterRole, setFilterRole] = useState<string>("all")
  const [showAdmins, setShowAdmins] = useState(true) // Toggle to show/hide admin users

  const roleOf = (user: User) => (user.role || "employee").toLowerCase()

  useEffect(() => {
    if (!permLoading && !can(Permission.VIEW_USERS)) {
      router.push("/unauthorized")
    }
  }, [can, permLoading, router])

  useEffect(() => {
    if (can(Permission.VIEW_USERS)) {
      loadUsers()
    }
  }, [can])

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Normalize legacy/incomplete records to prevent UI crashes.
        const safeUsers = Array.isArray(data)
          ? data.map((u: User) => ({
              ...u,
              role: u?.role || "Employee",
            }))
          : []
        setUsers(safeUsers)
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        loadUsers()
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const filteredUsers = users.filter((user) => {
    // First apply role filter
    let matchesRole = true
    if (filterRole === "all") {
      matchesRole = true
    } else {
      matchesRole = roleOf(user) === filterRole
    }
    
    // Then apply admin visibility filter
    let matchesAdminFilter = true
    if (!showAdmins && roleOf(user) === "admin") {
      matchesAdminFilter = false
    }
    
    return matchesRole && matchesAdminFilter
  })

  if (permLoading || loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!can(Permission.VIEW_USERS)) {
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
                backgroundColor: `${COLORS.primary}15`,
                color: COLORS.primary,
              }}
            >
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                User Management
              </h1>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                {isAdmin ? "Manage all users and organizations" : "Manage your organization's employees"}
              </p>
            </div>
          </div>

          {can(Permission.CREATE_USER) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
              style={{
                background: COLORS.primary,
                color: COLORS.textWhite,
              }}
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setFilterRole("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterRole === "all" ? "shadow-md" : ""
              }`}
              style={{
                background: filterRole === "all" ? COLORS.primary : COLORS.bgWhite,
                color: filterRole === "all" ? COLORS.textWhite : COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              All Users ({users.filter((u) => showAdmins || roleOf(u) !== "admin").length})
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setFilterRole("organization")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterRole === "organization" ? "shadow-md" : ""
                  }`}
                  style={{
                    background: filterRole === "organization" ? COLORS.primary : COLORS.bgWhite,
                    color: filterRole === "organization" ? COLORS.textWhite : COLORS.textPrimary,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  Organizations ({users.filter((u) => roleOf(u) === "organization").length})
                </button>
                <button
                  onClick={() => setFilterRole("admin")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterRole === "admin" ? "shadow-md" : ""
                  }`}
                  style={{
                    background: filterRole === "admin" ? COLORS.primary : COLORS.bgWhite,
                    color: filterRole === "admin" ? COLORS.textWhite : COLORS.textPrimary,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  Admins ({users.filter((u) => roleOf(u) === "admin").length})
                </button>
              </>
            )}
            <button
              onClick={() => setFilterRole("employee")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterRole === "employee" ? "shadow-md" : ""
              }`}
              style={{
                background: filterRole === "employee" ? COLORS.primary : COLORS.bgWhite,
                color: filterRole === "employee" ? COLORS.textWhite : COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              Employees ({users.filter((u) => roleOf(u) === "employee").length})
            </button>
          </div>
          
          {/* Toggle to show/hide admins */}
          {isAdmin && (
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{ border: `1px solid ${COLORS.border}` }}>
              <input
                type="checkbox"
                checked={showAdmins}
                onChange={(e) => setShowAdmins(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: COLORS.primary }}
              />
              <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                Show Admin Users
              </span>
            </label>
          )}
        </div>

        {/* Users Table */}
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
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                  Role
                </th>
                {isAdmin && (
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                    Organization
                  </th>
                )}
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                  Created
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-t hover:bg-opacity-50"
                  style={{ borderColor: COLORS.border }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            roleOf(user) === "admin"
                              ? `${COLORS.blue500}20`
                              : roleOf(user) === "organization"
                              ? `${COLORS.green500}20`
                              : `${COLORS.gray500}20`,
                          color:
                            roleOf(user) === "admin"
                              ? COLORS.blue500
                              : roleOf(user) === "organization"
                              ? COLORS.green500
                              : COLORS.gray500,
                        }}
                      >
                        {roleOf(user) === "organization" ? (
                          <Building2 className="w-5 h-5" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: COLORS.textPrimary }}>
                          {user.name}
                        </p>
                        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                      style={{
                        background:
                          roleOf(user) === "admin"
                            ? `${COLORS.blue500}20`
                            : roleOf(user) === "organization"
                            ? `${COLORS.green500}20`
                            : `${COLORS.gray500}20`,
                        color:
                          roleOf(user) === "admin"
                            ? COLORS.blue500
                            : roleOf(user) === "organization"
                            ? COLORS.green500
                            : COLORS.gray500,
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                        {user.organizationName || "-"}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {can(Permission.EDIT_USER) && (
                        <button
                          className="p-2 rounded-lg hover:bg-opacity-10 transition-all"
                          style={{ color: COLORS.blue500 }}
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {can(Permission.DELETE_USER) && (
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="p-2 rounded-lg hover:bg-opacity-10 transition-all"
                          style={{ color: COLORS.pink600 }}
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.textLight }} />
              <p className="text-xl font-semibold mb-2" style={{ color: COLORS.textPrimary }}>
                {filterRole === "all" ? "No Users Found" : `No ${filterRole.charAt(0).toUpperCase() + filterRole.slice(1)} Users`}
              </p>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                {filterRole === "all" 
                  ? "Create your first user by clicking the 'Add User' button above"
                  : `There are no ${filterRole} users yet. Try selecting a different filter or create a new user.`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          isAdmin={isAdmin}
          isOrganization={isOrganization}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadUsers()
          }}
        />
      )}
    </div>
  )
}

interface AddUserModalProps {
  isAdmin: boolean
  isOrganization: boolean
  onClose: () => void
  onSuccess: () => void
}

function AddUserModal({ isAdmin, isOrganization, onClose, onSuccess }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
    organizationId: "",
  })
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load organizations when component mounts and user can create employees
    if (isAdmin || isOrganization) {
      loadOrganizations()
    }
  }, [isAdmin, isOrganization])

  const loadOrganizations = async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("🔄 Loading organizations...")
      
      const response = await fetch("/api/organizations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Organizations loaded:", data.length, "organizations")
        console.log("📋 Organizations data:", data)
        setOrganizations(data)
        
        if (data.length === 0) {
          console.warn("⚠️ No organizations found. Backend may not be running or no organizations exist.")
        }
      } else {
        console.error("❌ Failed to load organizations:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("❌ Error loading organizations:", error)
      console.log("💡 Tip: Make sure your backend server is running at http://localhost:5000")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      
      // Prepare data based on role
      const userData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }

      // Add organization-specific fields
      if (formData.role === "Organization") {
        // Use the user's name and email as organization details
        userData.organizationName = formData.name
        userData.organizationEmail = formData.email
      } else if (formData.role === "Employee" && formData.organizationId) {
        userData.organizationId = formData.organizationId
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create user")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Failed to create user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="rounded-xl shadow-xl w-full max-w-md"
        style={{ background: COLORS.bgWhite }}
      >
        <div
          className="p-6 border-b"
          style={{ borderColor: COLORS.border }}
        >
          <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
            Add New User
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: COLORS.border }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: COLORS.border }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
              Password *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: COLORS.border }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
              Role *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: COLORS.border }}
            >
              {isAdmin && <option value="Organization">Organization</option>}
              <option value="Employee">Employee</option>
            </select>
          </div>

          {/* Organization-specific fields */}
          {formData.role === "Organization" && (
            <div className="p-4 rounded-lg" style={{ background: `${COLORS.blue500}10`, border: `1px solid ${COLORS.blue500}30` }}>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                <strong>Note:</strong> The name and email you entered above will be used as the organization's details.
              </p>
            </div>
          )}

          {isAdmin && formData.role === "Employee" && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                Organization
              </label>
              <select
                value={formData.organizationId}
                onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: COLORS.border }}
              >
                <option value="">No Organization</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {organizations.length === 0 && (
                <p className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>
                  💡 No organizations available. Create an organization user first.
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg font-medium hover:shadow-md transition-all"
              style={{
                background: COLORS.primary,
                color: COLORS.textWhite,
              }}
            >
              {loading ? "Creating..." : "Create User"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium hover:shadow-md transition-all"
              style={{
                background: COLORS.bgGray,
                color: COLORS.textPrimary,
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

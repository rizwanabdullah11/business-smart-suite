"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, Permission, Role } from "@/lib/types/permissions"
import { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  can: (permission: Permission) => boolean
  canAny: (permissions: Permission[]) => boolean
  canAll: (permissions: Permission[]) => boolean
  isRole: (role: Role) => boolean
  isAnyRole: (roles: Role[]) => boolean
  isAdmin: boolean
  isOrganization: boolean
  isEmployee: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      // Check if token exists
      const token = localStorage.getItem("token")
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token invalid or expired
        setUser(null)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        if (e.newValue) {
          // Token added/changed - refresh user
          fetchUser()
        } else {
          // Token removed - clear user
          setUser(null)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const logout = async () => {
    try {
      // Call your logout API endpoint if you have one
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
      
      // Clear local storage
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      // Clear cookies
      document.cookie = "token=; path=/; max-age=0"
      
      // Clear user state
      setUser(null)
      
      // Redirect to login
      window.location.href = "/login"
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    can: (permission: Permission) => hasPermission(user, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(user, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(user, permissions),
    isRole: (role: Role) => hasRole(user, role),
    isAnyRole: (roles: Role[]) => hasAnyRole(user, roles),
    isAdmin: hasRole(user, Role.ADMIN),
    isOrganization: hasRole(user, Role.ORGANIZATION),
    isEmployee: hasRole(user, Role.EMPLOYEE),
    refreshUser: fetchUser,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

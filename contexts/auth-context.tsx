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
        console.log("⚠️ Auth: No token found")
        setUser(null)
        setLoading(false)
        return
      }

      console.log("🔍 Auth: Fetching user data...")
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        console.log("✅ Auth: User loaded -", userData.name, `(${userData.role})`)
        setUser(userData)
      } else {
        // Token invalid or expired
        console.log("❌ Auth: Token invalid or expired")
        setUser(null)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    } catch (error) {
      console.error("❌ Auth: Error fetching user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()

    // Listen for storage changes (login/logout in other tabs or same tab)
    const handleStorageChange = (e: StorageEvent | Event) => {
      // For custom storage events (triggered by login/logout)
      if (e instanceof Event && e.type === 'storage') {
        console.log("🔄 Auth: Storage event detected, refreshing user...")
        fetchUser()
        return
      }
      
      // For actual storage events from other tabs
      if (e instanceof StorageEvent && e.key === "token") {
        console.log("🔄 Auth: Token changed, refreshing user...")
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
    
    // Also listen for custom auth events
    const handleAuthChange = () => {
      console.log("🔄 Auth: Auth change event detected, refreshing user...")
      fetchUser()
    }
    
    window.addEventListener("auth-change", handleAuthChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("auth-change", handleAuthChange)
    }
  }, [])

  const logout = async () => {
    try {
      console.log("🚪 Auth: Logging out...")
      
      // Call your logout API endpoint if you have one
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
      
      // Clear local storage
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      // Clear cookies
      document.cookie = "token=; path=/; max-age=0"
      
      // Clear user state immediately
      setUser(null)
      
      console.log("✅ Auth: Logout complete, redirecting to login...")
      
      // Redirect to login (no hard reload needed)
      window.location.href = "/login"
    } catch (error) {
      console.error("Error logging out:", error)
      // Still clear everything even if API call fails
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      window.location.href = "/login"
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

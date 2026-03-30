"use client"

import { useState } from "react"
import Link from "next/link"
import { BarChart2, ChevronRight, LayoutDashboard, LogOut } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { DASHBOARD_MODULE_GROUPS } from "@/constant/dashboard-module-groups"

type AppNavigationDrawerProps = {
  open: boolean
  onClose: () => void
  user: { name?: string; email?: string; role?: string } | null
  onLogout: () => void
}

export function AppNavigationDrawer({ open, onClose, user, onLogout }: AppNavigationDrawerProps) {
  const { can, loading } = usePermissions()
  const [openSection, setOpenSection] = useState<string | null>(null)

  const userInitial = String(user?.name || user?.email || "U").charAt(0).toUpperCase()

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title))
  }

  const handleLogout = async () => {
    onClose()
    await onLogout()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[60] transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.55)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          backdropFilter: open ? "blur(4px)" : "none",
        }}
        onClick={onClose}
        aria-hidden={!open}
      />

      <div
        className="fixed top-0 left-0 h-screen z-[70] flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: 280,
          background: "#1a0533",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          boxShadow: open ? "8px 0 40px rgba(0,0,0,0.5)" : "none",
        }}
      >
        <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
            >
              <span className="text-base font-black text-white">B</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Business Smart Suite</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                Navigation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.5)" }}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg,#6d28d9,#a855f7)" }}
            >
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || "User"}</p>
              <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                {user?.email || user?.role || ""}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <Link href="/dashboard" onClick={onClose}>
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
              <span className="text-sm font-semibold">Home</span>
            </div>
          </Link>
          <Link href="/dashboard/analytics" onClick={onClose}>
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3 transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              <BarChart2 className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
              <span className="text-sm font-semibold">Dashboard</span>
            </div>
          </Link>

          {loading ? (
            <div className="px-3 py-2 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Loading…
            </div>
          ) : (
            DASHBOARD_MODULE_GROUPS.map((group) => {
              const GroupIcon = group.icon
              const isOpen = openSection === group.title
              const visibleMods = group.modules.filter((m) => !m.permission || can(m.permission))
              if (visibleMods.length === 0) return null
              return (
                <div key={group.title} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleSection(group.title)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all hover:bg-white/10"
                    style={{
                      color: isOpen ? "#fff" : "rgba(255,255,255,0.7)",
                      background: isOpen ? "rgba(255,255,255,0.06)" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: group.moduleGradient }}
                      >
                        <GroupIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-bold">{group.title}</span>
                    </div>
                    <ChevronRight
                      className="w-3.5 h-3.5 transition-transform duration-200 shrink-0"
                      style={{ color: "rgba(255,255,255,0.35)", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-1 ml-2 space-y-0.5">
                      {visibleMods.map((mod) => {
                        const ModIcon = mod.icon
                        return (
                          <Link key={mod.href} href={mod.href} onClick={onClose}>
                            <div
                              className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-white/10"
                              style={{ color: "rgba(255,255,255,0.7)" }}
                            >
                              <ModIcon className="w-3.5 h-3.5 shrink-0" style={{ color: group.color }} />
                              <span className="text-xs font-medium">{mod.label}</span>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </nav>

        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

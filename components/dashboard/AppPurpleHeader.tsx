"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, LogOut } from "lucide-react"
import { AppNavigationDrawer } from "@/components/dashboard/AppNavigationDrawer"

type AppPurpleHeaderProps = {
  user: { name?: string; email?: string; role?: string } | null
  onLogout: () => void | Promise<void>
  onAddFolder: () => void
}

/** Fixed purple gradient header — matches home / marketing style on every screen */
export function AppPurpleHeader({ user, onLogout, onAddFolder }: AppPurpleHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const userInitial = String(user?.name || user?.email || "U").charAt(0).toUpperCase()

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 min-h-[72px]"
        style={{
          background: "linear-gradient(90deg, #3b0764 0%, #5b21b6 45%, #6d28d9 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 4px 24px rgba(59, 7, 100, 0.35)",
        }}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              boxShadow: "0 4px 14px rgba(124,58,237,0.45)",
            }}
            title="Open navigation"
            aria-label="Open navigation menu"
          >
            <span className="text-lg sm:text-xl font-black text-white">B</span>
          </button>
          <div className="min-w-0">
            <p className="text-base sm:text-lg font-black text-white tracking-tight leading-tight truncate">
              Business Smart Suite
            </p>
            <p className="text-[11px] sm:text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.65)" }}>
              Your comprehensive business management portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link href="/dashboard/analytics">
            <button
              type="button"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                boxShadow: "0 4px 12px rgba(124,58,237,0.35)",
              }}
            >
              Dashboard
            </button>
          </Link>
          <button
            type="button"
            onClick={onAddFolder}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all hover:bg-white/15 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Add Folder</span>
          </button>

          <div
            className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 ml-1"
            style={{ borderLeft: "1px solid rgba(255,255,255,0.15)" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg,#6d28d9,#a855f7)" }}
            >
              {userInitial}
            </div>
            <span
              className="text-xs sm:text-sm font-medium max-w-[100px] sm:max-w-[160px] truncate hidden md:block"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              {user?.name || user?.email || "User"}
            </span>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.85)" }}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <AppNavigationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} onLogout={onLogout} />
    </>
  )
}

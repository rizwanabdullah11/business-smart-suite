"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookOpen, FileText, ClipboardList, FileInput, Award,
  Briefcase, Users, FileIcon, FileWarning, AlertOctagon,
  FileCode, AlertTriangle, Calendar, Target, PenTool,
  BarChart2, FileCheck, Scale, Truck, GraduationCap,
  Zap, MessageSquare, Shield, TrendingUp, BarChart,
  Settings, LayoutDashboard, Plus, FolderPlus, ChevronRight,
  LogOut,
} from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { useAuth } from "@/contexts/auth-context"
import { Permission } from "@/lib/types/permissions"

type ModuleItem = {
  icon: any
  label: string
  href: string
  permission?: Permission
}

type ModuleGroup = {
  title: string
  subtitle: string
  icon: any
  color: string
  bgGradient: string
  iconGradient: string
  moduleGradient: string
  shadow: string
  modules: ModuleItem[]
}

const MODULE_GROUPS: ModuleGroup[] = [
  {
    title: "Core Management",
    subtitle: "Documents & records",
    icon: Shield,
    color: "#2563eb",
    bgGradient: "linear-gradient(160deg,#0f1f3d 0%,#1a2f5a 60%,#1e3a6e 100%)",
    iconGradient: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    moduleGradient: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    shadow: "0 8px 32px rgba(37,99,235,0.25)",
    modules: [
      { icon: BookOpen, label: "Manual", href: "/manual", permission: Permission.VIEW_MANUALS },
      { icon: FileText, label: "Policies", href: "/policies", permission: Permission.VIEW_POLICIES },
      { icon: ClipboardList, label: "Procedures", href: "/procedures", permission: Permission.VIEW_PROCEDURES },
      { icon: FileInput, label: "Forms", href: "/forms", permission: Permission.VIEW_FORMS },
      { icon: Award, label: "Certificates", href: "/certificate", permission: Permission.VIEW_CERTIFICATES },
    ],
  },
  {
    title: "Compliance & Risk",
    subtitle: "Standards & auditing",
    icon: TrendingUp,
    color: "#7c3aed",
    bgGradient: "linear-gradient(160deg,#1a0d2e 0%,#2d1654 60%,#3b1c6e 100%)",
    iconGradient: "linear-gradient(135deg,#6d28d9,#a855f7)",
    moduleGradient: "linear-gradient(135deg,#6d28d9,#a855f7)",
    shadow: "0 8px 32px rgba(109,40,217,0.25)",
    modules: [
      { icon: Briefcase, label: "Business Continuity", href: "/business-continuity" },
      { icon: Users, label: "Management Reviews", href: "/management-reviews" },
      { icon: FileIcon, label: "Job Descriptions", href: "/job-descriptions" },
      { icon: FileWarning, label: "Work Instructions", href: "/work-instructions" },
      { icon: AlertOctagon, label: "Risk Assessments", href: "/risk-assessments", permission: Permission.VIEW_RISK_ASSESSMENTS },
      { icon: AlertOctagon, label: "COSHH", href: "/coshh", permission: Permission.VIEW_COSHH },
      { icon: FileCode, label: "Technical File", href: "/technical-file" },
      { icon: AlertTriangle, label: "IMS Aspects & Impacts", href: "/ims-aspects-impacts" },
    ],
  },
  {
    title: "Registers & Records",
    subtitle: "Operations & compliance",
    icon: BarChart,
    color: "#059669",
    bgGradient: "linear-gradient(160deg,#052e1a 0%,#064e2e 60%,#065f38 100%)",
    iconGradient: "linear-gradient(135deg,#047857,#10b981)",
    moduleGradient: "linear-gradient(135deg,#047857,#10b981)",
    shadow: "0 8px 32px rgba(5,150,105,0.25)",
    modules: [
      { icon: Calendar, label: "Audit Schedule", href: "/audit-schedule", permission: Permission.VIEW_AUDIT_SCHEDULE },
      { icon: Users, label: "Interested Parties", href: "/interested-parties" },
      { icon: FileText, label: "Organisational Context", href: "/organisational-context" },
      { icon: Target, label: "Objectives", href: "/objectives" },
      { icon: PenTool, label: "Maintenance", href: "/maintenance" },
      { icon: BarChart2, label: "Improvement Register", href: "/improvement-register", permission: Permission.VIEW_IMPROVEMENTS },
      { icon: FileCheck, label: "Statement of Applicability", href: "/statement-of-applicability" },
      { icon: Scale, label: "Legal Register", href: "/legal-register" },
      { icon: Truck, label: "Suppliers", href: "/suppliers" },
      { icon: GraduationCap, label: "Training", href: "/training" },
      { icon: Zap, label: "Energy Consumption", href: "/energy-consumption" },
      { icon: MessageSquare, label: "Customer Feedback", href: "/customer-feedback" },
    ],
  },
  {
    title: "Administration",
    subtitle: "Users & settings",
    icon: Settings,
    color: "#ea580c",
    bgGradient: "linear-gradient(160deg,#2c1200 0%,#4a1f00 60%,#5c2700 100%)",
    iconGradient: "linear-gradient(135deg,#c2410c,#f97316)",
    moduleGradient: "linear-gradient(135deg,#c2410c,#f97316)",
    shadow: "0 8px 32px rgba(194,65,12,0.25)",
    modules: [
      { icon: Users, label: "Users", href: "/admin/users", permission: Permission.VIEW_USERS },
      { icon: Users, label: "Permissions", href: "/admin/permissions", permission: Permission.MANAGE_ROLES },
      { icon: BarChart2, label: "Diagnostics", href: "/admin/diagnostics", permission: Permission.MANAGE_ROLES },
    ],
  },
]

type AddFolderModalProps = {
  open: boolean
  onClose: () => void
}

function AddFolderModal({ open, onClose }: AddFolderModalProps) {
  const [name, setName] = useState("")

  if (!open) return null

  const handleSave = () => {
    if (!name.trim()) return
    try {
      const existing = JSON.parse(localStorage.getItem("customDashboardSections") || "[]")
      existing.push({ title: name.trim(), icon: "folder", moduleHrefs: [] })
      localStorage.setItem("customDashboardSections", JSON.stringify(existing))
      window.dispatchEvent(new Event("custom-sections-updated"))
    } catch {}
    setName("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "#1e1040", border: "1px solid rgba(255,255,255,0.12)" }}>
        <h3 className="text-lg font-bold text-white mb-4">Add Custom Folder</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Folder name…"
          className="w-full rounded-xl px-4 py-2.5 text-white text-sm mb-4 outline-none focus:ring-2 focus:ring-purple-400"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>Cancel</button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export function ModuleHubContent() {
  const router = useRouter()
  const { can, loading } = usePermissions()
  const { user, logout } = useAuth()
  const [addFolderOpen, setAddFolderOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerSection, setDrawerSection] = useState<string | null>(null)

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const userInitial = String(user?.name || user?.email || "U").charAt(0).toUpperCase()

  const toggleDrawerSection = (title: string) => {
    setDrawerSection((prev) => (prev === title ? null : title))
  }

  const visibleGroups = MODULE_GROUPS.map((group) => ({
    ...group,
    modules: group.modules.filter((m) => !m.permission || can(m.permission)),
  })).filter((group) => group.modules.length > 0)

  const toggleGroup = (title: string) => {
    setOpenGroup((prev) => (prev === title ? null : title))
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "linear-gradient(135deg,#3b0764 0%,#4c1d95 30%,#5b21b6 60%,#6d28d9 100%)" }}
    >
      {/* Decorative background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle,#a855f7,transparent)" }} />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle,#7c3aed,transparent)" }} />
        <div className="absolute -bottom-20 right-1/3 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#c084fc,transparent)" }} />
      </div>

      <div className="relative z-10 px-6 py-8 max-w-[1400px] mx-auto">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-8">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 16px rgba(124,58,237,0.5)" }}
              title="Open navigation"
            >
              <span className="text-2xl font-black text-white">B</span>
            </button>
            <div>
              <h1 className="text-2xl font-black text-white leading-tight">Business Smart Suite</h1>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>Your comprehensive business management portal</p>
            </div>
          </div>

          {/* Actions + user */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard/analytics">
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 14px rgba(124,58,237,0.4)" }}
              >
                Analytics Dashboard
              </button>
            </Link>
            <button
              onClick={() => setAddFolderOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/20 active:scale-95"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}
            >
              <Plus className="w-4 h-4" />
              Add Folder
            </button>
            {/* User + Logout */}
            <div className="flex items-center gap-2 pl-3" style={{ borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: "linear-gradient(135deg,#6d28d9,#a855f7)" }}
              >
                {userInitial}
              </div>
              <span className="text-sm font-medium max-w-[140px] truncate hidden sm:block" style={{ color: "rgba(255,255,255,0.8)" }}>
                {user?.name || user?.email || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/15 active:scale-95"
                style={{ color: "rgba(255,255,255,0.7)" }}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Module Groups Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-white opacity-60 text-sm">Loading modules…</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ alignItems: "start" }}>
            {visibleGroups.map((group) => {
              const GroupIcon = group.icon
              const isCollapsed = openGroup !== group.title
              return (
                <div
                  key={group.title}
                  className="rounded-2xl overflow-hidden transition-all duration-300"
                  style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: group.shadow, backdropFilter: "blur(12px)" }}
                >
                  {/* Card Header — clickable to collapse */}
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full relative flex items-center gap-5 px-6 py-7 overflow-hidden transition-all duration-200 hover:brightness-110"
                    style={{ background: group.bgGradient }}
                  >
                    {/* Decorative orb */}
                    <div
                      className="absolute -right-8 -top-8 w-36 h-36 rounded-full pointer-events-none"
                      style={{ background: `radial-gradient(circle,${group.color}44,transparent)` }}
                    />
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 relative z-10"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      <GroupIcon className="w-6 h-6" style={{ color: group.color }} />
                    </div>
                    <div className="relative z-10 flex-1 text-left">
                      <h2 className="text-2xl font-black text-white leading-tight">{group.title}</h2>
                      <p className="text-xs mt-1 font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                        {group.modules.length} module{group.modules.length !== 1 ? "s" : ""} · {group.subtitle}
                      </p>
                    </div>
                    {/* Chevron */}
                    <ChevronRight
                      className="w-5 h-5 relative z-10 shrink-0 transition-transform duration-300"
                      style={{ color: "rgba(255,255,255,0.5)", transform: isCollapsed ? "rotate(0deg)" : "rotate(90deg)" }}
                    />
                  </button>

                  {/* Module Grid — collapsible */}
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: isCollapsed ? 0 : "1000px", opacity: isCollapsed ? 0 : 1 }}
                  >
                    <div className="p-5">
                      <div className="grid grid-cols-3 gap-3">
                        {group.modules.map((mod) => {
                          const ModIcon = mod.icon
                          return (
                            <Link key={mod.href} href={mod.href}>
                              <div
                                className="group flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                              >
                                <div
                                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:shadow-lg"
                                  style={{ background: group.moduleGradient }}
                                >
                                  <ModIcon className="w-5 h-5 text-white" />
                                </div>
                                <span
                                  className="text-center text-xs font-semibold leading-tight"
                                  style={{ color: "rgba(255,255,255,0.85)" }}
                                >
                                  {mod.label}
                                </span>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AddFolderModal open={addFolderOpen} onClose={() => setAddFolderOpen(false)} />

      {/* ── Navigation Drawer ── */}
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.55)",
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
          backdropFilter: drawerOpen ? "blur(4px)" : "none",
        }}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div
        className="fixed top-0 left-0 h-screen z-50 flex flex-col transition-transform duration-300"
        style={{
          width: 280,
          background: "#1a0533",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          boxShadow: drawerOpen ? "8px 0 40px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* Drawer Header */}
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
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>Navigation</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            ✕
          </button>
        </div>

        {/* User info */}
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
              <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{user?.email || user?.role || ""}</p>
            </div>
          </div>
        </div>

        {/* Nav Sections */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {/* Dashboard home */}
          <Link href="/dashboard" onClick={() => setDrawerOpen(false)}>
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
              <span className="text-sm font-semibold">Home</span>
            </div>
          </Link>
          <Link href="/dashboard/analytics" onClick={() => setDrawerOpen(false)}>
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3 transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              <BarChart2 className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
              <span className="text-sm font-semibold">Analytics Dashboard</span>
            </div>
          </Link>

          {/* Module groups */}
          {MODULE_GROUPS.map((group) => {
            const GroupIcon = group.icon
            const isOpen = drawerSection === group.title
            const visibleMods = group.modules.filter((m) => !m.permission || can(m.permission))
            if (visibleMods.length === 0) return null
            return (
              <div key={group.title} className="mb-1">
                <button
                  onClick={() => toggleDrawerSection(group.title)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all hover:bg-white/08"
                  style={{ color: isOpen ? "#fff" : "rgba(255,255,255,0.7)", background: isOpen ? "rgba(255,255,255,0.06)" : "transparent" }}
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
                        <Link key={mod.href} href={mod.href} onClick={() => setDrawerOpen(false)}>
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
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}

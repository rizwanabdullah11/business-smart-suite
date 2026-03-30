"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { DASHBOARD_MODULE_GROUPS } from "@/constant/dashboard-module-groups"

export function ModuleHubContent() {
  const { can, loading } = usePermissions()
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const visibleGroups = DASHBOARD_MODULE_GROUPS.map((group) => ({
    ...group,
    modules: group.modules.filter((m) => !m.permission || can(m.permission)),
  })).filter((group) => group.modules.length > 0)

  const toggleGroup = (title: string) => {
    setOpenGroup((prev) => (prev === title ? null : title))
  }

  return (
    <div
      className="min-h-[calc(100vh-5.25rem)] w-full"
      style={{ background: "linear-gradient(135deg,#3b0764 0%,#4c1d95 30%,#5b21b6 60%,#6d28d9 100%)" }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle,#a855f7,transparent)" }}
        />
        <div
          className="absolute top-1/2 -left-32 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle,#7c3aed,transparent)" }}
        />
        <div
          className="absolute -bottom-20 right-1/3 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#c084fc,transparent)" }}
        />
        {/* Subtle dot grid — home only */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 px-5 sm:px-8 pt-6 pb-12 max-w-[1400px] mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-white opacity-60 text-sm">Loading modules…</div>
          </div>
        ) : (
          <>
            {/* Welcome hero — same branding emphasis as before (actions live in global header) */}
            <div className="mb-10 lg:mb-12">
              <div
                className="relative overflow-hidden rounded-3xl border px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14"
                style={{
                  borderColor: "rgba(255,255,255,0.12)",
                  background: "linear-gradient(145deg, rgba(0,0,0,0.35) 0%, rgba(26,5,51,0.45) 100%)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 25px 60px -15px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="absolute -right-20 -top-20 w-72 h-72 rounded-full pointer-events-none opacity-30"
                  style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }}
                />
                <div
                  className="absolute -left-16 bottom-0 w-56 h-56 rounded-full pointer-events-none opacity-20"
                  style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }}
                />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
                  <div className="flex items-start gap-5 min-w-0">
                    <div
                      className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                      style={{
                        background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                        boxShadow: "0 8px 32px rgba(124,58,237,0.45)",
                      }}
                      aria-hidden
                    >
                      <span className="text-3xl sm:text-4xl font-black text-white leading-none">B</span>
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p
                        className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-2"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        Welcome back
                      </p>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08]">
                        Business Smart Suite
                      </h1>
                      <p
                        className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.65)" }}
                      >
                        Your comprehensive business management portal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ alignItems: "start" }}>
            {visibleGroups.map((group) => {
              const GroupIcon = group.icon
              const isCollapsed = openGroup !== group.title
              return (
                <div
                  key={group.title}
                  className="rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: group.shadow,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.title)}
                    className="w-full relative flex items-center gap-5 px-6 py-7 overflow-hidden transition-all duration-200 hover:brightness-110"
                    style={{ background: group.bgGradient }}
                  >
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
                    <ChevronRight
                      className="w-5 h-5 relative z-10 shrink-0 transition-transform duration-300"
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        transform: isCollapsed ? "rotate(0deg)" : "rotate(90deg)",
                      }}
                    />
                  </button>

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
                                style={{
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.07)",
                                }}
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
          </>
        )}
      </div>
    </div>
  )
}

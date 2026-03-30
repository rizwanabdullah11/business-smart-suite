"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, Search, LogOut, Plus, BarChart2 } from "lucide-react"
import Link from "next/link"
import { COLORS } from "@/constant/colors"

interface TopNavbarProps {
    user: any
    isCollapsed: boolean
    onLogout: () => void
    onAddFolder: () => void
}

export function TopNavbar({ user, isCollapsed, onLogout, onAddFolder }: TopNavbarProps) {
    const [organizations, setOrganizations] = useState<Array<{ _id: string; name?: string; email?: string }>>([])
    const [activeOrganizationId, setActiveOrganizationId] = useState("")
    const isAdmin = useMemo(() => String(user?.role || "").toLowerCase() === "admin", [user?.role])

    useEffect(() => {
        if (!isAdmin) return

        const token = localStorage.getItem("token")
        if (!token) return

        const selected = localStorage.getItem("activeOrganizationId") || ""
        setActiveOrganizationId(selected)

        fetch("/api/organizations", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => (res.ok ? res.json() : []))
            .then((rows) => {
                setOrganizations(Array.isArray(rows) ? rows : [])
            })
            .catch(() => {
                setOrganizations([])
            })
    }, [isAdmin])

    const onOrganizationChange = (value: string) => {
        setActiveOrganizationId(value)
        if (value) localStorage.setItem("activeOrganizationId", value)
        else localStorage.removeItem("activeOrganizationId")
        window.dispatchEvent(new Event("organization-change"))
        window.location.reload()
    }

    return (
        <header
            className="fixed top-0 left-0 right-0 h-20 border-b z-30 flex items-center justify-between backdrop-blur-md transition-all duration-300"
            style={{
                background: COLORS.bgWhite,
                borderColor: COLORS.border,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                paddingLeft: isCollapsed ? '112px' : '312px', // Sidebar width (80/280) + 32px (main padding)
                paddingRight: '2rem'
            }}
        >
            {/* Left Section - Welcome Message */}
            <div className="hidden xl:block">
                <h1 className="text-xl font-bold" style={{ color: COLORS.textPrimary }}>
                    {user ? `Welcome back, ${user.name}` : 'Welcome back'}
                </h1>
                <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                    Here is an overview of your compliance status
                </p>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2 ml-auto">
                {/* Search */}
                <div className="relative hidden lg:block">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all w-48"
                        style={{
                            borderColor: COLORS.border,
                            background: COLORS.bgGrayLight,
                            color: COLORS.textPrimary
                        }}
                    />
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: COLORS.textSecondary }}
                    />
                </div>

                {isAdmin ? (
                    <div className="hidden xl:block">
                        <select
                            value={activeOrganizationId}
                            onChange={(e) => onOrganizationChange(e.target.value)}
                            className="px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                            style={{
                                borderColor: COLORS.border,
                                background: COLORS.bgWhite,
                                color: COLORS.textPrimary,
                            }}
                            title="Switch organization scope"
                        >
                            <option value="">All Organizations</option>
                            {organizations.map((org) => (
                                <option key={org._id} value={org._id}>
                                    {org.name || org.email || org._id}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}

                {/* Analytics Button */}
                <Link href="/analytics">
                    <button
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{
                            background: COLORS.gradientCyan,
                            color: COLORS.textWhite,
                            boxShadow: COLORS.shadowBlue
                        }}
                    >
                        <BarChart2 className="w-4 h-4" />
                        <span className="hidden xl:inline">Analytics</span>
                    </button>
                </Link>

                {/* Add Folder Button */}
                <button
                    onClick={onAddFolder}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{
                        background: "linear-gradient(135deg, #7c3aed 0%, #341746 100%)",
                        color: COLORS.textWhite,
                        boxShadow: COLORS.shadowPurple
                    }}
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden xl:inline">Add Folder</span>
                </button>

                {/* Notifications */}
                <button
                    className="relative p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                    style={{
                        color: COLORS.textSecondary
                    }}
                >
                    <Bell className="w-4 h-4" />
                    <span
                        className="absolute top-1 right-1 w-2 h-2 rounded-full"
                        style={{ background: COLORS.orange500 }}
                    />
                </button>

                {/* User Profile & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: COLORS.border }}>
                    <div className="hidden xl:block text-right">
                        <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
                            {user?.name || 'User'}
                        </p>
                        <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                            {user?.role || 'Administrator'}
                        </p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                        title="Logout"
                        style={{ color: COLORS.textSecondary }}
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    )
}

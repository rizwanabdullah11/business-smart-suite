"use client"

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
    return (
        <header
            className="fixed top-0 left-0 right-0 h-20 border-b z-30 flex items-center justify-between backdrop-blur-md transition-all duration-300"
            style={{
                background: `linear-gradient(135deg, ${COLORS.indigo600} 0%, ${COLORS.purple600} 50%, ${COLORS.pink600} 100%)`,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                paddingLeft: isCollapsed ? '112px' : '312px', // Sidebar width (80/280) + 32px (main padding)
                paddingRight: '2rem'
            }}
        >
            {/* Left Section - Welcome Message */}
            <div className="hidden xl:block">
                <h1 className="text-xl font-bold text-white">
                    {user ? `Welcome back, ${user.name}` : 'Welcome back'}
                </h1>
                <p className="text-sm text-white opacity-90">
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
                        className="pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-white transition-all w-48 text-white placeholder-white"
                        style={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.15)',
                        }}
                    />
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-75"
                    />
                </div>

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
                        background: COLORS.gradientIndigo,
                        color: COLORS.textWhite,
                        boxShadow: COLORS.shadowPurple
                    }}
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden xl:inline">Add Folder</span>
                </button>

                {/* Notifications */}
                <button
                    className="relative p-2 rounded-lg transition-all duration-200 hover:bg-white hover:bg-opacity-20"
                    style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        color: 'white'
                    }}
                >
                    <Bell className="w-4 h-4" />
                    <span
                        className="absolute top-1 right-1 w-2 h-2 rounded-full"
                        style={{ background: COLORS.orange500 }}
                    />
                </button>

                {/* User Profile & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-white border-opacity-30">
                    <div className="hidden xl:block text-right">
                        <p className="text-sm font-bold text-white">
                            {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-white opacity-75">
                            {user?.role || 'Administrator'}
                        </p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2 rounded-lg transition-all duration-200 hover:bg-white hover:bg-opacity-20 text-white"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    )
}

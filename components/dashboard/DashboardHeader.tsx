"use client"

import Link from "next/link"
import { Plus, LogOut } from "lucide-react"
import { COLORS } from "@/constant/colors"

interface DashboardHeaderProps {
    onAddFolder: () => void;
    user: any;
    onLogout: () => void;
}

export function DashboardHeader({ onAddFolder, user, onLogout }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-16">
            <div className="flex-1">
                <h1
                    className="text-5xl font-bold mb-3 leading-tight"
                    style={{ color: COLORS.textPrimary }}
                >
                    {user ? `Welcome back, ${user.name}` : 'Business Smart Suite'}
                </h1>
                <p
                    className="text-xl leading-relaxed"
                    style={{ color: COLORS.textSecondary }}
                >
                    {user ? 'Here is an overview of your compliance status' : 'A clean, modern portal for managing your business'}
                </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
                <Link href="/analytics">
                    <button
                        className="font-bold px-8 py-4 rounded-lg text-lg transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{
                            background: COLORS.blue500,
                            color: COLORS.textWhite,
                            boxShadow: COLORS.shadowMd
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = COLORS.blue600
                            e.currentTarget.style.boxShadow = COLORS.shadowLg
                            e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = COLORS.blue500
                            e.currentTarget.style.boxShadow = COLORS.shadowMd
                            e.currentTarget.style.transform = 'translateY(0)'
                        }}
                    >
                        Analytics
                    </button>
                </Link>
                <button
                    className="font-bold px-8 py-4 rounded-lg text-lg transition-all duration-200 focus:outline-none focus:ring-2 flex items-center gap-3"
                    style={{
                        background: COLORS.primary,
                        color: COLORS.textWhite,
                        boxShadow: COLORS.shadowMd
                    }}
                    onClick={onAddFolder}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = COLORS.primaryLight
                        e.currentTarget.style.boxShadow = COLORS.shadowLg
                        e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = COLORS.primary
                        e.currentTarget.style.boxShadow = COLORS.shadowMd
                        e.currentTarget.style.transform = 'translateY(0)'
                    }}
                >
                    <Plus className="w-5 h-5" />
                    Add Folder
                </button>
                <button
                    className="font-bold p-4 rounded-lg text-lg transition-all duration-200 focus:outline-none focus:ring-2 flex items-center gap-2"
                    style={{
                        background: COLORS.bgWhite,
                        color: COLORS.textPrimary,
                        border: `2px solid ${COLORS.border}`,
                        boxShadow: COLORS.shadow
                    }}
                    onClick={onLogout}
                    title="Logout"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = COLORS.primary
                        e.currentTarget.style.boxShadow = COLORS.shadowMd
                        e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = COLORS.border
                        e.currentTarget.style.boxShadow = COLORS.shadow
                        e.currentTarget.style.transform = 'translateY(0)'
                    }}
                >
                    <LogOut className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}

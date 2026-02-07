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
        <div className="flex justify-between items-center mb-12">
            <div>
                <h1
                    className="text-4xl font-bold mb-2"
                    style={{ color: COLORS.textPrimary }}
                >
                    {user ? `Welcome back, ${user.name}` : 'Business Smart Suite'}
                </h1>
                <p
                    className="text-lg"
                    style={{ color: COLORS.textSecondary }}
                >
                    {user ? 'Here is an overview of your compliance status' : 'A clean, modern portal for managing your business'}
                </p>
            </div>
            <div className="flex items-center gap-4">
                <Link href="/analytics">
                    <button
                        className="font-semibold px-6 py-3 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{
                            background: COLORS.blue500,
                            color: COLORS.textWhite,
                            boxShadow: COLORS.shadow
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = COLORS.blue600
                            e.currentTarget.style.boxShadow = COLORS.shadowMd
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = COLORS.blue500
                            e.currentTarget.style.boxShadow = COLORS.shadow
                        }}
                    >
                        Analytics
                    </button>
                </Link>
                <button
                    className="font-semibold px-6 py-3 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 flex items-center gap-2"
                    style={{
                        background: COLORS.primary,
                        color: COLORS.textWhite,
                        boxShadow: COLORS.shadow
                    }}
                    onClick={onAddFolder}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = COLORS.primaryLight
                        e.currentTarget.style.boxShadow = COLORS.shadowMd
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = COLORS.primary
                        e.currentTarget.style.boxShadow = COLORS.shadow
                    }}
                >
                    <Plus className="w-4 h-4" />
                    Add Folder
                </button>
                <button
                    className="font-semibold p-3 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 flex items-center gap-2"
                    style={{
                        background: COLORS.bgWhite,
                        color: COLORS.textPrimary,
                        border: `1px solid ${COLORS.border}`
                    }}
                    onClick={onLogout}
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}

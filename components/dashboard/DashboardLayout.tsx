"use client"

import { ReactNode } from "react"
import { COLORS } from "@/constant/colors"

interface DashboardLayoutProps {
    children: ReactNode
    isCollapsed: boolean
}

export function DashboardLayout({ children, isCollapsed }: DashboardLayoutProps) {
    return (
        <main
            className="transition-all duration-300 min-h-screen"
            style={{
                marginLeft: '80px', // Always 80px since sidebar is always 80px when not hovered
                marginTop: '80px',
                background: COLORS.bgGrayLight,
                padding: '2rem'
            }}
        >
            {children}
        </main>
    )
}

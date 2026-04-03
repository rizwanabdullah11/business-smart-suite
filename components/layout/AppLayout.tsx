"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { COLORS } from "@/constant/colors"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { AppPurpleHeader } from "@/components/dashboard/AppPurpleHeader"
import { Footer } from "@/components/dashboard/Footer"

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { toast } = useToast()
    const { user, loading, isAuthenticated, logout: authLogout } = useAuth()

    useEffect(() => {
        if (!loading && !isAuthenticated && pathname !== '/login') {
            router.push('/login')
        }
    }, [loading, isAuthenticated, pathname, router])

    const handleLogout = async () => {
        await authLogout()
        toast({
            title: "Logged out",
            description: "See you next time!",
        })
        router.push('/login')
    }

    if (pathname === '/login') {
        return <>{children}</>
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#3b0764' }}>
                <Loader2 className="w-10 h-10 animate-spin text-purple-300" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    const isHome = pathname === '/dashboard'

    /** Match home page gradient so body white never shows through below the fixed header */
    const HOME_PAGE_BG =
        "linear-gradient(135deg,#3b0764 0%,#4c1d95 30%,#5b21b6 60%,#6d28d9 100%)"

    return (
        <div
            className="min-h-screen"
            style={{ background: isHome ? HOME_PAGE_BG : COLORS.bgGray }}
        >
            <AppPurpleHeader user={user} onLogout={handleLogout} />

            <main
                className={isHome ? 'pt-[84px] px-0 pb-0 bg-transparent' : 'pt-[84px] px-4 sm:px-8 pb-8'}
            >
                {children}
            </main>

            {!isHome ? <Footer /> : null}
        </div>
    )
}

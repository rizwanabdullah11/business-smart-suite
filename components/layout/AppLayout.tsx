"use client"

import { useEffect } from "react"
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

/**
 * Routes rendered without the authenticated app chrome.
 * Public marketing pages render their own header/footer via MarketingShell,
 * so AppLayout simply forwards children and skips the login redirect.
 */
const PUBLIC_ROUTES = new Set<string>([
    '/login',
    '/welcome',
    '/features',
    '/modules',
])

function isPublicPath(pathname: string | null): boolean {
    if (!pathname) return false
    if (PUBLIC_ROUTES.has(pathname)) return true
    // Allow nested public routes for future module pages.
    for (const base of PUBLIC_ROUTES) {
        if (base !== '/login' && pathname.startsWith(base + '/')) return true
    }
    return false
}

export function AppLayout({ children }: AppLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { toast } = useToast()
    const { user, loading, isAuthenticated, logout: authLogout } = useAuth()

    const publicPath = isPublicPath(pathname)

    useEffect(() => {
        if (!loading && !isAuthenticated && !publicPath) {
            router.push('/login')
        }
    }, [loading, isAuthenticated, publicPath, router])

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

    if (publicPath) {
        return <>{children}</>
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center" style={{ background: COLORS.brandShell }}>
                <Loader2 className="w-10 h-10 animate-spin text-purple-300" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    const isHome = pathname === '/dashboard'

    const HOME_PAGE_BG = COLORS.brandHeroGradient

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: isHome ? HOME_PAGE_BG : COLORS.bgGray }}
        >
            <AppPurpleHeader user={user} onLogout={handleLogout} />

            <main
                className={isHome ? 'pt-[68px] px-0 pb-0 bg-transparent' : 'pt-[68px] pb-8'}
            >
                {children}
            </main>

            {!isHome ? <Footer /> : null}
        </div>
    )
}

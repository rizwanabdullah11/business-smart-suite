"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { COLORS } from "@/constant/colors"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { TopNavbar } from "@/components/dashboard/TopNavbar"
import { Footer } from "@/components/dashboard/Footer"
import { CreateSectionDialog } from "@/components/dashboard/CreateSectionDialog"

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { toast } = useToast()
    const { user, loading, isAuthenticated, logout: authLogout } = useAuth()
    const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false)

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated && pathname !== '/login') {
            console.log("🔒 AppLayout: Not authenticated, redirecting to login...")
            router.push('/login')
        }
    }, [loading, isAuthenticated, pathname, router])

    const handleLogout = async () => {
        console.log("🚪 AppLayout: Logout clicked")
        await authLogout()
        toast({
            title: "Logged out",
            description: "See you next time!",
        })
    }

    const handleAddFolder = () => {
        setIsCreateSectionOpen(true)
    }

    // Login page — no layout at all
    if (pathname === '/login') {
        return <>{children}</>
    }

    // Module hub — no sidebar/header, but still needs auth gate
    if (pathname === '/dashboard') {
        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center" style={{ background: '#3b0764' }}>
                    <Loader2 className="w-10 h-10 animate-spin text-purple-300" />
                </div>
            )
        }
        if (!isAuthenticated) return null
        return <>{children}</>
    }

    // Show loading state for all other pages
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bgWhite }}>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin" style={{ color: COLORS.primary }} />
                    <p className="text-lg font-medium" style={{ color: COLORS.textSecondary }}>Loading...</p>
                </div>
            </div>
        )
    }

    // Don't render layout if not authenticated
    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
            {/* Top Navbar — no sidebar, full width */}
            <TopNavbar
                user={user}
                isCollapsed={true}
                onLogout={handleLogout}
                onAddFolder={handleAddFolder}
            />

            {/* Page Content */}
            <main className="pt-24 px-8 pb-8">
                {children}
            </main>

            {/* Footer */}
            <Footer />

            <CreateSectionDialog
                open={isCreateSectionOpen}
                onOpenChange={setIsCreateSectionOpen}
            />
        </div>
    )
}

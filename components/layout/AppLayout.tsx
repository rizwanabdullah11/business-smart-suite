"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { COLORS } from "@/constant/colors"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/dashboard/Sidebar"
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

    // Don't show layout on login page
    if (pathname === '/login') {
        return <>{children}</>
    }

    // Show loading state
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
            {/* Sidebar - Always expanded */}
            <Sidebar />

            {/* Main Content Area - Fixed margin for static sidebar */}
            <div
                className="ml-[280px]"
            >
                {/* Top Navbar */}
                <TopNavbar
                    user={user}
                    isCollapsed={false}
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
        </div>
    )
}

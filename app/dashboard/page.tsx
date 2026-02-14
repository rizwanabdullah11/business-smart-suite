"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { COLORS } from "@/constant/colors"
import { useToast } from "@/components/ui/use-toast"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { TopNavbar } from "@/components/dashboard/TopNavbar"
import { DashboardContent } from "@/components/dashboard/DashboardContent"
import { Footer } from "@/components/dashboard/Footer"
import { CreateSectionDialog } from "@/components/dashboard/CreateSectionDialog"

// API Config
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function DashboardPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
    const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token')

            if (!token) {
                router.push('/login')
                return
            }

            try {
                const response = await fetch(`${API_URL}/auth/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data')
                }

                const data = await response.json()
                setUser(data.user)

            } catch (error) {
                console.error('Auth error:', error)
                toast({
                    title: "Session Expired",
                    description: "Please log in again.",
                    variant: "destructive"
                })
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                router.push('/login')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [router, toast])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        document.cookie = 'token=; path=/; max-age=0' // Clear cookie
        router.push('/login')
        toast({
            title: "Logged out",
            description: "See you next time!",
        })
    }

    const handleAddFolder = () => {
        setIsCreateSectionOpen(true)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bgWhite }}>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin" style={{ color: COLORS.primary }} />
                    <p className="text-lg font-medium" style={{ color: COLORS.textSecondary }}>Loading Dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
            {/* Sidebar */}
            <Sidebar
                isExpanded={isSidebarExpanded}
                onHover={setIsSidebarExpanded}
            />

            {/* Main Content Area */}
            <div
                className="transition-all duration-300"
                style={{
                    marginLeft: isSidebarExpanded ? '280px' : '80px'
                }}
            >
                {/* Top Navbar */}
                <TopNavbar
                    user={user}
                    isCollapsed={!isSidebarExpanded}
                    onLogout={handleLogout}
                    onAddFolder={handleAddFolder}
                />

                {/* Page Content */}
                <main className="pt-24 px-8 pb-8">
                    <DashboardContent />
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

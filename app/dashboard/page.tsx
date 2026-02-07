"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    BarChart,
    TrendingUp,
    Shield,
    Settings,
    Plus,
    BookOpen,
    FileText,
    ClipboardList,
    FileInput,
    Award,
    Briefcase,
    Users,
    FileIcon as FileDescription,
    FileWarning,
    AlertOctagon,
    FileCode,
    AlertTriangle,
    Calendar,
    Target,
    PenTool,
    BarChart2,
    FileCheck,
    Scale,
    Truck,
    GraduationCap,
    Zap,
    Loader2
} from "lucide-react"
import { COLORS } from "@/constant/colors"
import { useToast } from "@/components/ui/use-toast"
import { BackgroundLayer } from "@/components/dashboard/BackgroundLayer"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { ExpandableNavigationCard } from "@/components/dashboard/ExpandableNavigationCard"
import { SystemStatus } from "@/components/dashboard/SystemStatus"

// API Config
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function DashboardPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [customSections, setCustomSections] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

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

    const navigationSections = [
        {
            title: "Core Management",
            description: "Essential business operations and compliance",
            icon: <Shield className="w-6 h-6" />,
            iconColor: COLORS.blue500,
            items: [
                { icon: <BookOpen className="w-5 h-5" />, label: "Manual", href: "/manual", description: "Company policies and procedures" },
                { icon: <FileText className="w-5 h-5" />, label: "Policies", href: "/policies", description: "Organizational policies" },
                { icon: <ClipboardList className="w-5 h-5" />, label: "Procedures", href: "/procedures", description: "Standard operating procedures" },
                { icon: <FileInput className="w-5 h-5" />, label: "Forms", href: "/forms", description: "Business forms and templates" },
                { icon: <Award className="w-5 h-5" />, label: "Certificates", href: "/certificate", description: "Certifications and licenses" },
            ]
        },
        {
            title: "Compliance & Risk",
            description: "Risk management and regulatory compliance",
            icon: <TrendingUp className="w-6 h-6" />,
            iconColor: COLORS.emerald500,
            items: [
                { icon: <Briefcase className="w-5 h-5" />, label: "Business Continuity", href: "/business-continuity", description: "Business continuity planning" },
                { icon: <Users className="w-5 h-5" />, label: "Management Reviews", href: "/management-reviews", description: "Management review processes" },
                { icon: <FileDescription className="w-5 h-5" />, label: "Job Descriptions", href: "/job-descriptions", description: "Role definitions and responsibilities" },
                { icon: <FileWarning className="w-5 h-5" />, label: "Work Instructions", href: "/work-instructions", description: "Detailed work procedures" },
                { icon: <AlertOctagon className="w-5 h-5" />, label: "Risk Assessments", href: "/risk-assessments", description: "Risk evaluation and mitigation" },
                { icon: <AlertOctagon className="w-5 h-5" />, label: "COSHH", href: "/coshh", description: "Control of substances hazardous to health" },
                { icon: <FileCode className="w-5 h-5" />, label: "Technical File", href: "/technical-file", description: "Technical documentation" },
                { icon: <AlertTriangle className="w-5 h-5" />, label: "IMS Aspects & Impacts", href: "/ims-aspects-impacts", description: "Environmental and H&S risk management" },
            ]
        },
        {
            title: "Registers & Records",
            description: "Documentation and record keeping",
            icon: <BarChart className="w-6 h-6" />,
            iconColor: COLORS.orange500,
            items: [
                { icon: <Calendar className="w-5 h-5" />, label: "Audit Schedule", href: "/audit-schedule", description: "Audit planning and scheduling" },
                { icon: <Users className="w-5 h-5" />, label: "Interested Parties", href: "/interested-parties", description: "Stakeholder management" },
                { icon: <FileText className="w-5 h-5" />, label: "Organisational Context", href: "/organisational-context", description: "Organizational structure" },
                { icon: <Target className="w-5 h-5" />, label: "Objectives", href: "/objectives", description: "Strategic objectives and goals" },
                { icon: <PenTool className="w-5 h-5" />, label: "Maintenance", href: "/maintenance", description: "Maintenance schedules and records" },
                { icon: <BarChart2 className="w-5 h-5" />, label: "Improvement Register", href: "/improvement-register", description: "Continuous improvement tracking" },
                { icon: <FileCheck className="w-5 h-5" />, label: "Statement of Applicability", href: "/statement-of-applicability", description: "ISO compliance statements" },
                { icon: <Scale className="w-5 h-5" />, label: "Legal Register", href: "/legal-register", description: "Legal requirements and compliance" },
                { icon: <Truck className="w-5 h-5" />, label: "Suppliers", href: "/suppliers", description: "Supplier management and evaluation" },
                { icon: <GraduationCap className="w-5 h-5" />, label: "Training", href: "/training", description: "Training records and development" },
                { icon: <Zap className="w-5 h-5" />, label: "Energy Consumption", href: "/energy-consumption", description: "Track and analyze energy usage and environmental impact" },
            ]
        },
        {
            title: "Administration",
            description: "System administration and settings",
            icon: <Settings className="w-6 h-6" />,
            iconColor: COLORS.neutral600,
            items: [
                { icon: <Users className="w-5 h-5" />, label: "Permissions", href: "/admin/permissions", description: "User access management" },
            ]
        }
    ]

    const handleAddFolder = () => {
        // TODO: Implement add folder functionality
        console.log("Add folder clicked")
    }

    const allSections = [
        ...navigationSections,
        ...customSections.map((section) => ({
            title: section.title,
            description: section.description || "Custom section",
            icon: <Shield className="w-6 h-6" />,
            iconColor: COLORS.neutral500,
            items: [
                {
                    icon: <Shield className="w-5 h-5" />,
                    label: section.title,
                    href: `/custom-sections/${section.id}`,
                    description: section.description || "Custom section"
                }
            ]
        }))
    ]

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
        <div className="min-h-screen relative">
            {/* Background */}
            <BackgroundLayer />

            {/* Content */}
            <div className="relative z-10">
                <div className="px-6 pt-12 pb-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <DashboardHeader
                            onAddFolder={handleAddFolder}
                            user={user}
                            onLogout={handleLogout}
                        />

                        {/* Expandable Navigation Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {allSections.map((section, index) => (
                                <ExpandableNavigationCard
                                    key={index}
                                    title={section.title}
                                    description={section.description}
                                    icon={section.icon}
                                    iconColor={section.iconColor}
                                    items={section.items}
                                />
                            ))}
                        </div>

                        {/* System Status */}
                        <SystemStatus />
                    </div>
                </div>
            </div>
        </div>
    )
}

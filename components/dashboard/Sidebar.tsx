"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    ChevronLeft,
    ChevronRight,
    Shield,
    TrendingUp,
    BarChart,
    Settings,
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
    Home,
    LayoutDashboard
} from "lucide-react"
import { COLORS } from "@/constant/colors"
import { usePermissions } from "@/hooks/use-permissions"
import { Permission } from "@/lib/types/permissions"

interface SidebarProps {
    // No props needed - sidebar is always expanded
}

export function Sidebar({}: SidebarProps = {}) {
    const pathname = usePathname()
    const [expandedSection, setExpandedSection] = useState<string | null>("Core Management")
    const isExpanded = true // Always expanded
    const { can, isAdmin, loading } = usePermissions()

    interface NavItem {
        icon: any
        label: string
        href: string
        badge?: string
        permission?: Permission // Add permission requirement
    }

    interface NavSection {
        title: string
        icon: any
        items: NavItem[]
        permission?: Permission // Section-level permission
    }

    const navigationSections: NavSection[] = [
        {
            title: "Core Management",
            icon: Shield,
            items: [
                { icon: BookOpen, label: "Manual", href: "/manual", permission: Permission.VIEW_MANUALS },
                { icon: FileText, label: "Policies", href: "/policies", permission: Permission.VIEW_POLICIES },
                { icon: ClipboardList, label: "Procedures", href: "/procedures", permission: Permission.VIEW_PROCEDURES },
                { icon: FileInput, label: "Forms", href: "/forms", permission: Permission.VIEW_FORMS },
                { icon: Award, label: "Certificates", href: "/certificate", permission: Permission.VIEW_CERTIFICATES },
            ]
        },
        {
            title: "Compliance & Risk",
            icon: TrendingUp,
            items: [
                { icon: Briefcase, label: "Business Continuity", href: "/business-continuity" },
                { icon: Users, label: "Management Reviews", href: "/management-reviews" },
                { icon: FileDescription, label: "Job Descriptions", href: "/job-descriptions" },
                { icon: FileWarning, label: "Work Instructions", href: "/work-instructions" },
                { icon: AlertOctagon, label: "Risk Assessments", href: "/risk-assessments", permission: Permission.VIEW_RISK_ASSESSMENTS },
                { icon: AlertOctagon, label: "COSHH", href: "/coshh", permission: Permission.VIEW_COSHH },
                { icon: FileCode, label: "Technical File", href: "/technical-file" },
                { icon: AlertTriangle, label: "IMS Aspects & Impacts", href: "/ims-aspects-impacts" },
            ]
        },
        {
            title: "Registers & Records",
            icon: BarChart,
            items: [
                { icon: Calendar, label: "Audit Schedule", href: "/audit-schedule", permission: Permission.VIEW_AUDIT_SCHEDULE },
                { icon: Users, label: "Interested Parties", href: "/interested-parties" },
                { icon: FileText, label: "Organisational Context", href: "/organisational-context" },
                { icon: Target, label: "Objectives", href: "/objectives" },
                { icon: PenTool, label: "Maintenance", href: "/maintenance" },
                { icon: BarChart2, label: "Improvement Register", href: "/improvement-register", permission: Permission.VIEW_IMPROVEMENTS },
                { icon: FileCheck, label: "Statement of Applicability", href: "/statement-of-applicability" },
                { icon: Scale, label: "Legal Register", href: "/legal-register" },
                { icon: Truck, label: "Suppliers", href: "/suppliers" },
                { icon: GraduationCap, label: "Training", href: "/training" },
                { icon: Zap, label: "Energy Consumption", href: "/energy-consumption" },
            ]
        },
        {
            title: "Administration",
            icon: Settings,
            permission: Permission.VIEW_USERS, // Changed from MANAGE_ROLES to VIEW_USERS
            items: [
                { icon: Users, label: "Users", href: "/admin/users", permission: Permission.VIEW_USERS },
                { icon: Users, label: "Permissions", href: "/admin/permissions", permission: Permission.MANAGE_ROLES },
                { icon: BarChart2, label: "Diagnostics", href: "/admin/diagnostics", permission: Permission.MANAGE_ROLES },
            ]
        }
    ]

    // Filter sections and items based on permissions
    const visibleSections = navigationSections.filter(section => {
        // If section has permission requirement, check it
        if (section.permission && !can(section.permission)) {
            return false
        }
        // Filter items within the section
        const visibleItems = section.items.filter(item => {
            // If item has permission requirement, check it
            if (item.permission) {
                return can(item.permission)
            }
            return true
        })
        // Only show section if it has visible items
        return visibleItems.length > 0
    })

    const toggleSection = (title: string) => {
        setExpandedSection(expandedSection === title ? null : title)
    }

    const isActive = (href: string) => pathname === href

    return (
        <aside
            className="fixed left-0 top-0 h-screen border-r flex flex-col"
            style={{
                width: '280px',
                background: COLORS.bgWhite,
                borderColor: COLORS.border,
                zIndex: 50
            }}
        >
            {/* Sidebar Header */}
            <div
                className="flex items-center justify-between p-6 border-b"
                style={{ borderColor: COLORS.border }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center"
                        style={{ background: COLORS.gradientIndigo }}
                    >
                        <span className="font-bold text-2xl text-white">B</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl" style={{ color: COLORS.textPrimary }}>
                            Business
                        </h2>
                        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                            Smart Suite
                        </p>
                    </div>
                </div>
            </div>
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3">
                {loading ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
                        Loading permissions...
                    </div>
                ) : (
                    <>
                        {/* Dashboard Link */}
                        <Link href="/dashboard">
                    <div
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-lg mb-3 cursor-pointer transition-all duration-200 ${isActive('/dashboard') ? 'font-bold' : 'font-medium'
                            }`}
                        style={{
                            background: isActive('/dashboard') ? `${COLORS.primary}15` : 'transparent',
                            color: isActive('/dashboard') ? COLORS.primary : COLORS.textSecondary
                        }}
                    >
                        <LayoutDashboard className="w-6 h-6 flex-shrink-0" />
                        <span className="text-base">Dashboard</span>
                    </div>
                </Link>

                {/* Navigation Sections */}
                {visibleSections.map((section) => {
                    const SectionIcon = section.icon
                    const isSectionExpanded = expandedSection === section.title
                    
                    // Filter visible items for this section
                    const visibleItems = section.items.filter(item => {
                        if (item.permission) {
                            return can(item.permission)
                        }
                        return true
                    })

                    return (
                        <div key={section.title} className="mb-2">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.title)}
                                className="w-full flex items-center justify-between px-4 py-3.5 rounded-lg transition-all duration-200 hover:bg-opacity-50"
                                style={{
                                    background: isSectionExpanded ? `${COLORS.neutral100}` : 'transparent',
                                    color: COLORS.textPrimary
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <SectionIcon className="w-6 h-6 flex-shrink-0" />
                                    <span className="text-base font-bold">{section.title}</span>
                                </div>
                                <ChevronRight
                                    className={`w-4 h-4 transition-transform duration-200 ${isSectionExpanded ? 'rotate-90' : ''
                                        }`}
                                    style={{ color: COLORS.textSecondary }}
                                />
                            </button>

                            {/* Section Items */}
                            {isSectionExpanded && (
                                <div className="mt-2 ml-4 space-y-1">
                                    {visibleItems.map((item) => {
                                        const ItemIcon = item.icon
                                        return (
                                            <Link key={item.href} href={item.href}>
                                                <div
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${isActive(item.href) ? 'font-bold' : 'font-medium'
                                                        }`}
                                                    style={{
                                                        background: isActive(item.href)
                                                            ? `${COLORS.primary}15`
                                                            : 'transparent',
                                                        color: isActive(item.href)
                                                            ? COLORS.primary
                                                            : COLORS.textSecondary
                                                    }}
                                                >
                                                    <ItemIcon className="w-5 h-5 flex-shrink-0" />
                                                    <span className="text-base">{item.label}</span>
                                                    {item.badge && (
                                                        <span
                                                            className="ml-auto text-xs px-2 py-0.5 rounded-full"
                                                            style={{
                                                                background: COLORS.primary,
                                                                color: COLORS.textWhite
                                                            }}
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
                    </>
                )}
            </nav>

            {/* Footer - System Status */}
            <div
                className="p-4 border-t"
                style={{ borderColor: COLORS.border }}
            >
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: COLORS.green500 }}
                    />
                    <span className="text-xs font-medium" style={{ color: COLORS.textSecondary }}>
                        System Optimal
                    </span>
                </div>
            </div>
        </aside>
    )
}

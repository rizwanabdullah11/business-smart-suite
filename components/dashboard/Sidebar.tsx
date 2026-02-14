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

interface SidebarProps {
    isCollapsed: boolean
    onToggle: () => void
}

interface NavItem {
    icon: any
    label: string
    href: string
    badge?: string
}

interface NavSection {
    title: string
    icon: any
    items: NavItem[]
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const [expandedSection, setExpandedSection] = useState<string | null>("Core Management")

    const navigationSections: NavSection[] = [
        {
            title: "Core Management",
            icon: Shield,
            items: [
                { icon: BookOpen, label: "Manual", href: "/manual" },
                { icon: FileText, label: "Policies", href: "/policies" },
                { icon: ClipboardList, label: "Procedures", href: "/procedures" },
                { icon: FileInput, label: "Forms", href: "/forms" },
                { icon: Award, label: "Certificates", href: "/certificate" },
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
                { icon: AlertOctagon, label: "Risk Assessments", href: "/risk-assessments" },
                { icon: AlertOctagon, label: "COSHH", href: "/coshh" },
                { icon: FileCode, label: "Technical File", href: "/technical-file" },
                { icon: AlertTriangle, label: "IMS Aspects & Impacts", href: "/ims-aspects-impacts" },
            ]
        },
        {
            title: "Registers & Records",
            icon: BarChart,
            items: [
                { icon: Calendar, label: "Audit Schedule", href: "/audit-schedule" },
                { icon: Users, label: "Interested Parties", href: "/interested-parties" },
                { icon: FileText, label: "Organisational Context", href: "/organisational-context" },
                { icon: Target, label: "Objectives", href: "/objectives" },
                { icon: PenTool, label: "Maintenance", href: "/maintenance" },
                { icon: BarChart2, label: "Improvement Register", href: "/improvement-register" },
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
            items: [
                { icon: Users, label: "Permissions", href: "/admin/permissions" },
            ]
        }
    ]

    const toggleSection = (title: string) => {
        if (isCollapsed) return
        setExpandedSection(expandedSection === title ? null : title)
    }

    const isActive = (href: string) => pathname === href

    return (
        <aside
            className="fixed left-0 top-0 h-screen border-r transition-all duration-300 flex flex-col"
            style={{
                width: isCollapsed ? '80px' : '280px',
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
                {!isCollapsed && (
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
                )}
                {isCollapsed && (
                    <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center mx-auto cursor-pointer"
                        style={{ background: COLORS.gradientIndigo }}
                        onClick={onToggle}
                        title="Expand sidebar"
                    >
                        <span className="font-bold text-xl text-white">B</span>
                    </div>
                )}

                {/* Toggle Button */}
                {!isCollapsed && (
                    <button
                        onClick={onToggle}
                        className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                        style={{ color: COLORS.textSecondary }}
                        title="Collapse sidebar"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3">
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
                        {!isCollapsed && <span className="text-base">Dashboard</span>}
                    </div>
                </Link>

                {/* Navigation Sections */}
                {navigationSections.map((section) => {
                    const SectionIcon = section.icon
                    const isExpanded = expandedSection === section.title

                    return (
                        <div key={section.title} className="mb-2">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.title)}
                                className="w-full flex items-center justify-between px-4 py-3.5 rounded-lg transition-all duration-200 hover:bg-opacity-50"
                                style={{
                                    background: isExpanded && !isCollapsed ? `${COLORS.neutral100}` : 'transparent',
                                    color: COLORS.textPrimary
                                }}
                                title={isCollapsed ? section.title : ''}
                            >
                                <div className="flex items-center gap-3">
                                    <SectionIcon className="w-6 h-6 flex-shrink-0" />
                                    {!isCollapsed && (
                                        <span className="text-base font-bold">{section.title}</span>
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <ChevronRight
                                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''
                                            }`}
                                        style={{ color: COLORS.textSecondary }}
                                    />
                                )}
                            </button>

                            {/* Section Items */}
                            {isExpanded && !isCollapsed && (
                                <div className="mt-2 ml-4 space-y-1">
                                    {section.items.map((item) => {
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

                            {/* Collapsed Mode - Show items on hover */}
                            {isCollapsed && (
                                <div className="hidden group-hover:block absolute left-full top-0 ml-2 w-64 bg-white rounded-lg shadow-lg border p-2">
                                    <div className="font-semibold text-sm mb-2 px-2" style={{ color: COLORS.textPrimary }}>
                                        {section.title}
                                    </div>
                                    {section.items.map((item) => {
                                        const ItemIcon = item.icon
                                        return (
                                            <Link key={item.href} href={item.href}>
                                                <div
                                                    className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200"
                                                    style={{
                                                        background: isActive(item.href)
                                                            ? `${COLORS.primary}15`
                                                            : 'transparent',
                                                        color: isActive(item.href)
                                                            ? COLORS.primary
                                                            : COLORS.textSecondary
                                                    }}
                                                >
                                                    <ItemIcon className="w-4 h-4" />
                                                    <span className="text-sm">{item.label}</span>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>

            {/* Footer - System Status */}
            <div
                className="p-4 border-t"
                style={{ borderColor: COLORS.border }}
            >
                {!isCollapsed ? (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: COLORS.green500 }}
                        />
                        <span className="text-xs font-medium" style={{ color: COLORS.textSecondary }}>
                            System Optimal
                        </span>
                    </div>
                ) : (
                    <div
                        className="w-2 h-2 rounded-full mx-auto"
                        style={{ backgroundColor: COLORS.green500 }}
                    />
                )}
            </div>
        </aside>
    )
}

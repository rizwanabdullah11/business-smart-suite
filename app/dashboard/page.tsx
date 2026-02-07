"use client"

import { useState, useEffect, ReactNode } from "react"
import Link from "next/link"
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
    ChevronLeft,
} from "lucide-react"
import { COLORS } from "@/constant/colors"

// ==================== REUSABLE COMPONENTS ====================

// Background Layer Component
function BackgroundLayer() {
    return (
        <div 
            className="absolute inset-0"
            style={{
                background: COLORS.bgWhite
            }}
        />
    )
}

// Dashboard Header Component
interface DashboardHeaderProps {
    onAddFolder: () => void
}

function DashboardHeader({ onAddFolder }: DashboardHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-12">
            <div>
                <h1 
                    className="text-4xl font-bold mb-2"
                    style={{ color: COLORS.textPrimary }}
                >
                    Business Smart Suite
                </h1>
                <p 
                    className="text-lg"
                    style={{ color: COLORS.textSecondary }}
                >
                    A clean, modern portal for managing your business
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
            </div>
        </div>
    )
}

// Expandable Navigation Card Component (Reusable)
interface ExpandableNavigationCardProps {
    title: string
    description: string
    icon: ReactNode
    iconColor: string
    items: Array<{
        icon: ReactNode
        label: string
        href: string
        description: string
    }>
}

function ExpandableNavigationCard({ 
    title, 
    description, 
    icon, 
    iconColor, 
    items
}: ExpandableNavigationCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div
            className="group relative rounded-xl border transition-all duration-300"
            style={{
                background: COLORS.bgWhite,
                borderColor: isExpanded ? iconColor : COLORS.border,
                boxShadow: isExpanded ? COLORS.shadowLg : COLORS.shadow
            }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Section Header */}
            <div className="p-6 border-b" style={{ borderColor: COLORS.border }}>
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        <div 
                            className="flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0"
                            style={{
                                backgroundColor: `${iconColor}15`,
                                color: iconColor
                            }}
                        >
                            {icon}
                        </div>
                        <div className="flex-1">
                            <h3 
                                className="text-xl font-bold mb-2"
                                style={{ color: COLORS.textPrimary }}
                            >
                                {title}
                            </h3>
                            <p 
                                className="text-sm"
                                style={{ color: COLORS.textSecondary }}
                            >
                                {description}
                            </p>
                        </div>
                    </div>
                    <ChevronLeft 
                        className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-90' : '-rotate-90'}`}
                        style={{ color: COLORS.neutral400 }}
                    />
                </div>
            </div>

            {/* Expanded Items Grid */}
            {isExpanded && (
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {items.map((item, index) => (
                            <ItemCard
                                key={index}
                                icon={item.icon}
                                label={item.label}
                                description={item.description}
                                href={item.href}
                                iconColor={iconColor}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// Item Card Component (Reusable)
interface ItemCardProps {
    icon: ReactNode
    label: string
    description: string
    href: string
    iconColor: string
}

function ItemCard({ icon, label, description, href, iconColor }: ItemCardProps) {
    return (
        <Link href={href}>
            <div
                className="group/item relative p-4 rounded-xl border transition-all duration-300 cursor-pointer"
                style={{
                    background: COLORS.bgWhite,
                    borderColor: COLORS.border,
                    boxShadow: COLORS.shadow
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = COLORS.shadowMd
                    e.currentTarget.style.borderColor = iconColor
                    e.currentTarget.style.background = `${iconColor}10`
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = COLORS.shadow
                    e.currentTarget.style.borderColor = COLORS.border
                    e.currentTarget.style.background = COLORS.bgWhite
                }}
            >
                <div className="flex flex-col items-center text-center">
                    <div 
                        className="flex items-center justify-center w-12 h-12 rounded-lg mb-3"
                        style={{
                            backgroundColor: `${iconColor}15`,
                            color: iconColor
                        }}
                    >
                        {icon}
                    </div>
                    <h4 
                        className="font-semibold mb-1 text-sm"
                        style={{ color: COLORS.textPrimary }}
                    >
                        {label}
                    </h4>
                    <p 
                        className="text-xs leading-tight"
                        style={{ color: COLORS.textSecondary }}
                    >
                        {description}
                    </p>
                </div>
            </div>
        </Link>
    )
}

// System Status Component
function SystemStatus() {
    return (
        <div className="mt-8">
            <div className="flex items-center gap-2">
                <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS.green500 }}
                ></div>
                <span 
                    className="text-sm font-medium"
                    style={{ color: COLORS.textPrimary }}
                >
                    System status: Optimal
                </span>
            </div>
        </div>
    )
}

// ==================== MAIN DASHBOARD PAGE ====================

export default function DashboardPage() {
    const [customSections, setCustomSections] = useState<any[]>([])
    
    useEffect(() => {
        fetch("/api/custom-sections")
            .then(res => res.json())
            .then(data => setCustomSections(data))
            .catch(() => setCustomSections([]))
    }, [])

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

    return (
        <div className="min-h-screen relative">
            {/* Background */}
            <BackgroundLayer />

            {/* Content */}
            <div className="relative z-10">
                <div className="px-6 pt-12 pb-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <DashboardHeader onAddFolder={handleAddFolder} />

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

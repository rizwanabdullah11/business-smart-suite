"use client"

import { useState, useEffect, ReactNode } from "react"
import Link from "next/link"
import {
    BarChart,
    TrendingUp,
    Shield,
    Settings,
    ArrowRight,
    Plus,
    ArrowLeft,
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
    X,
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
    onItemClick: (itemIndex: number) => void
    selectedItemIndex: number | null
}

function ExpandableNavigationCard({ 
    title, 
    description, 
    icon, 
    iconColor, 
    items,
    onItemClick,
    selectedItemIndex
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
                                onClick={() => onItemClick(index)}
                                iconColor={iconColor}
                                isSelected={selectedItemIndex === index}
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
    onClick: () => void
    iconColor: string
    isSelected?: boolean
}

function ItemCard({ icon, label, description, onClick, iconColor, isSelected }: ItemCardProps) {
    return (
        <div
            onClick={onClick}
            className="group/item relative p-4 rounded-xl border transition-all duration-300 cursor-pointer"
            style={{
                background: isSelected ? `${iconColor}20` : COLORS.bgWhite,
                borderColor: isSelected ? iconColor : COLORS.border,
                boxShadow: COLORS.shadow
            }}
            onMouseEnter={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.boxShadow = COLORS.shadowMd
                    e.currentTarget.style.borderColor = iconColor
                    e.currentTarget.style.background = `${iconColor}10`
                }
            }}
            onMouseLeave={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.boxShadow = COLORS.shadow
                    e.currentTarget.style.borderColor = COLORS.border
                    e.currentTarget.style.background = COLORS.bgWhite
                }
            }}
        >
            <div className="flex flex-col items-center text-center">
                <div 
                    className="flex items-center justify-center w-12 h-12 rounded-lg mb-3"
                    style={{
                        backgroundColor: isSelected ? iconColor : `${iconColor}15`,
                        color: isSelected ? COLORS.textWhite : iconColor
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
    )
}

// Product Modal Component
interface ProductModalProps {
    item: {
        icon: ReactNode
        label: string
        description: string
        iconColor: string
    }
    products: Array<{
        id: string
        name: string
        description: string
        status?: string
    }>
    onClose: () => void
}

function ProductModal({ item, products, onClose }: ProductModalProps) {
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            style={{
                backgroundColor: COLORS.modalOverlay
            }}
        >
            <div 
                className="relative rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: COLORS.bgWhite,
                    boxShadow: COLORS.shadowXl
                }}
            >
                {/* Modal Header */}
                <div 
                    className="p-6 border-b flex items-center justify-between"
                    style={{
                        borderColor: COLORS.border,
                        backgroundColor: COLORS.bgGray
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div 
                            className="flex items-center justify-center w-12 h-12 rounded-xl"
                            style={{
                                backgroundColor: `${item.iconColor}15`,
                                color: item.iconColor
                            }}
                        >
                            {item.icon}
                        </div>
                        <div>
                            <h2 
                                className="text-2xl font-bold"
                                style={{ color: COLORS.textPrimary }}
                            >
                                {item.label}
                            </h2>
                            <p 
                                className="text-sm mt-1"
                                style={{ color: COLORS.textSecondary }}
                            >
                                {item.description}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg transition-all duration-200"
                        style={{
                            color: COLORS.textSecondary,
                            backgroundColor: COLORS.bgGray
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.neutral200
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.bgGray
                        }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="mb-4">
                        <h3 
                            className="text-lg font-semibold mb-2"
                            style={{ color: COLORS.textPrimary }}
                        >
                            All Products ({products.length})
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="p-4 rounded-xl border transition-all duration-200 cursor-pointer"
                                style={{
                                    background: COLORS.bgWhite,
                                    borderColor: COLORS.border,
                                    boxShadow: COLORS.shadow
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = COLORS.shadowMd
                                    e.currentTarget.style.borderColor = item.iconColor
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = COLORS.shadow
                                    e.currentTarget.style.borderColor = COLORS.border
                                }}
                            >
                                <h4 
                                    className="font-semibold mb-1"
                                    style={{ color: COLORS.textPrimary }}
                                >
                                    {product.name}
                                </h4>
                                <p 
                                    className="text-sm mb-2"
                                    style={{ color: COLORS.textSecondary }}
                                >
                                    {product.description}
                                </p>
                                {product.status && (
                                    <span 
                                        className="text-xs px-2 py-1 rounded"
                                        style={{
                                            backgroundColor: `${COLORS.green500}15`,
                                            color: COLORS.green600
                                        }}
                                    >
                                        {product.status}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
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
    const [selectedItemIndex, setSelectedItemIndex] = useState<{sectionIndex: number, itemIndex: number} | null>(null)
    const [selectedItem, setSelectedItem] = useState<{
        icon: ReactNode
        label: string
        description: string
        iconColor: string
    } | null>(null)
    
    useEffect(() => {
        fetch("/api/custom-sections")
            .then(res => res.json())
            .then(data => setCustomSections(data))
            .catch(() => setCustomSections([]))
    }, [])

    // Sample products data for each item
    const getProductsForItem = (sectionTitle: string, itemLabel: string) => {
        // Sample products - in real app, this would come from API
        const sampleProducts: Record<string, Record<string, Array<{id: string, name: string, description: string, status?: string}>>> = {
            "Core Management": {
                "Manual": [
                    { id: "1", name: "Employee Handbook", description: "Complete guide for all employees", status: "Active" },
                    { id: "2", name: "Safety Manual", description: "Workplace safety guidelines", status: "Active" },
                    { id: "3", name: "Quality Manual", description: "Quality management procedures", status: "Active" },
                    { id: "4", name: "Operations Manual", description: "Daily operations guide", status: "Draft" },
                ],
                "Policies": [
                    { id: "1", name: "HR Policy", description: "Human resources policies", status: "Active" },
                    { id: "2", name: "IT Policy", description: "Information technology policies", status: "Active" },
                    { id: "3", name: "Security Policy", description: "Security and access policies", status: "Active" },
                    { id: "4", name: "Privacy Policy", description: "Data privacy and protection", status: "Active" },
                    { id: "5", name: "Code of Conduct", description: "Employee code of conduct", status: "Active" },
                ],
                "Procedures": [
                    { id: "1", name: "Onboarding Procedure", description: "New employee onboarding", status: "Active" },
                    { id: "2", name: "Incident Reporting", description: "How to report incidents", status: "Active" },
                    { id: "3", name: "Document Control", description: "Document management process", status: "Active" },
                ],
                "Forms": [
                    { id: "1", name: "Leave Request Form", description: "Request time off", status: "Active" },
                    { id: "2", name: "Expense Report", description: "Submit expenses", status: "Active" },
                    { id: "3", name: "Purchase Order", description: "Request purchases", status: "Active" },
                ],
                "Certificates": [
                    { id: "1", name: "ISO 9001 Certificate", description: "Quality management certification", status: "Valid" },
                    { id: "2", name: "ISO 14001 Certificate", description: "Environmental management", status: "Valid" },
                ]
            },
            "Compliance & Risk": {
                "Business Continuity": [
                    { id: "1", name: "BCP Plan 2024", description: "Business continuity plan", status: "Active" },
                    { id: "2", name: "Disaster Recovery", description: "IT disaster recovery plan", status: "Active" },
                ],
                "Risk Assessments": [
                    { id: "1", name: "Workplace Risk Assessment", description: "Office safety assessment", status: "Active" },
                    { id: "2", name: "IT Security Assessment", description: "Cybersecurity evaluation", status: "Active" },
                ],
                "Management Reviews": [
                    { id: "1", name: "Q1 2024 Review", description: "First quarter management review", status: "Completed" },
                    { id: "2", name: "Q2 2024 Review", description: "Second quarter management review", status: "Scheduled" },
                ],
                "Job Descriptions": [
                    { id: "1", name: "Software Engineer", description: "Development team role", status: "Active" },
                    { id: "2", name: "Project Manager", description: "Project management role", status: "Active" },
                ],
                "Work Instructions": [
                    { id: "1", name: "Assembly Procedure", description: "Product assembly steps", status: "Active" },
                    { id: "2", name: "Quality Check Process", description: "Quality inspection steps", status: "Active" },
                ],
                "COSHH": [
                    { id: "1", name: "Chemical Safety Assessment", description: "Hazardous substances evaluation", status: "Active" },
                ],
                "Technical File": [
                    { id: "1", name: "Product Specifications", description: "Technical documentation", status: "Active" },
                ],
                "IMS Aspects & Impacts": [
                    { id: "1", name: "Environmental Impact Assessment", description: "Environmental aspects evaluation", status: "Active" },
                ]
            },
            "Registers & Records": {
                "Audit Schedule": [
                    { id: "1", name: "Internal Audit Q1", description: "First quarter internal audit", status: "Scheduled" },
                    { id: "2", name: "External Audit 2024", description: "Annual external audit", status: "Planned" },
                ],
                "Interested Parties": [
                    { id: "1", name: "Stakeholder Register", description: "List of all stakeholders", status: "Active" },
                ],
                "Objectives": [
                    { id: "1", name: "Quality Improvement Goal", description: "Reduce defects by 20%", status: "In Progress" },
                    { id: "2", name: "Customer Satisfaction Target", description: "Achieve 95% satisfaction", status: "Active" },
                ],
                "Suppliers": [
                    { id: "1", name: "Supplier A", description: "Raw materials supplier", status: "Approved" },
                    { id: "2", name: "Supplier B", description: "Equipment supplier", status: "Approved" },
                ],
                "Training": [
                    { id: "1", name: "Safety Training Program", description: "Workplace safety training", status: "Active" },
                    { id: "2", name: "Quality Training", description: "Quality management training", status: "Active" },
                ]
            },
            "Administration": {
                "Permissions": [
                    { id: "1", name: "Admin Users", description: "Administrator access", status: "Active" },
                    { id: "2", name: "Manager Role", description: "Manager permissions", status: "Active" },
                ]
            }
        }

        return sampleProducts[sectionTitle]?.[itemLabel] || [
            { id: "1", name: "Sample Product 1", description: "Product description", status: "Active" },
            { id: "2", name: "Sample Product 2", description: "Product description", status: "Active" },
            { id: "3", name: "Sample Product 3", description: "Product description", status: "Draft" },
        ]
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

    const handleItemClick = (sectionIndex: number, itemIndex: number) => {
        const section = allSections[sectionIndex]
        const item = section.items[itemIndex]
        setSelectedItemIndex({ sectionIndex, itemIndex })
        setSelectedItem({
            icon: item.icon,
            label: item.label,
            description: item.description,
            iconColor: section.iconColor
        })
    }

    const handleCloseModal = () => {
        setSelectedItem(null)
        setSelectedItemIndex(null)
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

    const products = selectedItem && selectedItemIndex
        ? getProductsForItem(allSections[selectedItemIndex.sectionIndex].title, selectedItem.label)
        : []

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
                                    onItemClick={(itemIndex) => handleItemClick(index, itemIndex)}
                                    selectedItemIndex={
                                        selectedItemIndex?.sectionIndex === index 
                                            ? selectedItemIndex.itemIndex 
                                            : null
                                    }
                                />
                            ))}
                        </div>

                        {/* System Status */}
                        <SystemStatus />
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            {selectedItem && (
                <ProductModal
                    item={selectedItem}
                    products={products}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    )
}

"use client"

import { useState, ReactNode } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"

// Item Card Component (Internal Use)
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
                        className="flex items-center justify-center w-14 h-14 rounded-lg mb-3"
                        style={{
                            backgroundColor: `${iconColor}15`,
                            color: iconColor
                        }}
                    >
                        {icon}
                    </div>
                    <h4
                        className="font-bold mb-2 text-base"
                        style={{ color: COLORS.textPrimary }}
                    >
                        {label}
                    </h4>
                    <p
                        className="text-sm leading-snug"
                        style={{ color: COLORS.textSecondary }}
                    >
                        {description}
                    </p>
                </div>
            </div>
        </Link>
    )
}

// Expandable Navigation Card Component
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

export function ExpandableNavigationCard({
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
            <div className="p-8 border-b" style={{ borderColor: COLORS.border }}>
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-5 flex-1">
                        <div
                            className="flex items-center justify-center w-16 h-16 rounded-lg flex-shrink-0"
                            style={{
                                backgroundColor: `${iconColor}15`,
                                color: iconColor
                            }}
                        >
                            {icon}
                        </div>
                        <div className="flex-1">
                            <h3
                                className="text-2xl font-bold mb-3"
                                style={{ color: COLORS.textPrimary }}
                            >
                                {title}
                            </h3>
                            <p
                                className="text-base leading-relaxed"
                                style={{ color: COLORS.textSecondary }}
                            >
                                {description}
                            </p>
                        </div>
                    </div>
                    <ChevronLeft
                        className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-90' : '-rotate-90'}`}
                        style={{ color: COLORS.neutral400 }}
                    />
                </div>
            </div>

            {/* Expanded Items Grid */}
            {isExpanded && (
                <div className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
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

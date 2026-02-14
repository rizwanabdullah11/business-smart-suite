"use client"

import { TrendingUp, TrendingDown, FileText, Users, AlertCircle, CheckCircle } from "lucide-react"
import { COLORS } from "@/constant/colors"

export function DashboardContent() {
    const stats = [
        {
            title: "Total Documents",
            value: "1,234",
            change: "+12.5%",
            trend: "up",
            icon: FileText,
            color: COLORS.blue500,
            subtitle: "from previous period"
        },
        {
            title: "Active Users",
            value: "89",
            change: "+5.2%",
            trend: "up",
            icon: Users,
            color: COLORS.emerald500,
            subtitle: "from previous period"
        },
        {
            title: "Pending Reviews",
            value: "23",
            change: "-8.1%",
            trend: "down",
            icon: AlertCircle,
            color: COLORS.orange500,
            subtitle: "from previous period"
        },
        {
            title: "Completed Tasks",
            value: "456",
            change: "+15.3%",
            trend: "up",
            icon: CheckCircle,
            color: COLORS.green500,
            subtitle: "from previous period"
        }
    ]

    const recentActivities = [
        { action: "Policy Updated", item: "Data Protection Policy", time: "2 hours ago", user: "John Doe" },
        { action: "Document Approved", item: "Risk Assessment Report", time: "4 hours ago", user: "Jane Smith" },
        { action: "New Certificate", item: "ISO 9001:2015", time: "1 day ago", user: "Admin" },
        { action: "Training Completed", item: "Compliance Training", time: "2 days ago", user: "Mike Johnson" },
    ]

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown

                    // Define gradient backgrounds for each card
                    const gradients = [
                        COLORS.gradientBlue,
                        COLORS.gradientGreen,
                        COLORS.gradientSunset,
                        COLORS.gradientIndigo
                    ]

                    const shadows = [
                        COLORS.shadowBlue,
                        COLORS.shadowGreen,
                        COLORS.shadowOrange,
                        COLORS.shadowPurple
                    ]

                    return (
                        <div
                            key={index}
                            className="p-7 rounded-xl border-0 transition-all duration-300 hover:scale-105 cursor-pointer"
                            style={{
                                background: gradients[index],
                                boxShadow: shadows[index]
                            }}
                        >
                            <div className="flex items-start justify-between mb-5">
                                <div
                                    className="p-4 rounded-lg backdrop-blur-sm"
                                    style={{ background: 'rgba(255, 255, 255, 0.25)' }}
                                >
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <div
                                    className="flex items-center gap-1 text-base font-bold text-white"
                                >
                                    <TrendIcon className="w-5 h-5" />
                                    {stat.change}
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2 text-white">
                                {stat.value}
                            </h3>
                            <p className="text-base font-bold mb-2 text-white opacity-90">
                                {stat.title}
                            </p>
                            <p className="text-sm text-white opacity-75">
                                {stat.subtitle}
                            </p>
                        </div>
                    )
                })}
            </div>

            {/* Recent Activity */}
            <div
                className="p-7 rounded-xl border"
                style={{
                    background: COLORS.bgWhite,
                    borderColor: COLORS.border
                }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
                        Recent Activity
                    </h2>
                    <button
                        className="text-base font-bold"
                        style={{ color: COLORS.primary }}
                    >
                        View All
                    </button>
                </div>
                <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-5 rounded-lg transition-all duration-200 hover:bg-opacity-50"
                            style={{ background: COLORS.bgGray }}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-bold text-base" style={{ color: COLORS.textPrimary }}>
                                        {activity.action}
                                    </span>
                                    <span
                                        className="px-3 py-1 rounded text-sm font-semibold"
                                        style={{
                                            background: `${COLORS.primary}15`,
                                            color: COLORS.primary
                                        }}
                                    >
                                        {activity.item}
                                    </span>
                                </div>
                                <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                                    by {activity.user} • {activity.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    className="p-7 rounded-xl border-0 cursor-pointer transition-all duration-300 hover:scale-105"
                    style={{
                        background: COLORS.gradientCyan,
                        boxShadow: COLORS.shadowBlue
                    }}
                >
                    <div className="text-center">
                        <div
                            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm"
                            style={{ background: 'rgba(255, 255, 255, 0.25)' }}
                        >
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-white">
                            Create Document
                        </h3>
                        <p className="text-base text-white opacity-90">
                            Start a new policy or procedure
                        </p>
                    </div>
                </div>

                <div
                    className="p-7 rounded-xl border-0 cursor-pointer transition-all duration-300 hover:scale-105"
                    style={{
                        background: COLORS.gradientForest,
                        boxShadow: COLORS.shadowGreen
                    }}
                >
                    <div className="text-center">
                        <div
                            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm"
                            style={{ background: 'rgba(255, 255, 255, 0.25)' }}
                        >
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-white">
                            Review Tasks
                        </h3>
                        <p className="text-base text-white opacity-90">
                            Check pending approvals
                        </p>
                    </div>
                </div>

                <div
                    className="p-7 rounded-xl border-0 cursor-pointer transition-all duration-300 hover:scale-105"
                    style={{
                        background: COLORS.gradientPurple,
                        boxShadow: COLORS.shadowPink
                    }}
                >
                    <div className="text-center">
                        <div
                            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm"
                            style={{ background: 'rgba(255, 255, 255, 0.25)' }}
                        >
                            <AlertCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-white">
                            View Alerts
                        </h3>
                        <p className="text-base text-white opacity-90">
                            Check system notifications
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

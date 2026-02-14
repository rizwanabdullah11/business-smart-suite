"use client"

import Link from "next/link"
import { ArrowLeft, Zap, Calendar as CalendarIcon, RefreshCw } from "lucide-react"
import { COLORS } from "@/constant/colors"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

// Mock Data
const improvementData = [
    { name: 'Jan', value: 0 },
    { name: 'Feb', value: 0 },
    { name: 'Mar', value: 0 },
    { name: 'Apr', value: 0 },
    { name: 'May', value: 0 },
];

const achievementData = [
    { name: 'Process Improvement', late: 0, onTime: 1 },
    { name: 'System Enhancement', late: 0, onTime: 1 },
];

const costData = [
    { name: 'Jan', cost: 0 },
    { name: 'Feb', cost: 0 },
    { name: 'Mar', cost: 0 },
    { name: 'Apr', cost: 0 },
    { name: 'May', cost: 0 },
    { name: 'Jun', cost: 0 },
    { name: 'Jul', cost: 0 },
    { name: 'Aug', cost: 0 },
    { name: 'Sep', cost: 0 },
    { name: 'Oct', cost: 0 },
    { name: 'Nov', cost: 0 },
    { name: 'Dec', cost: 0 },
];

export default function AnalyticsPage() {
    return (
        <div className="min-h-screen p-8" style={{ background: COLORS.bgGrayLight }}>
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-8">
                <Link href="/dashboard">
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors text-sm font-medium"
                        style={{ borderColor: COLORS.border, color: COLORS.primary }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>
                </Link>
                <h1 className="text-2xl font-bold text-black">Analytics Dashboard</h1>
            </div>

            {/* Main Dashboard Card */}
            <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: COLORS.border }}>

                {/* Dashboard Title Section */}
                <div className="flex items-start gap-4 mb-8">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ background: COLORS.primary }}
                    >
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-black">Analytics Dashboard</h2>
                        <p className="text-gray-500 text-sm mt-1">Real-time insights from Improvement Register data</p>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-end gap-6 mb-8 p-4 rounded-xl" style={{ background: COLORS.bgGrayLight }}>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-black uppercase tracking-wider">Start date</label>
                        <div className="relative">
                            <input
                                type="date"
                                className="pl-4 pr-10 py-2.5 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48 text-black"
                                defaultValue="2026-01-15"
                                style={{ borderColor: COLORS.border }}
                            />
                            {/* <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /> */}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-black uppercase tracking-wider">End date</label>
                        <div className="relative">
                            <input
                                type="date"
                                className="pl-4 pr-10 py-2.5 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48 text-black"
                                defaultValue="2026-02-15"
                                style={{ borderColor: COLORS.border }}
                            />
                            {/* <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /> */}
                        </div>
                    </div>

                    <button
                        className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium shadow-md hover:shadow-lg transition-all active:scale-95"
                        style={{ background: COLORS.primary }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Charts Grid - Top Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Chart 1: Root Cause Analysis */}
                    <div className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: COLORS.border }}>
                        <h3 className="text-sm font-semibold text-black mb-6">Improvement Register - Root Cause Analysis</h3>
                        <div className="h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center relative overflow-hidden" style={{ borderColor: COLORS.neutral200 }}>
                            {/* Placeholder implementation based on image which looks empty/dashed */}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={improvementData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide />
                                    <Tooltip />
                                    <Bar dataKey="value" fill={COLORS.primaryLight} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <div className="w-3 h-3 rounded-sm" style={{ background: COLORS.primaryLight }}></div>
                            <span className="text-sm text-gray-600 font-medium">Root Cause Count</span>
                        </div>
                    </div>

                    {/* Chart 2: Areas and Achievement Rate */}
                    <div className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: COLORS.border }}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-black">Areas and Achievement Rate</h3>
                        </div>

                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={achievementData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        interval={0}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                        tick={{ fontSize: 10, fill: COLORS.textSecondary }}
                                    />
                                    <YAxis tick={{ fontSize: 12, fill: COLORS.textSecondary }} domain={[0, 1]} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar dataKey="late" name="Late" fill={COLORS.pink500} radius={[4, 4, 0, 0]} barSize={30} />
                                    <Bar dataKey="onTime" name="On Time" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ background: COLORS.pink500 }}></div>
                                <span className="text-sm text-gray-600 font-medium">Late</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ background: COLORS.primary }}></div>
                                <span className="text-sm text-gray-600 font-medium">On Time</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Chart: Cost of Quality */}
                <div className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: COLORS.border }}>
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-black">Cost of Quality (12-Month Period)</h3>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Total Cost: <strong className="text-gray-900">£0.00</strong></span>
                            <span>Total Items: <strong className="text-gray-900">0</strong></span>
                            <span>Average Cost: <strong className="text-gray-900">£0.00</strong></span>
                        </div>
                    </div>

                    <div className="h-48 border-2 border-dashed rounded-lg" style={{ borderColor: COLORS.neutral200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={costData}>
                                <defs>
                                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1} />
                                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip />
                                <Area type="monotone" dataKey="cost" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorCost)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    )
}

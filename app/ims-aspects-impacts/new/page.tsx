"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function NewIMSAspectImpactPage() {
    const [activity, setActivity] = useState("")
    const [category, setCategory] = useState("1")
    const [aspect, setAspect] = useState("")
    const [impact, setImpact] = useState("")
    const [initialRisk, setInitialRisk] = useState("Low")
    const [controlMeasures, setControlMeasures] = useState("")
    const [residualRisk, setResidualRisk] = useState("Low")
    const [highlighted, setHighlighted] = useState(false)
    const [approved, setApproved] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement API call to create record
        console.log({
            activity,
            category,
            aspect,
            impact,
            initialRisk,
            controlMeasures,
            residualRisk,
            highlighted,
            approved
        })
    }

    return (
        <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            href="/ims-aspects-impacts"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md"
                            style={{
                                background: COLORS.bgWhite,
                                color: COLORS.textPrimary,
                                border: `1px solid ${COLORS.border}`,
                            }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to IMS Register
                        </Link>
                    </div>

                    {/* Create Form */}
                    <div
                        className="rounded-lg p-6 shadow-sm"
                        style={{
                            background: COLORS.bgWhite,
                            border: `1px solid ${COLORS.border}`,
                        }}
                    >
                        <h1 className="text-2xl font-bold mb-6" style={{ color: COLORS.textPrimary }}>
                            Add New Aspect & Impact
                        </h1>
                        <p className="text-sm mb-6" style={{ color: COLORS.textSecondary }}>
                            Record a new environmental aspect, impact, and associated risks.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Activity/Product/Service */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Activity / Product / Service
                                </label>
                                <input
                                    type="text"
                                    value={activity}
                                    onChange={(e) => setActivity(e.target.value)}
                                    placeholder="e.g., Chemical Storage Area"
                                    required
                                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        borderColor: COLORS.border,
                                        color: COLORS.textPrimary,
                                    }}
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        borderColor: COLORS.border,
                                        color: COLORS.textPrimary,
                                    }}
                                >
                                    <option value="1">Corporate Offices</option>
                                    <option value="2">Production / Manufacturing</option>
                                    <option value="3">Logistics</option>
                                    <option value="4">Maintenance</option>
                                </select>
                            </div>

                            {/* Aspect */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Aspect (Cause)
                                </label>
                                <textarea
                                    value={aspect}
                                    onChange={(e) => setAspect(e.target.value)}
                                    placeholder="e.g., Potential leakage of chemicals"
                                    rows={3}
                                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        borderColor: COLORS.border,
                                        color: COLORS.textPrimary,
                                    }}
                                />
                            </div>

                            {/* Impact */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Impact (Effect)
                                </label>
                                <textarea
                                    value={impact}
                                    onChange={(e) => setImpact(e.target.value)}
                                    placeholder="e.g., Soil and water contamination"
                                    rows={3}
                                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        borderColor: COLORS.border,
                                        color: COLORS.textPrimary,
                                    }}
                                />
                            </div>

                            {/* Initial Risk */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Initial Risk Level
                                </label>
                                <select
                                    value={initialRisk}
                                    onChange={(e) => setInitialRisk(e.target.value)}
                                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        borderColor: COLORS.border,
                                        color: COLORS.textPrimary,
                                    }}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            {/* Control Measures */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Control Measures
                                </label>
                                <textarea
                                    value={controlMeasures}
                                    onChange={(e) => setControlMeasures(e.target.value)}
                                    placeholder="Describe existing controls (e.g., Bunding, Spill kits)"
                                    rows={4}
                                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        borderColor: COLORS.border,
                                        color: COLORS.textPrimary,
                                    }}
                                />
                            </div>

                            {/* Residual Risk */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Residual Risk Level (After Controls)
                                </label>
                                <select
                                    value={residualRisk}
                                    onChange={(e) => setResidualRisk(e.target.value)}
                                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        borderColor: COLORS.border,
                                        color: COLORS.textPrimary,
                                    }}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="highlighted"
                                        checked={highlighted}
                                        onChange={(e) => setHighlighted(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="highlighted" className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                                        Highlight this record
                                    </label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="approved"
                                        checked={approved}
                                        onChange={(e) => setApproved(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="approved" className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                                        Mark as approved
                                    </label>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 pt-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg font-medium hover:shadow-md transition-all"
                                    style={{
                                        background: COLORS.primary,
                                        color: COLORS.textWhite,
                                    }}
                                >
                                    Create Record
                                </button>
                                <Link
                                    href="/ims-aspects-impacts"
                                    className="px-6 py-2 rounded-lg font-medium hover:shadow-md transition-all inline-block"
                                    style={{
                                        background: COLORS.bgGray,
                                        color: COLORS.textPrimary,
                                    }}
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

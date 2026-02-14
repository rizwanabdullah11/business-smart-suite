"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function NewSoAControlPage() {
    const [title, setTitle] = useState("")
    const [domain, setDomain] = useState("1")
    const [description, setDescription] = useState("")
    const [applicable, setApplicable] = useState(true)
    const [justification, setJustification] = useState("")
    const [status, setStatus] = useState("Implemented")
    const [owner, setOwner] = useState("")
    const [highlighted, setHighlighted] = useState(false)
    const [approved, setApproved] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement API call to create control
        console.log({
            title,
            domain,
            description,
            applicable,
            justification,
            status,
            owner,
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
                            href="/statement-of-applicability"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md"
                            style={{
                                background: COLORS.bgWhite,
                                color: COLORS.textPrimary,
                                border: `1px solid ${COLORS.border}`,
                            }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to SoA
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
                            Add/Edit Control
                        </h1>
                        <p className="text-sm mb-6" style={{ color: COLORS.textSecondary }}>
                            Define or update a security control for the Statement of Applicability.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Control Title / ID
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. A.9.1.1 Access control policy"
                                    required
                                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        borderColor: COLORS.border,
                                        color: COLORS.textPrimary,
                                    }}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Control Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="The requirements of the control..."
                                    rows={3}
                                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        borderColor: COLORS.border,
                                        color: COLORS.textPrimary,
                                    }}
                                />
                            </div>

                            {/* Domain */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Domain
                                </label>
                                <select
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        borderColor: COLORS.border,
                                        color: COLORS.textPrimary,
                                    }}
                                >
                                    <option value="1">A.5 Information Security Policies</option>
                                    <option value="2">A.6 Organization of Information Security</option>
                                    <option value="3">A.7 Human Resource Security</option>
                                    <option value="4">A.8 Asset Management</option>
                                    <option value="5">A.9 Access Control</option>
                                    <option value="6">A.10 Cryptography</option>
                                </select>
                            </div>

                            {/* Status & Owner */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                        Implementation Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{
                                            borderColor: COLORS.border,
                                            color: COLORS.textPrimary,
                                        }}
                                    >
                                        <option value="Implemented">Implemented</option>
                                        <option value="Partial">Partial</option>
                                        <option value="Planned">Planned</option>
                                        <option value="Not Started">Not Started</option>
                                        <option value="Not Applicable">Not Applicable</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                        Control Owner
                                    </label>
                                    <input
                                        type="text"
                                        value={owner}
                                        onChange={(e) => setOwner(e.target.value)}
                                        placeholder="e.g. CISO"
                                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{
                                            borderColor: COLORS.border,
                                            color: COLORS.textPrimary,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Justification */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Justification for Inclusion/Exclusion
                                </label>
                                <textarea
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                    placeholder="Explain why this control is applicable or excluded..."
                                    rows={2}
                                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        borderColor: COLORS.border,
                                        color: COLORS.textPrimary,
                                    }}
                                />
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="applicable"
                                        checked={applicable}
                                        onChange={(e) => setApplicable(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="applicable" className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                                        This Control Is Applicable
                                    </label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="highlighted"
                                        checked={highlighted}
                                        onChange={(e) => setHighlighted(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="highlighted" className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                                        Highlight (Priority)
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
                                        Mark as Approved
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
                                    Save Control
                                </button>
                                <Link
                                    href="/statement-of-applicability"
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

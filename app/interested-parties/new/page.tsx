"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function NewInterestedPartyPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [needs, setNeeds] = useState("")
    const [influence, setInfluence] = useState("Low")
    const [interest, setInterest] = useState("Low")
    const [risks, setRisks] = useState("")
    const [opportunities, setOpportunities] = useState("")
    const [highlighted, setHighlighted] = useState(false)
    const [approved, setApproved] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const token = localStorage.getItem("token")
                const response = await fetch("/api/categories?type=interested-parties", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                })
                if (!response.ok) throw new Error("Failed to load categories")
                const data = await response.json()
                const normalized = (Array.isArray(data) ? data : [])
                    .filter((cat: any) => !cat?.archived && !cat?.isArchived)
                    .map((cat: any) => ({ id: String(cat._id || cat.id), name: String(cat.name || "") }))
                    .filter((cat: { id: string; name: string }) => cat.id && cat.name)
                setCategories(normalized)
                setCategory((prev) => prev || normalized[0]?.id || "")
            } catch (error) {
                console.error("Error loading interested party categories:", error)
            } finally {
                setCategoriesLoading(false)
            }
        }
        loadCategories()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            alert("Party name is required")
            return
        }
        if (!category) {
            alert("Please select a category")
            return
        }

        try {
            setSaving(true)
            const token = localStorage.getItem("token")
            const response = await fetch("/api/interested-parties", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    title: name.trim(),
                    name: name.trim(),
                    category,
                    categoryId: category,
                    needs,
                    influence,
                    interest,
                    risks,
                    opportunities,
                    highlighted,
                    approved,
                }),
            })

            if (!response.ok) throw new Error("Failed to create interested party")
            router.push("/interested-parties")
        } catch (error) {
            console.error("Error creating interested party:", error)
            alert("Failed to create interested party")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            href="/interested-parties"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md"
                            style={{
                                background: COLORS.bgWhite,
                                color: COLORS.textPrimary,
                                border: `1px solid ${COLORS.border}`,
                            }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Interested Parties
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
                            Add New Interested Party
                        </h1>
                        <p className="text-sm mb-6" style={{ color: COLORS.textSecondary }}>
                            Identify a new stakeholder and their requirements.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Party Name / Group
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Local Community"
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
                                    {categoriesLoading ? (
                                        <option value="">Loading categories...</option>
                                    ) : categories.length === 0 ? (
                                        <option value="">No categories found</option>
                                    ) : (
                                        categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Needs */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Needs & Expectations
                                </label>
                                <textarea
                                    value={needs}
                                    onChange={(e) => setNeeds(e.target.value)}
                                    placeholder="What are their requirements?"
                                    rows={3}
                                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        borderColor: COLORS.border,
                                        color: COLORS.textPrimary,
                                    }}
                                />
                            </div>

                            {/* Influence & Interest */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                        Influence / Power
                                    </label>
                                    <select
                                        value={influence}
                                        onChange={(e) => setInfluence(e.target.value)}
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
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                        Interest Level
                                    </label>
                                    <select
                                        value={interest}
                                        onChange={(e) => setInterest(e.target.value)}
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
                            </div>

                            {/* Risks & Opportunities */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                        Associated Risks
                                    </label>
                                    <textarea
                                        value={risks}
                                        onChange={(e) => setRisks(e.target.value)}
                                        placeholder="Potential negative impacts..."
                                        rows={3}
                                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{
                                            borderColor: COLORS.border,
                                            color: COLORS.textPrimary,
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                        Associated Opportunities
                                    </label>
                                    <textarea
                                        value={opportunities}
                                        onChange={(e) => setOpportunities(e.target.value)}
                                        placeholder="Potential positive outcomes..."
                                        rows={3}
                                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{
                                            borderColor: COLORS.border,
                                            color: COLORS.textPrimary,
                                        }}
                                    />
                                </div>
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
                                        Highlight this party
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
                                    disabled={saving || categoriesLoading || !category}
                                    className="px-6 py-2 rounded-lg font-medium hover:shadow-md transition-all"
                                    style={{
                                        background: COLORS.primary,
                                        color: COLORS.textWhite,
                                        opacity: saving || categoriesLoading || !category ? 0.7 : 1,
                                    }}
                                >
                                    {saving ? "Saving..." : "Add Party"}
                                </button>
                                <Link
                                    href="/interested-parties"
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

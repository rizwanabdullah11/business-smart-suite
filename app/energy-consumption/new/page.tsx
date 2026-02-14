"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function NewEnergyReadingPage() {
    const [title, setTitle] = useState("")
    const [meterType, setMeterType] = useState("1")
    const [reading, setReading] = useState("")
    const [previousReading, setPreviousReading] = useState("")
    const [unit, setUnit] = useState("kWh")
    const [cost, setCost] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [location, setLocation] = useState("")
    const [status, setStatus] = useState("Pending")
    const [highlighted, setHighlighted] = useState(false)
    const [approved, setApproved] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement API call to record reading
        console.log({
            title,
            meterType,
            reading,
            previousReading,
            unit,
            cost,
            date,
            location,
            status,
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
                            href="/energy-consumption"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md"
                            style={{
                                background: COLORS.bgWhite,
                                color: COLORS.textPrimary,
                                border: `1px solid ${COLORS.border}`,
                            }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Energy
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
                            Record Energy Reading
                        </h1>
                        <p className="text-sm mb-6" style={{ color: COLORS.textSecondary }}>
                            Log utility consumption data for tracking and analysis.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Description / Period
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Factory Gas Meter - March 2024"
                                    required
                                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        borderColor: COLORS.border,
                                        color: COLORS.textPrimary,
                                    }}
                                />
                            </div>

                            {/* Meter Type & Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                        Meter Type
                                    </label>
                                    <select
                                        value={meterType}
                                        onChange={(e) => setMeterType(e.target.value)}
                                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{
                                            borderColor: COLORS.border,
                                            color: COLORS.textPrimary,
                                        }}
                                    >
                                        <option value="1">Electricity</option>
                                        <option value="2">Gas</option>
                                        <option value="3">Water</option>
                                        <option value="4">Fuel/Oil</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                        Date of Reading
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{
                                            borderColor: COLORS.border,
                                            color: COLORS.textPrimary,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Readings */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                        Current Reading
                                    </label>
                                    <input
                                        type="number"
                                        value={reading}
                                        onChange={(e) => setReading(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{
                                            borderColor: COLORS.border,
                                            color: COLORS.textPrimary,
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                        Previous Reading
                                    </label>
                                    <input
                                        type="number"
                                        value={previousReading}
                                        onChange={(e) => setPreviousReading(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{
                                            borderColor: COLORS.border,
                                            color: COLORS.textPrimary,
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                        Unit
                                    </label>
                                    <select
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{
                                            borderColor: COLORS.border,
                                            color: COLORS.textPrimary,
                                        }}
                                    >
                                        <option value="kWh">kWh</option>
                                        <option value="m3">m3</option>
                                        <option value="Liters">Liters</option>
                                        <option value="Therms">Therms</option>
                                    </select>
                                </div>
                            </div>

                            {/* Cost & Location */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                        Total Cost
                                    </label>
                                    <input
                                        type="number"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{
                                            borderColor: COLORS.border,
                                            color: COLORS.textPrimary,
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                        Location / Area
                                    </label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. Warehouse B"
                                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        style={{
                                            borderColor: COLORS.border,
                                            color: COLORS.textPrimary,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                    Verification Status
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
                                    <option value="Pending">Pending Verification</option>
                                    <option value="Verified">Verified against Bill</option>
                                    <option value="Disputed">Disputed</option>
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
                                        Highlight this reading (e.g. abnormal spike)
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
                                        Approved for reporting
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
                                    Save Reading
                                </button>
                                <Link
                                    href="/energy-consumption"
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

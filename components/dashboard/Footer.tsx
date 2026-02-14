"use client"

import { COLORS } from "@/constant/colors"
import { Mail, Phone, MapPin, Globe } from "lucide-react"

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer
            className="mt-16 border-t"
            style={{
                background: COLORS.bgWhite,
                borderColor: COLORS.border
            }}
        >
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="h-12 w-12 rounded-lg flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                <span className="font-bold text-2xl text-white">B</span>
                            </div>
                            <h3
                                className="text-2xl font-bold"
                                style={{ color: COLORS.textPrimary }}
                            >
                                Business Smart Suite
                            </h3>
                        </div>
                        <p
                            className="text-base leading-relaxed mb-4"
                            style={{ color: COLORS.textSecondary }}
                        >
                            ISO 9001 Compliance Management System - Streamline your business operations
                            with our comprehensive compliance and management solution.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4
                            className="text-lg font-bold mb-4"
                            style={{ color: COLORS.textPrimary }}
                        >
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            {['Dashboard', 'Analytics', 'Policies', 'Procedures', 'Support'].map((link) => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        className="text-base transition-colors hover:underline"
                                        style={{ color: COLORS.textSecondary }}
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4
                            className="text-lg font-bold mb-4"
                            style={{ color: COLORS.textPrimary }}
                        >
                            Contact Us
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5" style={{ color: COLORS.primary }} />
                                <span className="text-base" style={{ color: COLORS.textSecondary }}>
                                    support@businesssmart.com
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5" style={{ color: COLORS.primary }} />
                                <span className="text-base" style={{ color: COLORS.textSecondary }}>
                                    +1 (555) 123-4567
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Globe className="w-5 h-5" style={{ color: COLORS.primary }} />
                                <span className="text-base" style={{ color: COLORS.textSecondary }}>
                                    www.businesssmart.com
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div
                    className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4"
                    style={{ borderColor: COLORS.border }}
                >
                    <p
                        className="text-base"
                        style={{ color: COLORS.textSecondary }}
                    >
                        © {currentYear} Business Smart Suite. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a
                            href="#"
                            className="text-base transition-colors hover:underline"
                            style={{ color: COLORS.textSecondary }}
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="text-base transition-colors hover:underline"
                            style={{ color: COLORS.textSecondary }}
                        >
                            Terms of Service
                        </a>
                        <a
                            href="#"
                            className="text-base transition-colors hover:underline"
                            style={{ color: COLORS.textSecondary }}
                        >
                            Cookie Policy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

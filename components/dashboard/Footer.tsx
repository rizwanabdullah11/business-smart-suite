"use client"

import { COLORS } from "@/constant/colors"
import { Mail, Phone, MapPin, Globe } from "lucide-react"

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer
            className="mt-16"
            style={{
                background: "#341746",
                borderTop: "1px solid rgba(255,255,255,0.08)"
            }}
        >
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm"
                                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
                            >
                                <span className="font-bold text-2xl text-white">B</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white">
                                Business Smart Suite
                            </h3>
                        </div>
                        <p
                            className="text-base leading-relaxed mb-4"
                            style={{ color: "rgba(255,255,255,0.6)" }}
                        >
                            ISO 9001 Compliance Management System — Streamline your business operations
                            with our comprehensive compliance and management solution.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-base font-bold mb-4 text-white">
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            {['Dashboard', 'Analytics', 'Policies', 'Procedures', 'Support'].map((link) => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        className="text-sm transition-colors hover:text-white"
                                        style={{ color: "rgba(255,255,255,0.55)" }}
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-base font-bold mb-4 text-white">
                            Contact Us
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
                                <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    support@businesssmart.com
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
                                <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    +1 (555) 123-4567
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Globe className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
                                <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    www.businesssmart.com
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div
                    className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                >
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                        © {currentYear} Business Smart Suite. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((label) => (
                            <a
                                key={label}
                                href="#"
                                className="text-sm transition-colors hover:text-white"
                                style={{ color: "rgba(255,255,255,0.45)" }}
                            >
                                {label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

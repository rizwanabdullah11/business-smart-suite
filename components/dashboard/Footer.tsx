"use client"

import Link from "next/link"
import { COLORS } from "@/constant/colors"
import { Mail, Phone, Globe } from "lucide-react"

const QUICK_LINKS: { label: string; href: string }[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Features", href: "/features" },
  { label: "Modules", href: "/modules" },
  { label: "Getting Started", href: "/guides/getting-started" },
  { label: "ISO Standards", href: "/guides/iso-standards" },
  { label: "Support", href: "mailto:support@businesssmart.com" },
]

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer
            className="mt-auto border-t border-white/[0.08]"
            style={{
                background: COLORS.brandShell,
            }}
        >
            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-10 md:items-start">
                    <div className="md:col-span-5">
                        <div className="flex flex-wrap items-center gap-3 mb-5">
                            <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md"
                                style={{ background: COLORS.brandMarkGradient }}
                            >
                                <span className="text-2xl font-bold text-white">B</span>
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                                Business Smart Suite
                            </h3>
                        </div>
                        <p className="text-sm leading-relaxed sm:text-[0.9375rem]" style={{ color: "rgba(255,255,255,0.68)" }}>
                            ISO 9001 compliance management — one place for documents, audits, registers, and
                            day-to-day quality workflows.
                        </p>
                    </div>

                    <div className="md:col-span-3">
                        <h4 className="mb-4 text-[0.8125rem] font-bold uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.95)" }}>
                            Quick links
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                            {QUICK_LINKS.map(({ label, href }) => (
                                <li key={href}>
                                    <Link href={href} className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.65)" }}>
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-4">
                        <h4 className="mb-4 text-[0.8125rem] font-bold uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.95)" }}>
                            Contact
                        </h4>
                        <ul className="flex flex-col gap-3">
                            <li className="flex items-start gap-3">
                                <Mail className="mt-0.5 h-4 w-4 shrink-0" style={{ color: COLORS.purple300 }} />
                                <span className="text-sm" style={{ color: "rgba(255,255,255,0.68)" }}>
                                    support@businesssmart.com
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="mt-0.5 h-4 w-4 shrink-0" style={{ color: COLORS.purple300 }} />
                                <span className="text-sm" style={{ color: "rgba(255,255,255,0.68)" }}>
                                    +1 (555) 123-4567
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Globe className="mt-0.5 h-4 w-4 shrink-0" style={{ color: COLORS.purple300 }} />
                                <span className="text-sm" style={{ color: "rgba(255,255,255,0.68)" }}>
                                    www.businesssmart.com
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div
                    className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-8 md:flex-row md:items-center"
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

"use client"

import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

const PRODUCT_LINKS = [
  { label: "All Modules", href: "/modules" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Getting Started", href: "/guides/getting-started" },
  { label: "ISO Standards", href: "/guides/iso-standards" },
]

const COMPANY_LINKS = [
  { label: "About Us", href: "/welcome#about" },
  { label: "Customer Stories", href: "/welcome#stories" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
]

const PLAN_LINKS = [
  { label: "Starter", href: "/pricing#starter" },
  { label: "Growth", href: "/pricing#growth" },
  { label: "Enterprise", href: "/pricing#enterprise" },
]

export function MarketingFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-16" style={{ background: "#1a0b2e" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/welcome" className="flex items-center gap-2.5">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
              >
                <span className="font-black text-xl text-white">B</span>
              </div>
              <div className="text-xl font-black text-white">Business Smart Suite</div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed max-w-md" style={{ color: "rgba(255,255,255,0.6)" }}>
              The all-in-one ISO compliance and quality management platform. Built for organisations that
              want to simplify certification — from documents to audits, all in one place.
            </p>

            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                <Mail className="h-4 w-4 text-purple-400" />
                hello@businesssmartsuite.com
              </div>
              <div className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                <Phone className="h-4 w-4 text-purple-400" />
                +44 (0) 1234 567 890
              </div>
              <div className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                <MapPin className="h-4 w-4 text-purple-400 mt-0.5" />
                <span>Unit 4, The Pavilions, Avroe Crescent, Blackpool, FY4 2DP</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-purple-700"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <Icon className="h-4 w-4 text-white/70" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Product</h4>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Plans</h4>
            <ul className="space-y-2.5">
              {PLAN_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 border-t"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            © {year} Business Smart Suite. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Cookies</a>
            <a href="#" className="hover:text-white">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

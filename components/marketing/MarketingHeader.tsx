"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, ArrowRight } from "lucide-react"

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "/welcome" },
  { label: "Modules", href: "/modules" },
  { label: "Features", href: "/features" },
  { label: "Guides", href: "/guides/getting-started" },
]

/** Issosmart-style public marketing header with brand, navigation, and auth CTAs. */
export function MarketingHeader() {
  const pathname = usePathname() || ""
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/welcome") return pathname === "/welcome"
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-gray-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <Link href="/welcome" className="flex items-center gap-2.5 group">
            <div
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
            >
              <span className="font-black text-lg sm:text-xl text-white">B</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm sm:text-base font-black tracking-tight text-gray-900">
                Business Smart Suite
              </div>
              <div className="hidden sm:block text-[10px] uppercase tracking-wider font-semibold text-purple-700">
                Compliance Portal
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${
                  isActive(link.href)
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-700 hover:text-purple-700 hover:bg-purple-50/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:text-purple-700 hover:bg-purple-50/60 transition-all"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden rounded-lg p-2 text-gray-700 hover:bg-purple-50"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div className="lg:hidden border-t border-gray-200/80 py-3">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    isActive(link.href)
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-700 hover:bg-purple-50/60"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 pt-3 border-t border-gray-200/80">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-center text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-center text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  )
}

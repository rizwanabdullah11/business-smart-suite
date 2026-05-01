"use client"

import { Fragment, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, X, Sparkles, ShieldCheck, Phone, Mail } from "lucide-react"
import { MarketingShell } from "@/components/marketing/MarketingShell"

type Cycle = "monthly" | "annual"

type Plan = {
  id: "starter" | "growth" | "enterprise"
  name: string
  tagline: string
  /** annual: monthly equivalent when billed annually (30% off) */
  annual: number
  /** monthly: when billed month-to-month */
  monthly: number
  highlighted?: boolean
  badge?: string
  cta: string
  ctaHref: string
  features: string[]
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Best for smaller organisations getting started",
    annual: 120,
    monthly: 170,
    cta: "Get Started",
    ctaHref: "/login",
    features: [
      "Templated documents",
      "Legal Register",
      "Risk Register",
      "Task Manager",
      "Audit Management (basic)",
      "Improvement Log (CAPA)",
      "Objectives & Targets",
      "Unlimited users",
      "Unlimited storage",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Best for growing organisations and multi-site teams",
    annual: 195,
    monthly: 275,
    highlighted: true,
    badge: "Most Popular",
    cta: "Get Started",
    ctaHref: "/login",
    features: [
      "Everything in Starter",
      "Stakeholder Management",
      "Supplier Management",
      "Training Management",
      "Equipment Maintenance",
      "Business Environment (Context)",
      "Environmental Aspects",
      "Asset Management",
      "Email + Phone support",
      "7 hrs of consultancy support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Best for established organisations needing automation",
    annual: 300,
    monthly: 430,
    cta: "Contact Sales",
    ctaHref: "mailto:hello@businesssmartsuite.com",
    features: [
      "Everything in Growth",
      "IT Risk Management",
      "Obligations Register",
      "Advanced Auditing & Workflows",
      "Management Review module",
      "Multi-site management",
      "Advanced Analytics & KPI Dashboards",
      "External Auditor Portal",
      "Dedicated Account Manager",
      "14 hrs of consultancy support",
    ],
  },
]

type CompareRow = {
  feature: string
  starter: boolean | string
  growth: boolean | string
  enterprise: boolean | string
}

const COMPARE_GROUPS: { title: string; rows: CompareRow[] }[] = [
  {
    title: "Documentation",
    rows: [
      { feature: "System Manual", starter: true, growth: true, enterprise: true },
      { feature: "Procedures", starter: true, growth: true, enterprise: true },
      { feature: "Policies", starter: true, growth: true, enterprise: true },
      { feature: "Forms & Checklists", starter: true, growth: true, enterprise: true },
      { feature: "Document Control & Versioning", starter: true, growth: true, enterprise: true },
    ],
  },
  {
    title: "Compliance core",
    rows: [
      { feature: "Risk Register", starter: true, growth: true, enterprise: true },
      { feature: "Legal Register", starter: true, growth: true, enterprise: true },
      { feature: "Objectives & Targets", starter: true, growth: true, enterprise: true },
      { feature: "Improvement Log (CAPA)", starter: true, growth: true, enterprise: true },
      { feature: "Audit Management", starter: "Basic", growth: true, enterprise: "Advanced" },
    ],
  },
  {
    title: "Operations & people",
    rows: [
      { feature: "Stakeholder Management", starter: false, growth: true, enterprise: true },
      { feature: "Supplier Management", starter: false, growth: true, enterprise: "Advanced" },
      { feature: "Training Management", starter: false, growth: true, enterprise: true },
      { feature: "Equipment Maintenance", starter: false, growth: true, enterprise: true },
      { feature: "Asset Management", starter: false, growth: true, enterprise: true },
      { feature: "Business Environment (Context)", starter: false, growth: true, enterprise: true },
      { feature: "Environmental Aspects", starter: false, growth: true, enterprise: true },
    ],
  },
  {
    title: "Enterprise modules",
    rows: [
      { feature: "IT Risk Management", starter: false, growth: false, enterprise: true },
      { feature: "Obligations Register", starter: false, growth: false, enterprise: true },
      { feature: "Statement of Applicability", starter: false, growth: false, enterprise: true },
      { feature: "Management Review", starter: false, growth: false, enterprise: true },
      { feature: "Multi-site Management", starter: false, growth: false, enterprise: true },
      { feature: "External Auditor Portal", starter: false, growth: false, enterprise: true },
    ],
  },
  {
    title: "ISO standards supported",
    rows: [
      { feature: "ISO 9001 (Quality)", starter: true, growth: true, enterprise: true },
      { feature: "ISO 14001 (Environment)", starter: false, growth: true, enterprise: true },
      { feature: "ISO 45001 (H&S)", starter: false, growth: true, enterprise: true },
      { feature: "ISO 27001 (InfoSec)", starter: false, growth: false, enterprise: true },
      { feature: "ISO 27701 (Privacy)", starter: false, growth: false, enterprise: true },
      { feature: "ISO 22301 (Continuity)", starter: false, growth: false, enterprise: true },
    ],
  },
  {
    title: "Support",
    rows: [
      { feature: "Email support", starter: true, growth: true, enterprise: true },
      { feature: "Phone support", starter: false, growth: true, enterprise: "Priority" },
      { feature: "Onboarding assistance", starter: false, growth: true, enterprise: true },
      { feature: "Dedicated Account Manager", starter: false, growth: false, enterprise: true },
      { feature: "Consultancy hours", starter: "—", growth: "7 hrs", enterprise: "14 hrs" },
    ],
  },
]

const FAQS = [
  {
    q: "Is there a free trial?",
    a: "Yes — every plan includes a 14-day free trial with full access. No credit card required to start.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. Upgrade or downgrade at any time from your billing dashboard. Changes apply immediately.",
  },
  {
    q: "Do you support multiple ISO standards at once?",
    a: "Yes. Growth covers ISO 9001, 14001 and 45001; Enterprise adds ISO 27001, 27701 and 22301 simultaneously.",
  },
  {
    q: "How does external auditor access work?",
    a: "Enterprise includes an External Auditor Portal — read-only access for your certification body that expires automatically after the audit window.",
  },
  {
    q: "Are users limited?",
    a: "No. All plans include unlimited users and unlimited storage — pay per organisation, not per seat.",
  },
]

function Tick({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
        {value}
      </span>
    )
  }
  return value ? (
    <Check className="mx-auto h-5 w-5 text-emerald-600" />
  ) : (
    <X className="mx-auto h-5 w-5 text-gray-300" />
  )
}

export default function PricingPage() {
  const [cycle, setCycle] = useState<Cycle>("annual")

  return (
    <MarketingShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#faf5ff 0%, #ffffff 100%)" }} />
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.18),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700 border border-purple-200">
            <Sparkles className="h-3.5 w-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-gray-900">
            Pick your perfect fit
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Choose monthly or annual billing. Annual saves you 30% — compare every feature side-by-side below.
          </p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-2xl bg-white p-1.5 border border-purple-200 shadow-sm">
            <button
              type="button"
              onClick={() => setCycle("annual")}
              className={`relative rounded-xl px-5 py-2 text-sm font-bold transition-all ${
                cycle === "annual" ? "text-white shadow-md" : "text-gray-700 hover:text-purple-700"
              }`}
              style={{
                background: cycle === "annual" ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent",
              }}
            >
              Annually
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                  cycle === "annual" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                30% off
              </span>
            </button>
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={`rounded-xl px-5 py-2 text-sm font-bold transition-all ${
                cycle === "monthly" ? "text-white shadow-md" : "text-gray-700 hover:text-purple-700"
              }`}
              style={{
                background: cycle === "monthly" ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent",
              }}
            >
              Monthly
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PLANS.map((p) => {
              const price = cycle === "annual" ? p.annual : p.monthly
              const cycleLabel = cycle === "annual" ? "/ month, billed annually" : "/ month, billed monthly"
              return (
                <div
                  key={p.id}
                  id={p.id}
                  className={`relative rounded-3xl p-7 sm:p-8 transition-all ${
                    p.highlighted
                      ? "bg-gradient-to-br from-[#1a0b2e] to-[#3b0764] text-white shadow-2xl lg:scale-[1.02]"
                      : "bg-white border border-gray-200 hover:shadow-xl"
                  }`}
                >
                  {p.highlighted && p.badge ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-purple-700 shadow-md">
                      {p.badge}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <h3 className={`text-2xl font-black ${p.highlighted ? "text-white" : "text-gray-900"}`}>
                      {p.name}
                    </h3>
                    {p.highlighted ? (
                      <ShieldCheck className="h-6 w-6 text-purple-300" />
                    ) : (
                      <ShieldCheck className="h-6 w-6 text-purple-600" />
                    )}
                  </div>

                  <p className={`mt-1.5 text-sm leading-relaxed ${p.highlighted ? "text-white/70" : "text-gray-600"}`}>
                    {p.tagline}
                  </p>

                  <div className="mt-6">
                    <div className={`flex items-baseline gap-1 ${p.highlighted ? "text-white" : "text-gray-900"}`}>
                      <span className="text-sm font-bold opacity-70">From</span>
                      <span className="text-5xl font-black ml-1">£{price}</span>
                    </div>
                    <div className={`mt-1 text-xs ${p.highlighted ? "text-white/60" : "text-gray-500"}`}>
                      {cycleLabel}
                    </div>
                    {cycle === "annual" ? (
                      <div className={`mt-1 text-xs italic ${p.highlighted ? "text-purple-300" : "text-emerald-700"}`}>
                        Billed annually upfront
                      </div>
                    ) : null}
                  </div>

                  <Link
                    href={p.ctaHref}
                    className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                      p.highlighted
                        ? "bg-white text-purple-700 hover:bg-gray-100"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {p.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <div className={`mt-7 pt-7 border-t ${p.highlighted ? "border-white/15" : "border-gray-200"}`}>
                    <div className={`text-xs font-black uppercase tracking-wider mb-4 ${p.highlighted ? "text-white/60" : "text-purple-700"}`}>
                      What is included
                    </div>
                    <ul className="space-y-3">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlighted ? "text-purple-300" : "text-emerald-600"}`}
                          />
                          <span className={p.highlighted ? "text-white/85" : "text-gray-700"}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 rounded-2xl bg-purple-50 border border-purple-200 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-black text-gray-900">Not sure which plan?</div>
                <div className="text-xs text-gray-600">Book a free 30-minute consultation — we will recommend the right plan for you.</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="mailto:hello@businesssmartsuite.com"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-purple-700 border border-purple-300 hover:bg-purple-100"
              >
                <Mail className="h-4 w-4" />
                Email Sales
              </a>
              <a
                href="tel:+441234567890"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
              >
                <Phone className="h-4 w-4" />
                Talk to us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="compare" className="py-16 sm:py-20" style={{ background: "linear-gradient(180deg,#ffffff 0%, #faf5ff 100%)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700">
              Compare plans
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
              Every feature, side-by-side
            </h2>
            <p className="mt-3 text-base text-gray-600 max-w-2xl mx-auto">
              From documents to multi-standard ISO compliance — see exactly what is included in each plan.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-purple-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr style={{ background: "linear-gradient(135deg,#1a0b2e,#3b0764)" }}>
                    <th className="px-6 py-5 text-white font-black text-base">Feature</th>
                    <th className="px-6 py-5 text-center">
                      <div className="text-white font-black">Starter</div>
                      <div className="text-xs font-semibold text-white/60 mt-0.5">From £120/mo</div>
                    </th>
                    <th className="px-6 py-5 text-center bg-purple-700/30">
                      <div className="inline-flex items-center gap-2 text-white font-black">
                        Growth
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                          Popular
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white/60 mt-0.5">From £195/mo</div>
                    </th>
                    <th className="px-6 py-5 text-center">
                      <div className="text-white font-black">Enterprise</div>
                      <div className="text-xs font-semibold text-white/60 mt-0.5">From £300/mo</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_GROUPS.map((group, gi) => (
                    <Fragment key={`g-${gi}`}>
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 pt-6 pb-3 text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-50/40"
                        >
                          {group.title}
                        </td>
                      </tr>
                      {group.rows.map((row, ri) => (
                        <tr
                          key={`g-${gi}-r-${ri}`}
                          className="border-t border-gray-100 hover:bg-purple-50/30 transition-colors"
                        >
                          <td className="px-6 py-3.5 font-semibold text-gray-900">{row.feature}</td>
                          <td className="px-6 py-3.5 text-center">
                            <Tick value={row.starter} />
                          </td>
                          <td className="px-6 py-3.5 text-center bg-purple-50/40">
                            <Tick value={row.growth} />
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <Tick value={row.enterprise} />
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                  <tr className="border-t border-gray-200">
                    <td className="px-6 py-5 font-semibold text-gray-900">Choose your plan</td>
                    <td className="px-6 py-5 text-center">
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 text-white px-4 py-2 text-xs font-bold hover:bg-purple-700"
                      >
                        Get Started
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-center bg-purple-50/40">
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
                      >
                        Get Started
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <a
                        href="mailto:hello@businesssmartsuite.com"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 text-white px-4 py-2 text-xs font-bold hover:bg-black"
                      >
                        Contact Sales
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-4 text-xs text-center text-gray-500">
            Prices in GBP. Annual billing is invoiced once per year and includes a 30% saving compared with monthly.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-gray-200 bg-white p-5 hover:border-purple-200 transition-all open:bg-purple-50/40"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-bold text-gray-900">{f.q}</span>
                  <span className="ml-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-black group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" style={{ background: "linear-gradient(135deg,#3b0764 0%, #6b21a8 50%, #a855f7 100%)" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Get your business ISO-certified — fast.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
            Start your free trial today, no credit card required. Cancel anytime.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-purple-700 shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-bold text-white border border-white/20 hover:bg-white/15 transition-all"
            >
              View Features
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}

"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Boxes,
  ClipboardCheck,
  Users,
  Building2,
  Target,
  Wrench,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Server,
  Leaf,
  FileText,
  Scale,
  Sparkles,
  ScrollText,
  Search,
} from "lucide-react"
import { MarketingShell } from "@/components/marketing/MarketingShell"

type ModuleCard = {
  key: string
  name: string
  category: string
  desc: string
  isoLink: string
  plan: "Starter" | "Growth" | "Enterprise"
  icon: any
}

const ALL_MODULES: ModuleCard[] = [
  {
    key: "document-control",
    name: "Document Control",
    category: "Governance",
    desc: "Manage all policies, procedures and work instructions with version control, approval workflows and access rights.",
    isoLink: "All ISO standards",
    plan: "Starter",
    icon: FileText,
  },
  {
    key: "audit-management",
    name: "Audit Management",
    category: "Compliance",
    desc: "Schedule internal and external audits, assign auditors, record findings, raise non-conformances and close out actions.",
    isoLink: "All ISO standards",
    plan: "Starter",
    icon: ClipboardCheck,
  },
  {
    key: "risk-register",
    name: "Risk Register",
    category: "Risk",
    desc: "Identify, assess (likelihood × impact) and mitigate all business risks. Full audit trail of risk decisions.",
    isoLink: "ISO 9001 / 14001 / 45001",
    plan: "Starter",
    icon: AlertTriangle,
  },
  {
    key: "legal-register",
    name: "Legal Register",
    category: "Compliance",
    desc: "Maintain a live register of applicable legal and regulatory requirements with auto-alerts on changes.",
    isoLink: "ISO 14001 / 45001",
    plan: "Starter",
    icon: Scale,
  },
  {
    key: "objectives-targets",
    name: "Objectives & Targets",
    category: "Performance",
    desc: "Set measurable business and compliance goals, assign owners, track progress and link to KPI dashboards.",
    isoLink: "ISO 9001 6.2",
    plan: "Starter",
    icon: Target,
  },
  {
    key: "improvement-log",
    name: "Improvement Log (CAPA)",
    category: "Quality",
    desc: "Record corrective actions, preventive actions and continual improvement ideas. Track from identification to closure.",
    isoLink: "ISO 9001 10",
    plan: "Starter",
    icon: TrendingUp,
  },
  {
    key: "stakeholder-management",
    name: "Stakeholder Management",
    category: "Strategy",
    desc: "Identify and manage relationships with customers, suppliers, regulators and partners. Track their needs and expectations.",
    isoLink: "ISO 9001 4.2",
    plan: "Growth",
    icon: Users,
  },
  {
    key: "supplier-management",
    name: "Supplier Management",
    category: "Supply Chain",
    desc: "Evaluate and monitor supplier performance, compliance status and risk. Maintain approved supplier lists.",
    isoLink: "ISO 9001 8.4",
    plan: "Growth",
    icon: Briefcase,
  },
  {
    key: "training-management",
    name: "Training Management",
    category: "People",
    desc: "Assign ISO and role-specific training to employees. Track completion, store certificates and demonstrate competency.",
    isoLink: "ISO 9001 7.2",
    plan: "Growth",
    icon: GraduationCap,
  },
  {
    key: "equipment-maintenance",
    name: "Equipment Maintenance",
    category: "Operations",
    desc: "Log all equipment requiring scheduled maintenance. Automated reminders prevent missed service dates.",
    isoLink: "ISO 9001 / 14001",
    plan: "Growth",
    icon: Wrench,
  },
  {
    key: "business-environment",
    name: "Business Environment (Context)",
    category: "Strategy",
    desc: "Document internal and external factors affecting your business. SWOT/PESTLE analysis linked to risks and objectives.",
    isoLink: "ISO 9001 4.1",
    plan: "Growth",
    icon: Building2,
  },
  {
    key: "environmental-aspects",
    name: "Environmental Aspects",
    category: "Environment",
    desc: "Log environmental impacts of operations. Track emissions, energy use, waste. Monitor sustainability targets.",
    isoLink: "ISO 14001",
    plan: "Growth",
    icon: Leaf,
  },
  {
    key: "asset-management",
    name: "Asset Management",
    category: "Operations",
    desc: "Track all company assets (hardware, equipment, vehicles). Log status, location, owner and maintenance history.",
    isoLink: "ISO 9001 / 27001",
    plan: "Growth",
    icon: Boxes,
  },
  {
    key: "it-risk-management",
    name: "IT Risk Management",
    category: "Security",
    desc: "Identify cybersecurity risks, manage information security controls, maintain a risk treatment plan.",
    isoLink: "ISO 27001",
    plan: "Enterprise",
    icon: Server,
  },
  {
    key: "obligations-register",
    name: "Obligations Register",
    category: "Compliance",
    desc: "Track commitments made to customers, regulators and stakeholders. Separate from legal for full clarity.",
    isoLink: "ISO 14001 6.1",
    plan: "Enterprise",
    icon: ScrollText,
  },
]

const CATEGORIES = Array.from(new Set(ALL_MODULES.map((m) => m.category))).sort()
const PLANS = ["Starter", "Growth", "Enterprise"] as const

function PlanChip({ plan }: { plan: "Starter" | "Growth" | "Enterprise" }) {
  const map = {
    Starter: "bg-emerald-100 text-emerald-700",
    Growth: "bg-purple-100 text-purple-700",
    Enterprise: "bg-indigo-100 text-indigo-700",
  } as const
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${map[plan]}`}>
      {plan}
    </span>
  )
}

export default function ModulesPage() {
  const [query, setQuery] = useState("")
  const [activeCat, setActiveCat] = useState<string>("All")
  const [activePlan, setActivePlan] = useState<string>("All")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ALL_MODULES.filter((m) => {
      if (activeCat !== "All" && m.category !== activeCat) return false
      if (activePlan !== "All" && m.plan !== activePlan) return false
      if (!q) return true
      return (
        m.name.toLowerCase().includes(q) ||
        m.desc.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.isoLink.toLowerCase().includes(q)
      )
    })
  }, [query, activeCat, activePlan])

  const counts = useMemo(() => {
    return {
      total: ALL_MODULES.length,
      starter: ALL_MODULES.filter((m) => m.plan === "Starter").length,
      growth: ALL_MODULES.filter((m) => m.plan !== "Enterprise").length,
      enterprise: ALL_MODULES.length,
    }
  }, [])

  return (
    <MarketingShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#faf5ff 0%, #ffffff 100%)" }} />
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.18),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700 border border-purple-200">
            <Sparkles className="h-3.5 w-3.5" />
            All modules
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-gray-900">
            15 powerful modules. One unified platform.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Each module targets a specific area of business compliance and quality management. Activate the modules you
            need from your plan, and grow as you scale.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { v: counts.total, l: "Total modules" },
              { v: counts.starter, l: "In Starter" },
              { v: counts.growth, l: "In Growth" },
              { v: counts.enterprise, l: "In Enterprise" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white border border-purple-100 px-4 py-3">
                <div className="text-2xl font-black text-purple-700">{s.v}</div>
                <div className="text-xs font-semibold text-gray-600 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search modules, ISO clauses or categories…"
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActivePlan("All")}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    activePlan === "All" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  All plans
                </button>
                {PLANS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePlan(p)}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                      activePlan === p ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-purple-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => setActiveCat("All")}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  activeCat === "All" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All categories
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                    activeCat === c ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                <Search className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-gray-700">
                No modules match your filters. Try clearing them.
              </p>
              <button
                onClick={() => {
                  setQuery("")
                  setActiveCat("All")
                  setActivePlan("All")
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((m) => (
                <div
                  key={m.key}
                  className="group rounded-3xl border border-gray-200 bg-white p-6 hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
                    >
                      <m.icon className="h-5 w-5" />
                    </div>
                    <PlanChip plan={m.plan} />
                  </div>

                  <h3 className="mt-5 text-lg font-black text-gray-900">{m.name}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{m.desc}</p>

                  <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                        {m.category}
                      </span>
                      <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                        {m.isoLink}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/pricing"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 group-hover:text-purple-900"
                  >
                    See plans that include this
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-20" style={{ background: "linear-gradient(135deg,#3b0764 0%, #6b21a8 50%, #a855f7 100%)" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            One platform. Every compliance need.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
            Pick the modules you need today. Add more as your business grows.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-purple-700 shadow-lg hover:-translate-y-0.5 transition-all"
            >
              See Pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-bold text-white border border-white/20 hover:bg-white/15 transition-all"
            >
              All Features
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}

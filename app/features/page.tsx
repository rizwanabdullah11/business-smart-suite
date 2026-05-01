import Link from "next/link"
import {
  ArrowRight,
  Check,
  ShieldCheck,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  Scale,
  Target,
  TrendingUp,
  Users,
  Briefcase,
  GraduationCap,
  Wrench,
  Building2,
  Leaf,
  Boxes,
  Server,
  ScrollText,
  BarChart3,
  Lock,
  Cloud,
  Bell,
  Layers,
  Clock,
  Award,
  UserCog,
  UserCheck,
  Eye,
} from "lucide-react"
import { MarketingShell } from "@/components/marketing/MarketingShell"

export const metadata = {
  title: "Features — Business Smart Suite",
  description:
    "Every feature you get with Business Smart Suite — documents, audits, risks, training, suppliers, role-based access, automation and more.",
}

type Cap = { icon: any; title: string; desc: string; plan: "Starter" | "Growth" | "Enterprise" }

const PLATFORM_CAPS: Cap[] = [
  { icon: Cloud, title: "Cloud-based access", desc: "Use it from any browser or mobile — no installation, no maintenance.", plan: "Starter" },
  { icon: Clock, title: "Setup in 30 minutes", desc: "Pre-built templates configure your system at speed.", plan: "Starter" },
  { icon: Layers, title: "Multi-standard ready", desc: "ISO 9001, 14001, 27001, 45001 and more — all in one place.", plan: "Starter" },
  { icon: Bell, title: "Smart automation", desc: "Reminders, task assignments and workflow approvals — automatic.", plan: "Starter" },
  { icon: BarChart3, title: "Real-time dashboards", desc: "KPI tracking and compliance status at a glance.", plan: "Growth" },
  { icon: Lock, title: "Role-based access", desc: "Each user sees only what they need — secure by default.", plan: "Starter" },
  { icon: ShieldCheck, title: "Full audit trail", desc: "Every action is logged automatically for traceability.", plan: "Starter" },
  { icon: Award, title: "Audit-ready evidence", desc: "All evidence stored and retrievable in one place at all times.", plan: "Starter" },
]

type Feature = {
  icon: any
  title: string
  desc: string
  capabilities: string[]
  isoLinks: string[]
  plan: "Starter" | "Growth" | "Enterprise"
}

const COMPLIANCE_FEATURES: Feature[] = [
  {
    icon: FileText,
    title: "Document Control",
    desc: "Manage policies, procedures and work instructions with version control, approval workflows and access rights.",
    capabilities: [
      "Pre-built ISO templates",
      "Version history and approvals",
      "Read-and-acknowledge workflows",
      "Automatic distribution control",
    ],
    isoLinks: ["ISO 9001 7.5", "All ISO standards"],
    plan: "Starter",
  },
  {
    icon: ClipboardCheck,
    title: "Audit Management",
    desc: "Schedule internal and external audits, assign auditors, record findings and close out actions.",
    capabilities: [
      "Annual audit calendar",
      "Findings & non-conformance logging",
      "Action assignment & follow-up",
      "Evidence pack export",
    ],
    isoLinks: ["ISO 9001 9.2", "All ISO standards"],
    plan: "Starter",
  },
  {
    icon: AlertTriangle,
    title: "Risk Register",
    desc: "Identify, assess (likelihood × impact) and mitigate all business risks. Full audit trail of risk decisions.",
    capabilities: [
      "Risk scoring matrix",
      "Treatment plans & owners",
      "Risk review reminders",
      "Risk vs opportunity tracking",
    ],
    isoLinks: ["ISO 9001 6.1", "ISO 14001 / 45001"],
    plan: "Starter",
  },
  {
    icon: Scale,
    title: "Legal Register",
    desc: "Maintain a live register of applicable legal and regulatory requirements with auto-alerts on changes.",
    capabilities: [
      "Industry-specific templates",
      "Compliance evaluation reviews",
      "Linked obligations & evidence",
      "Update history tracking",
    ],
    isoLinks: ["ISO 14001 / 45001 6.1.3"],
    plan: "Starter",
  },
  {
    icon: Target,
    title: "Objectives & Targets",
    desc: "Set measurable business and compliance goals, assign owners, track progress and link to KPIs.",
    capabilities: [
      "SMART goal creation",
      "Owner assignment & deadlines",
      "Progress tracking",
      "KPI dashboard linking",
    ],
    isoLinks: ["ISO 9001 6.2"],
    plan: "Starter",
  },
  {
    icon: TrendingUp,
    title: "Improvement Log (CAPA)",
    desc: "Record corrective actions, preventive actions and improvement ideas. Track from identification to closure.",
    capabilities: [
      "Root-cause analysis fields",
      "Action tracking & verification",
      "Effectiveness review",
      "Trends & analytics",
    ],
    isoLinks: ["ISO 9001 10"],
    plan: "Starter",
  },
]

const OPERATIONS_FEATURES: Feature[] = [
  {
    icon: Users,
    title: "Stakeholder Management",
    desc: "Identify and manage relationships with customers, suppliers, regulators and partners.",
    capabilities: ["Stakeholder needs", "Influence/interest matrix", "Engagement plans", "Linked risks & objectives"],
    isoLinks: ["ISO 9001 4.2"],
    plan: "Growth",
  },
  {
    icon: Briefcase,
    title: "Supplier Management",
    desc: "Evaluate and monitor supplier performance, compliance status and risk. Maintain approved supplier lists.",
    capabilities: ["Supplier scorecards", "Risk classification", "Re-evaluation cycles", "Document linking"],
    isoLinks: ["ISO 9001 8.4"],
    plan: "Growth",
  },
  {
    icon: GraduationCap,
    title: "Training Management",
    desc: "Assign ISO and role-specific training to employees. Track completion, store certificates and demonstrate competency.",
    capabilities: ["Role-based assignments", "Auto-reminders & escalations", "Certificate storage", "Skills matrix"],
    isoLinks: ["ISO 9001 7.2"],
    plan: "Growth",
  },
  {
    icon: Wrench,
    title: "Equipment Maintenance",
    desc: "Log all equipment requiring scheduled maintenance. Automated reminders prevent missed service dates.",
    capabilities: ["Maintenance calendar", "Service history per asset", "Calibration tracking", "Auto reminders"],
    isoLinks: ["ISO 9001 / 14001"],
    plan: "Growth",
  },
  {
    icon: Building2,
    title: "Business Environment (Context)",
    desc: "Document internal and external factors affecting your business. SWOT/PESTLE analysis linked to risks and objectives.",
    capabilities: ["Internal vs external issues", "SWOT/PESTLE templates", "Linked risks & objectives", "Annual reviews"],
    isoLinks: ["ISO 9001 4.1"],
    plan: "Growth",
  },
  {
    icon: Leaf,
    title: "Environmental Aspects",
    desc: "Log environmental impacts of operations. Track emissions, energy use and waste. Monitor sustainability targets.",
    capabilities: ["Aspect/impact assessment", "Significance scoring", "Energy & waste tracking", "Reduction targets"],
    isoLinks: ["ISO 14001"],
    plan: "Growth",
  },
  {
    icon: Boxes,
    title: "Asset Management",
    desc: "Track all company assets (hardware, equipment, vehicles). Log status, location, owner and maintenance history.",
    capabilities: ["Asset register", "Custodian assignment", "Status & lifecycle tracking", "QR/barcode ready"],
    isoLinks: ["ISO 9001 / 27001"],
    plan: "Growth",
  },
]

const ENTERPRISE_FEATURES: Feature[] = [
  {
    icon: Server,
    title: "IT Risk Management",
    desc: "Identify cybersecurity risks, manage information security controls, maintain a risk treatment plan.",
    capabilities: ["Threat & vulnerability log", "Annex A control mapping", "Treatment plans", "Residual risk view"],
    isoLinks: ["ISO 27001"],
    plan: "Enterprise",
  },
  {
    icon: ScrollText,
    title: "Statement of Applicability",
    desc: "Manage Annex A controls — applicability, status and justification — in one auditable record.",
    capabilities: ["Control inventory", "Applicability decisions", "Implementation status", "Audit-ready exports"],
    isoLinks: ["ISO 27001"],
    plan: "Enterprise",
  },
  {
    icon: AlertTriangle,
    title: "Obligations Register",
    desc: "Track commitments made to customers, regulators and stakeholders. Separate from legal for full clarity.",
    capabilities: ["Commitment categorisation", "Owner accountability", "Compliance status", "Evidence trails"],
    isoLinks: ["ISO 14001 6.1"],
    plan: "Enterprise",
  },
]

type Role = {
  icon: any
  name: string
  short: string
  capabilities: string[]
  color: string
}

const ROLES: Role[] = [
  {
    icon: UserCog,
    name: "System Administrator",
    short: "Highest authority — owns billing, users, modules and security.",
    capabilities: [
      "Create, edit and delete user accounts",
      "Assign roles and module permissions",
      "Enable/disable platform modules",
      "Configure MFA and security policies",
      "Manage subscription & billing",
      "Grant temporary auditor access",
    ],
    color: "from-purple-600 to-indigo-600",
  },
  {
    icon: UserCheck,
    name: "Compliance Manager",
    short: "Day-to-day compliance driver — owns audits, registers and reporting.",
    capabilities: [
      "Assign compliance tasks and track completion",
      "Schedule and conduct internal audits",
      "Review, approve and publish documents",
      "Manage Risk and Legal registers",
      "Monitor KPIs and management reports",
      "Log non-conformances and oversee CAPA",
    ],
    color: "from-blue-600 to-cyan-600",
  },
  {
    icon: Users,
    name: "Standard Employee",
    short: "Everyday user — sees only their assigned tasks, training and forms.",
    capabilities: [
      "Complete assigned compliance tasks",
      "Submit improvement suggestions",
      "Complete assigned training modules",
      "Access role-relevant documents",
      "Fill in forms, checklists and logs",
      "View personal performance history",
    ],
    color: "from-emerald-600 to-teal-600",
  },
  {
    icon: Eye,
    name: "External Auditor",
    short: "Third-party guest — read-only, time-limited access for certification audits.",
    capabilities: [
      "Browse documents and registers",
      "Review audit trail and CAPAs",
      "Access training and risk records",
      "Navigate all modules read-only",
      "Cannot create, edit or delete",
      "Access expires automatically",
    ],
    color: "from-orange-600 to-pink-600",
  },
]

function PlanBadge({ plan }: { plan: "Starter" | "Growth" | "Enterprise" }) {
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

function FeatureCard({ f }: { f: Feature }) {
  return (
    <div className="group rounded-3xl bg-white border border-gray-200 p-7 hover:border-purple-300 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
        >
          <f.icon className="h-5 w-5" />
        </div>
        <PlanBadge plan={f.plan} />
      </div>
      <h3 className="mt-5 text-lg font-black text-gray-900">{f.title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.desc}</p>

      <ul className="mt-5 space-y-2">
        {f.capabilities.map((c) => (
          <li key={c} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
            <span className="text-gray-700">{c}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-2">
        {f.isoLinks.map((iso) => (
          <span
            key={iso}
            className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700"
          >
            {iso}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#faf5ff 0%, #ffffff 100%)" }} />
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700 border border-purple-200">
            <Layers className="h-3.5 w-3.5" />
            Features
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-gray-900">
            Everything you need to certify and stay certified
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From document control to multi-standard ISO compliance — Business Smart Suite gives every team the modules,
            workflows and visibility they need to run a confident management system.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md hover:-translate-y-0.5 transition-all"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
            >
              See Pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/modules"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-purple-700 border border-purple-200 hover:border-purple-400"
            >
              Browse all modules
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">Platform highlights</h2>
          <p className="mt-2 text-base text-gray-600 max-w-2xl">
            What you get out of the box, on every plan.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLATFORM_CAPS.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-purple-200 hover:shadow-md transition-all"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
                >
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-black text-gray-900">{c.title}</h3>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" style={{ background: "linear-gradient(180deg,#ffffff 0%, #faf5ff 100%)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                Starter & up
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                Compliance core
              </h2>
              <p className="mt-2 text-base text-gray-600 max-w-2xl">
                The foundation for ISO 9001 — included in every plan.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMPLIANCE_FEATURES.map((f) => (
              <FeatureCard key={f.title} f={f} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700">
                Growth & up
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                Operations & people
              </h2>
              <p className="mt-2 text-base text-gray-600 max-w-2xl">
                Run multi-site, multi-team operations with confidence.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {OPERATIONS_FEATURES.map((f) => (
              <FeatureCard key={f.title} f={f} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" style={{ background: "linear-gradient(180deg,#ffffff 0%, #faf5ff 100%)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
                Enterprise only
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                Information security & continuity
              </h2>
              <p className="mt-2 text-base text-gray-600 max-w-2xl">
                Add ISO 27001, 27701 and 22301 with dedicated modules.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ENTERPRISE_FEATURES.map((f) => (
              <FeatureCard key={f.title} f={f} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700">
              Role-based access
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
              Built around real-world responsibilities
            </h2>
            <p className="mt-3 text-base text-gray-600 max-w-2xl mx-auto">
              Four built-in roles so every user sees exactly what they need — and nothing else.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ROLES.map((r) => (
              <div
                key={r.name}
                className="rounded-3xl border border-gray-200 bg-white p-7 hover:border-purple-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white bg-gradient-to-br ${r.color}`}>
                    <r.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500 font-semibold mt-0.5">{r.short}</div>
                  </div>
                </div>
                <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {r.capabilities.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                      <span className="text-gray-700">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" style={{ background: "linear-gradient(135deg,#3b0764 0%, #6b21a8 50%, #a855f7 100%)" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Try every feature free for 14 days
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
            No credit card required. See exactly how it works for your business before committing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-purple-700 shadow-lg hover:-translate-y-0.5 transition-all"
            >
              See Plans & Pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-bold text-white border border-white/20 hover:bg-white/15 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}

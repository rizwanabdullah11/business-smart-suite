import Link from "next/link"
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
  Award,
  Cloud,
  Clock,
  Layers,
  BarChart3,
  Lock,
  Bell,
  FileText,
  ClipboardCheck,
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
  AlertTriangle,
  Quote,
} from "lucide-react"
import { MarketingShell } from "@/components/marketing/MarketingShell"

const STEPS = [
  {
    n: "1",
    title: "Pick Your Perfect Fit",
    body: "Choose from our pre-built plans, packed with everything you need to hit the ground running. From small teams to growing businesses, pay monthly or annually — your pace.",
  },
  {
    n: "2",
    title: "Build with Confidence",
    body: "Follow our easy implementation guide to set up your system with zero hassle. Need help? We are just a phone call or email away — hands-on support whenever you need it.",
  },
  {
    n: "3",
    title: "Certify with Ease",
    body: "Give your external auditor secure read-only access. They can navigate your evidence in one place. Sit back and watch the certification process unfold, stress-free.",
  },
]

const HIGHLIGHTS = [
  { icon: Cloud, title: "Cloud-Based", desc: "Access from any browser or mobile — no installation required." },
  { icon: Clock, title: "Setup in 30 mins", desc: "Pre-built templates configure your system rapidly." },
  { icon: Layers, title: "Multi-Standard", desc: "ISO 9001, 14001, 27001, 45001 and more, simultaneously." },
  { icon: Bell, title: "Smart Automation", desc: "Reminders, task assignments and workflow approvals." },
  { icon: FileText, title: "Audit-Ready Evidence", desc: "All evidence stored and retrievable in one place." },
  { icon: Lock, title: "Role-Based Access", desc: "Each user sees only what they need — secure and efficient." },
  { icon: BarChart3, title: "Real-Time Dashboards", desc: "KPI tracking and compliance status at a glance." },
  { icon: ShieldCheck, title: "Full Audit Trail", desc: "Every action is logged automatically for traceability." },
]

const MODULES_PREVIEW = [
  { icon: Boxes, name: "Asset Register", desc: "Track your assets effortlessly and stay in control." },
  { icon: ClipboardCheck, name: "Audit Schedule", desc: "Never miss an audit with automated scheduling." },
  { icon: Users, name: "Stakeholders", desc: "Manage interested parties in one connected view." },
  { icon: Building2, name: "Organisational Context", desc: "Internal/external issues and SWOT in one place." },
  { icon: Target, name: "Objectives", desc: "Set goals, track progress, hit your targets every time." },
  { icon: Wrench, name: "Maintenance", desc: "Stay on top of equipment care with automated reminders." },
  { icon: TrendingUp, name: "Improvement Log", desc: "Capture and close out CAPAs and improvement ideas." },
  { icon: ScrollText, name: "Statement of Applicability", desc: "Easily manage controls and stay compliant." },
  { icon: AlertTriangle, name: "Legal Register", desc: "Keep legal obligations organised and within reach." },
  { icon: Briefcase, name: "Suppliers", desc: "Streamline supplier performance and compliance." },
  { icon: GraduationCap, name: "Training", desc: "Up-to-date competency with easy-to-use tools." },
  { icon: Server, name: "IT Risk Register", desc: "Track and mitigate IT risks to safeguard your business." },
  { icon: Leaf, name: "Aspects & Impacts", desc: "Monitor environmental aspects and sustainability goals." },
  { icon: Sparkles, name: "Customer Feedback", desc: "Capture feedback to boost performance and quality." },
]

const PLAN_TEASERS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Best for small teams getting started",
    price: "£120",
    cycle: "per month, billed annually",
    features: ["Templates", "Legal Register", "Task Manager", "Unlimited Users", "Unlimited Storage"],
    cta: "Get Started",
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Best for growing organisations",
    price: "£195",
    cycle: "per month, billed annually",
    features: ["Everything in Starter", "Advanced Customer Feedback", "Advanced Supplier Control", "7 hrs Consultancy"],
    cta: "Get Started",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Best for established organisations",
    price: "£300",
    cycle: "per month, billed annually",
    features: ["Everything in Growth", "Advanced Auditing", "Management Review", "14 hrs Consultancy"],
    cta: "Get Started",
    highlight: false,
  },
]

const TESTIMONIALS = [
  {
    quote:
      "We achieved ISO 9001 in under 4 months. Business Smart Suite replaced 12 spreadsheets with one place we actually trust.",
    name: "Sarah Mitchell",
    role: "Quality Manager · Northway Engineering",
  },
  {
    quote:
      "Our external auditor said it was the cleanest evidence pack he had seen in years. The platform basically runs the audit for us.",
    name: "Daniel Hughes",
    role: "Operations Director · Atlas Build Group",
  },
  {
    quote:
      "Setup took 30 minutes. We were running our risk register and training the same day. Brilliant onboarding.",
    name: "Priya Naidu",
    role: "Compliance Officer · Lightway Logistics",
  },
]

export const metadata = {
  title: "Business Smart Suite — Simplify ISO Compliance",
  description:
    "Cloud-based ISO compliance and quality management. Documents, audits, risks, training, suppliers — all in one place.",
}

export default function WelcomePage() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #faf5ff 0%, #ffffff 40%, #f3e8ff 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.18),transparent_55%)]" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle_at_70%_80%,rgba(124,58,237,0.18),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700">
                <Sparkles className="h-3.5 w-3.5" />
                Integrated Compliance Platform
              </div>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-[1.05]">
                Simplify Compliance with{" "}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  Business Smart Suite
                </span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                Boost efficiency with our online management system. Centralise documents, audits, risks, training,
                suppliers, and the legal register — built for ISO 9001, 14001, 27001 and 45001.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                    boxShadow: "0 12px 30px -10px rgba(168,85,247,0.6)",
                  }}
                >
                  Book a Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-gray-800 bg-white border border-gray-200 transition-all hover:border-purple-300 hover:text-purple-700"
                >
                  See Features
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { v: "15+", l: "Modules" },
                  { v: "6", l: "ISO Standards" },
                  { v: "30 min", l: "Setup" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-white/80 p-3 border border-purple-100">
                    <div className="text-xl font-black text-purple-700">{s.v}</div>
                    <div className="text-xs font-semibold text-gray-600">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div
                className="rounded-3xl p-1 shadow-2xl"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)" }}
              >
                <div className="rounded-[22px] bg-white p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-purple-700">Compliance Status</div>
                      <div className="mt-1 text-2xl font-black text-gray-900">Audit-Ready</div>
                    </div>
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                      style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)" }}
                    >
                      <Check className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      { l: "Documents", v: "248", c: "from-blue-500 to-cyan-500" },
                      { l: "Open CAPAs", v: "3", c: "from-orange-500 to-pink-500" },
                      { l: "Audits Due", v: "12", c: "from-purple-500 to-indigo-500" },
                      { l: "Training", v: "96%", c: "from-emerald-500 to-teal-500" },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl border border-gray-100 p-3.5">
                        <div className={`mb-2 inline-flex h-7 w-7 rounded-lg bg-gradient-to-br ${s.c}`}></div>
                        <div className="text-2xl font-black text-gray-900 leading-none">{s.v}</div>
                        <div className="mt-0.5 text-xs font-semibold text-gray-500">{s.l}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl bg-purple-50 px-4 py-3 flex items-center gap-3">
                    <Award className="h-5 w-5 text-purple-700" />
                    <div className="text-xs font-semibold text-purple-900">
                      ISO 9001 + 14001 + 27001 — All certified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700">
              How it works
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
              Your compliance journey, simplified in three easy steps
            </h2>
            <p className="mt-3 text-base text-gray-600 max-w-2xl mx-auto">
              From plan selection to certification — Business Smart Suite guides you the whole way.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, idx) => (
              <div
                key={s.n}
                className="relative rounded-2xl bg-white border border-gray-200 p-7 shadow-sm hover:shadow-lg transition-all"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-xl font-black shadow-md"
                  style={{
                    background:
                      idx === 0
                        ? "linear-gradient(135deg,#a855f7,#7c3aed)"
                        : idx === 1
                          ? "linear-gradient(135deg,#7c3aed,#6366f1)"
                          : "linear-gradient(135deg,#6366f1,#3b82f6)",
                  }}
                >
                  {s.n}
                </div>
                <h3 className="mt-5 text-xl font-black text-gray-900">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" style={{ background: "linear-gradient(180deg,#faf5ff 0%, #ffffff 100%)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">Why teams pick BSS</h2>
            <p className="mt-3 text-base text-gray-600 max-w-2xl mx-auto">
              Eight platform highlights you get from day one — no add-ons, no hidden costs.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="rounded-2xl bg-white border border-gray-200 p-6 hover:border-purple-200 hover:shadow-md transition-all">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
                >
                  <h.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-black text-gray-900">{h.title}</h3>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700">
                Modules
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                Powerful modules built for ISO success
              </h2>
              <p className="mt-2 text-base text-gray-600 max-w-2xl">
                Activate the modules you need from your plan and grow as you scale.
              </p>
            </div>
            <Link
              href="/modules"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100"
            >
              View all modules
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {MODULES_PREVIEW.map((m) => (
              <div
                key={m.name}
                className="rounded-2xl border border-gray-200 p-4 text-center hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div
                  className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
                >
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-xs font-bold text-gray-900 leading-tight">{m.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" style={{ background: "linear-gradient(180deg,#ffffff 0%, #faf5ff 100%)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700">
              Pricing
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
              Find the perfect plan for your business
            </h2>
            <p className="mt-3 text-base text-gray-600 max-w-2xl mx-auto">
              Whether aiming for ISO 9001, 14001, 27001 or 45001 — there is a plan that fits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLAN_TEASERS.map((p) => (
              <div
                key={p.id}
                id={p.id}
                className={`relative rounded-3xl p-7 transition-all ${
                  p.highlight
                    ? "bg-gradient-to-br from-[#1a0b2e] to-[#3b0764] text-white shadow-2xl scale-[1.02]"
                    : "bg-white border border-gray-200 hover:shadow-lg"
                }`}
              >
                {p.highlight ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-purple-700 shadow-md">
                    Most Popular
                  </div>
                ) : null}
                <h3 className={`text-2xl font-black ${p.highlight ? "text-white" : "text-gray-900"}`}>{p.name}</h3>
                <p className={`mt-1 text-sm ${p.highlight ? "text-white/70" : "text-gray-600"}`}>{p.tagline}</p>
                <div className={`mt-5 flex items-baseline gap-2 ${p.highlight ? "text-white" : "text-gray-900"}`}>
                  <span className="text-4xl font-black">{p.price}</span>
                </div>
                <div className={`text-xs ${p.highlight ? "text-white/60" : "text-gray-500"}`}>{p.cycle}</div>

                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlight ? "text-purple-300" : "text-purple-600"}`}
                      />
                      <span className={p.highlight ? "text-white/85" : "text-gray-700"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/pricing"
                  className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    p.highlight
                      ? "bg-white text-purple-700 hover:bg-gray-100"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {p.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/pricing"
              className="text-sm font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
            >
              Compare full feature list
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section id="stories" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
              Transformations with Business Smart Suite
            </h2>
            <p className="mt-3 text-base text-gray-600 max-w-2xl mx-auto">
              Hear directly from organisations that have changed how they manage compliance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-3xl bg-gradient-to-br from-purple-50 to-white p-7 border border-purple-100">
                <Quote className="h-7 w-7 text-purple-600" />
                <p className="mt-4 text-sm text-gray-800 leading-relaxed">"{t.quote}"</p>
                <div className="mt-5 pt-5 border-t border-purple-100">
                  <div className="text-sm font-black text-gray-900">{t.name}</div>
                  <div className="text-xs text-purple-700 font-semibold">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24" style={{ background: "linear-gradient(135deg,#3b0764 0%, #6b21a8 50%, #a855f7 100%)" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Ready to transform your compliance?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Compliance does not have to be complicated. Get started today and let us save you time, money and stress.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-purple-700 shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Book a Demo
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

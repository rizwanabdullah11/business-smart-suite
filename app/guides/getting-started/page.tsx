import Link from "next/link"
import { COLORS } from "@/constant/colors"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: COLORS.textPrimary }}>
      {children}
    </h2>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 sm:p-6" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
      {children}
    </div>
  )
}

export default function GettingStartedOverviewPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #f7f8fb 0%, #f3f5f9 100%)" }}>
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: COLORS.purple50, color: COLORS.purple700, border: `1px solid ${COLORS.purple200}` }}
          >
            Guide
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight" style={{ color: COLORS.textPrimary }}>
            Getting Started & Platform Overview
          </h1>
          <p className="mt-2 text-sm sm:text-base" style={{ color: COLORS.textSecondary }}>
            From first login to audit-ready — a practical onboarding reference.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/guides/iso-standards" className="ui-btn ui-btn-outline">
              View ISO Standards
            </Link>
            <Link href="/dashboard" className="ui-btn ui-btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <Card>
            <SectionTitle>1) What is Business Smart Suite?</SectionTitle>
            <p className="mt-3 text-sm sm:text-base" style={{ color: COLORS.textSecondary }}>
              Business Smart Suite (BSS) is a cloud-based, integrated compliance and quality management platform designed
              to help organisations achieve and maintain ISO certification — without spreadsheets or disconnected tools.
            </p>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm" style={{ color: COLORS.textSecondary }}>
              {[
                "Documents and version control",
                "Internal and external audits",
                "Risk and legal registers",
                "Training and competency records",
                "Supplier and equipment management",
                "KPI dashboards and management reports",
              ].map((t) => (
                <li
                  key={t}
                  className="rounded-xl px-3 py-2"
                  style={{ background: COLORS.bgGrayLight, border: `1px solid ${COLORS.border}` }}
                >
                  {t}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionTitle>2) Core mission</SectionTitle>
            <div className="mt-3 rounded-2xl p-4" style={{ background: COLORS.purple50, border: `1px solid ${COLORS.purple200}` }}>
              <p className="text-sm sm:text-base font-medium" style={{ color: COLORS.purple800 }}>
                To eliminate the pain of manual compliance management by replacing spreadsheets, shared drives, and
                disconnected processes with smart automation, real-time dashboards, and a structured audit trail that
                makes certification stress-free.
              </p>
            </div>
          </Card>

          <Card>
            <SectionTitle>3) Platform highlights</SectionTitle>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead>
                  <tr style={{ color: COLORS.purple700 }}>
                    <th className="px-3 py-2 font-bold">Feature</th>
                    <th className="px-3 py-2 font-bold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Cloud-Based", "Access from any browser or mobile — no installation required"],
                    ["Setup in 30 mins", "Pre-built templates let you configure your system rapidly"],
                    ["Multi-Standard", "Supports ISO 9001, 14001, 27001, 45001 and more simultaneously"],
                    ["Smart automation", "Reminders, task assignments, workflow approvals"],
                    ["Audit-ready evidence", "All evidence stored and retrievable in one place"],
                    ["Role-based access", "Each user sees only what they need — secure and efficient"],
                    ["Real-time dashboards", "KPI tracking and compliance status at a glance"],
                    ["Full audit trail", "Every action is logged automatically for traceability"],
                  ].map(([feature, desc]) => (
                    <tr key={feature} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                      <td className="px-3 py-2 font-semibold" style={{ color: COLORS.textPrimary }}>
                        {feature}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <SectionTitle>4) Getting started — 5-phase setup</SectionTitle>
            <p className="mt-2 text-sm sm:text-base" style={{ color: COLORS.textSecondary }}>
              The onboarding process is structured into five phases to take any organisation from zero to audit-ready.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3">
              {[
                {
                  title: "Phase 1 — Sign Up & Setup",
                  who: "System Administrator",
                  time: "~30 minutes",
                  steps: [
                    "Choose plan and register organisation",
                    "Complete onboarding wizard (business, industry, ISO targets)",
                    "Activate modules from Admin Dashboard",
                    "Customize branding (logo, colors)",
                  ],
                },
                {
                  title: "Phase 2 — Build Your System",
                  who: "Compliance Manager",
                  time: "1–3 days",
                  steps: [
                    "Generate manual/policies/procedures from templates",
                    "Populate Legal Register",
                    "Set up Risk Register",
                    "Configure Business Environment (Context)",
                  ],
                },
                {
                  title: "Phase 3 — Add Your Team",
                  who: "System Administrator",
                  time: "1–2 hours",
                  steps: [
                    "Create user accounts",
                    "Assign roles (Compliance Manager vs Employee)",
                    "Set module-level permissions",
                    "Enable MFA for key accounts",
                  ],
                },
                {
                  title: "Phase 4 — Run Compliance",
                  who: "Compliance Manager (+ employees)",
                  time: "Ongoing",
                  steps: [
                    "Assign training and deadlines",
                    "Schedule first internal audit",
                    "Assign maintenance schedules",
                    "Set objectives and KPI targets",
                  ],
                },
                {
                  title: "Phase 5 — Achieve Certification",
                  who: "Compliance Manager + System Administrator + External Auditor",
                  time: "1–2 days (audit)",
                  steps: [
                    "Conduct internal audit and close non-conformances",
                    "Run Management Review and document outputs",
                    "Invite external auditor (read-only guest)",
                    "Navigate evidence and complete certification audit",
                    "Receive ISO certificate; renew annually with the same workflow",
                  ],
                },
              ].map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl p-4 sm:p-5"
                  style={{ background: COLORS.bgGrayLight, border: `1px solid ${COLORS.border}` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                    <div className="text-base sm:text-lg font-bold" style={{ color: COLORS.textPrimary }}>
                      {p.title}
                    </div>
                    <div className="text-xs sm:text-sm" style={{ color: COLORS.textSecondary }}>
                      <span className="font-semibold">{p.who}</span> · {p.time}
                    </div>
                  </div>
                  <ul className="mt-3 list-disc pl-5 text-sm" style={{ color: COLORS.textSecondary }}>
                    {p.steps.map((s) => (
                      <li key={s} className="py-0.5">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>5) Dashboard guide (by role)</SectionTitle>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  ["System Administrator", ["Activity feed", "User management", "Module activation", "Security & MFA", "Billing overview"]],
                  ["Compliance Manager", ["Task completion", "Open CAPAs", "Upcoming audits", "KPI progress", "Training status", "Supplier status"]],
                  ["Standard Employee", ["My tasks", "My training", "My forms", "My documents", "Improvement log"]],
                  ["External Auditor", ["Read-only evidence navigation", "Document register", "Audit trail", "Risk & legal registers", "Training records"]],
                ] as [string, string[]][]
              ).map(([role, items]) => (
                <div key={role} className="rounded-2xl p-4" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
                  <div className="text-sm font-bold" style={{ color: COLORS.purple700 }}>
                    {role}
                  </div>
                  <ul className="mt-2 list-disc pl-5 text-sm" style={{ color: COLORS.textSecondary }}>
                    {items.map((i) => (
                      <li key={i} className="py-0.5">
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>6) Annual compliance cycle</SectionTitle>
            <div className="mt-3 rounded-2xl p-4 font-mono text-xs sm:text-sm whitespace-pre-wrap" style={{ background: "#111827", color: "#e5e7eb" }}>
{`Jan–Mar    Set annual objectives and KPI targets
           → Objectives & Targets module

Ongoing    Manage risks, documents, training, suppliers
           → All active modules

Mid-Year   Conduct internal audit (Cycle 1)
           → Audit Management module

Ongoing    Close non-conformances, log improvements
           → Improvement Log (CAPA)

Q3–Q4      Conduct internal audit (Cycle 2)
           → Audit Management module

Q4         Run Management Review
           → Reports and Dashboards

Annual     Invite external auditor for surveillance/recertification
           → External Auditor Portal (Enterprise)
           → Renew ISO certificate`}
            </div>
          </Card>

          <Card>
            <SectionTitle>Support resources</SectionTitle>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[560px] w-full text-left text-sm">
                <thead>
                  <tr style={{ color: COLORS.purple700 }}>
                    <th className="px-3 py-2 font-bold">Plan</th>
                    <th className="px-3 py-2 font-bold">Support</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Starter", "Email support + Implementation Guide"],
                    ["Growth", "Email + Phone support + Onboarding assistance"],
                    ["Enterprise", "Priority phone + Email + Dedicated account manager"],
                  ].map(([p, s]) => (
                    <tr key={p} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                      <td className="px-3 py-2 font-semibold" style={{ color: COLORS.textPrimary }}>
                        {p}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {s}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm" style={{ color: COLORS.textSecondary }}>
              Knowledge base:{" "}
              <span className="font-semibold" style={{ color: COLORS.textPrimary }}>
                knowledge.businesssmartsuite.com
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


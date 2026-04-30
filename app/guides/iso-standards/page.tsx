import Link from "next/link"
import { COLORS } from "@/constant/colors"

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 sm:p-6" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
      {children}
    </div>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: COLORS.textPrimary }}>
      {children}
    </h2>
  )
}

export default function IsoStandardsPage() {
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
            ISO Standards Supported
          </h1>
          <p className="mt-2 text-sm sm:text-base" style={{ color: COLORS.textSecondary }}>
            Business Smart Suite supports major ISO standards with module-driven workflows and evidence capture.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/guides/getting-started"
              className="rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ background: COLORS.bgWhite, color: COLORS.purple700, border: `1px solid ${COLORS.purple200}` }}
            >
              Getting started
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ background: "#111827", color: COLORS.textWhite, border: "1px solid #111827" }}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <Card>
            <H2>Standards overview</H2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[860px] w-full text-left text-sm">
                <thead>
                  <tr style={{ color: COLORS.purple700 }}>
                    <th className="px-3 py-2 font-bold">Standard</th>
                    <th className="px-3 py-2 font-bold">Name</th>
                    <th className="px-3 py-2 font-bold">Purpose</th>
                    <th className="px-3 py-2 font-bold">Plan required</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["ISO 9001:2015", "Quality Management System", "Quality, customer satisfaction, continual improvement", "Starter+"],
                    ["ISO 14001:2015", "Environmental Management System", "Environmental impact, sustainability, legal compliance", "Growth+"],
                    ["ISO 45001:2018", "Occupational Health & Safety", "Worker safety, injury and illness prevention", "Growth+"],
                    ["ISO 27001:2022", "Information Security Management", "Cybersecurity, data protection, information risk", "Enterprise"],
                    ["ISO 27701:2019", "Privacy Information Management", "GDPR and privacy compliance", "Enterprise"],
                    ["ISO 22301:2019", "Business Continuity Management", "Operations continuity during disruptive incidents", "Enterprise"],
                  ].map(([std, name, purpose, plan]) => (
                    <tr key={std} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                      <td className="px-3 py-2 font-semibold" style={{ color: COLORS.textPrimary }}>
                        {std}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {name}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {purpose}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {plan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <H2>ISO 9001:2015 — Quality management</H2>
            <p className="mt-2 text-sm sm:text-base" style={{ color: COLORS.textSecondary }}>
              The most recognised quality standard. Ensures consistent products/services, improves customer satisfaction,
              and drives continual improvement.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead>
                  <tr style={{ color: COLORS.purple700 }}>
                    <th className="px-3 py-2 font-bold">Clause</th>
                    <th className="px-3 py-2 font-bold">Requirement</th>
                    <th className="px-3 py-2 font-bold">BSS module</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["4.1", "Context of the organisation", "Business Environment"],
                    ["4.2", "Interested parties", "Stakeholder Management"],
                    ["6.1", "Risks and opportunities", "Risk Register"],
                    ["6.2", "Quality objectives", "Objectives & Targets"],
                    ["7.2", "Competence", "Training Management"],
                    ["7.5", "Documented information", "Document Control"],
                    ["8.4", "Externally provided processes", "Supplier Management"],
                    ["9.2", "Internal audit", "Audit Management"],
                    ["10.2", "Corrective action", "Improvement Log (CAPA)"],
                  ].map(([c, r, m]) => (
                    <tr key={c} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                      <td className="px-3 py-2 font-semibold" style={{ color: COLORS.textPrimary }}>
                        {c}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {r}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {m}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <H2>ISO 14001:2015 — Environmental management</H2>
            <p className="mt-2 text-sm sm:text-base" style={{ color: COLORS.textSecondary }}>
              Reduce environmental impact, comply with legislation, and meet sustainability goals.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead>
                  <tr style={{ color: COLORS.purple700 }}>
                    <th className="px-3 py-2 font-bold">Clause</th>
                    <th className="px-3 py-2 font-bold">Requirement</th>
                    <th className="px-3 py-2 font-bold">BSS module</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["6.1.2", "Environmental aspects", "Environmental Aspects"],
                    ["6.1.3", "Compliance obligations", "Legal Register / Obligations Register"],
                    ["6.2", "Environmental objectives", "Objectives & Targets"],
                    ["7.5", "Documented information", "Document Control"],
                    ["9.2", "Internal audit", "Audit Management"],
                  ].map(([c, r, m]) => (
                    <tr key={c} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                      <td className="px-3 py-2 font-semibold" style={{ color: COLORS.textPrimary }}>
                        {c}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {r}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {m}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <H2>ISO 45001:2018 — Occupational health & safety</H2>
            <p className="mt-2 text-sm sm:text-base" style={{ color: COLORS.textSecondary }}>
              Protect workers and reduce workplace injuries/illnesses while demonstrating duty of care.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead>
                  <tr style={{ color: COLORS.purple700 }}>
                    <th className="px-3 py-2 font-bold">Clause</th>
                    <th className="px-3 py-2 font-bold">Requirement</th>
                    <th className="px-3 py-2 font-bold">BSS module</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["6.1", "Risks and opportunities", "Risk Register"],
                    ["6.1.3", "Legal requirements", "Legal Register"],
                    ["7.2", "Competence", "Training Management"],
                    ["7.5", "Documented information", "Document Control"],
                    ["9.2", "Internal audit", "Audit Management"],
                    ["10.2", "Corrective action", "Improvement Log (CAPA)"],
                  ].map(([c, r, m]) => (
                    <tr key={c} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                      <td className="px-3 py-2 font-semibold" style={{ color: COLORS.textPrimary }}>
                        {c}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {r}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {m}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <H2>Enterprise standards: ISO 27001, 27701, 22301</H2>
            <p className="mt-2 text-sm sm:text-base" style={{ color: COLORS.textSecondary }}>
              Enterprise plan unlocks information security, privacy management, and business continuity support.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                [
                  "ISO 27001:2022",
                  ["IT Risk Management", "Asset Management", "Training Management", "Document Control", "Audit Management", "Legal Register"],
                ],
                ["ISO 27701:2019", ["IT Risk Management", "Legal Register", "Obligations Register", "Document Control"]],
                ["ISO 22301:2019", ["Risk Register", "Audit Management", "Document Control", "Objectives & Targets", "Improvement Log (CAPA)"]],
              ].map(([std, mods]) => (
                <div key={std} className="rounded-2xl p-4" style={{ background: COLORS.bgGrayLight, border: `1px solid ${COLORS.border}` }}>
                  <div className="text-sm font-bold" style={{ color: COLORS.purple700 }}>
                    {std}
                  </div>
                  <ul className="mt-2 list-disc pl-5 text-sm" style={{ color: COLORS.textSecondary }}>
                    {(mods as string[]).map((m) => (
                      <li key={m} className="py-0.5">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <H2>Standards available by plan</H2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[640px] w-full text-left text-sm">
                <thead>
                  <tr style={{ color: COLORS.purple700 }}>
                    <th className="px-3 py-2 font-bold">Standard</th>
                    <th className="px-3 py-2 font-bold">Starter</th>
                    <th className="px-3 py-2 font-bold">Growth</th>
                    <th className="px-3 py-2 font-bold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["ISO 9001", "✅", "✅", "✅"],
                    ["ISO 14001", "❌", "✅", "✅"],
                    ["ISO 45001", "❌", "✅", "✅"],
                    ["ISO 27001", "❌", "❌", "✅"],
                    ["ISO 27701", "❌", "❌", "✅"],
                    ["ISO 22301", "❌", "❌", "✅"],
                  ].map(([s, a, b, c]) => (
                    <tr key={s} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                      <td className="px-3 py-2 font-semibold" style={{ color: COLORS.textPrimary }}>
                        {s}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {a}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {b}
                      </td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>
                        {c}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


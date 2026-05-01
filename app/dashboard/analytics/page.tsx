import { DashboardContent } from "@/components/dashboard/DashboardContent"

export default function AnalyticsDashboardPage() {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.35),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_80%,rgba(59,130,246,0.22),transparent_55%)]" />

      <div className="relative z-10 px-6 pt-10 pb-14">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/95 p-5 shadow-2xl backdrop-blur-sm sm:p-7">
            <DashboardContent />
          </div>
        </div>
      </div>
    </div>
  )
}

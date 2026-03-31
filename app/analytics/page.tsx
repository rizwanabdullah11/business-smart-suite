import { redirect } from "next/navigation"

/** Legacy URL — full analytics dashboard lives at /dashboard/analytics */
export default function AnalyticsLegacyRedirect() {
  redirect("/dashboard/analytics")
}

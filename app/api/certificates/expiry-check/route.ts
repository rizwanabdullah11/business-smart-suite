import { NextRequest, NextResponse } from "next/server"
import { notifyExpiredCertificates } from "@/lib/server/certificate-expiry-notifier"

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true

  const bearer = request.headers.get("authorization")?.replace("Bearer ", "")
  const querySecret = new URL(request.url).searchParams.get("secret")
  return bearer === secret || querySecret === secret
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await notifyExpiredCertificates(true)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to process certificate expiry check: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}

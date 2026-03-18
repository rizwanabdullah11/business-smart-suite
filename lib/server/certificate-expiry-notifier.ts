import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/server/db"
import { getModuleModel } from "@/lib/server/models/module-item"
import User from "@/lib/server/models/User"
import { normalizeRole, ROLE } from "@/lib/server/utils/roles"
import { sendEmail } from "@/lib/server/email"

const FIVE_MINUTES = 5 * 60 * 1000

let lastExpiryScanAt = 0

function parseDate(input: unknown): Date | null {
  if (!input) return null
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input
  if (typeof input === "string") {
    const parsed = new Date(input)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

function isExpired(date: Date) {
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return date.getTime() <= todayStart.getTime()
}

async function resolveRecipientEmails(createdByValue: unknown) {
  const emails = new Set<string>()
  if (!createdByValue) return []

  const createdBy = String(createdByValue)
  if (!mongoose.Types.ObjectId.isValid(createdBy)) return []

  const creator = await User.findById(createdBy)
    .select("email role organizationId organizationEmail isActive")
    .lean()
  if (!creator) return []

  if (creator.email) emails.add(String(creator.email).toLowerCase())
  if (creator.organizationEmail) emails.add(String(creator.organizationEmail).toLowerCase())

  const normalizedRole = normalizeRole(String(creator.role || ""))

  if (creator.organizationId && mongoose.Types.ObjectId.isValid(String(creator.organizationId))) {
    const orgUser = await User.findById(String(creator.organizationId)).select("email").lean()
    if (orgUser?.email) emails.add(String(orgUser.email).toLowerCase())
  }

  if (normalizedRole === ROLE.ORGANIZATION && creator._id) {
    const employees = await User.find({
      organizationId: creator._id,
      isActive: true,
    })
      .select("email")
      .lean()

    for (const employee of employees) {
      if (employee?.email) emails.add(String(employee.email).toLowerCase())
    }
  }

  return Array.from(emails)
}

function buildEmailBody(certificateTitle: string, expiryDate: string) {
  const safeTitle = certificateTitle || "Certificate"
  return {
    subject: `Certificate Expired: ${safeTitle}`,
    text: `The certificate "${safeTitle}" expired on ${expiryDate}. Please review and renew it.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 12px;">Certificate Expiry Alert</h2>
        <p>The certificate <strong>${safeTitle}</strong> has expired.</p>
        <p><strong>Expiry Date:</strong> ${expiryDate}</p>
        <p>Please review the certificate and upload a renewed document in Business Smart Suite.</p>
      </div>
    `,
  }
}

export async function notifyExpiredCertificates(force = false) {
  const now = Date.now()
  if (!force && now - lastExpiryScanAt < FIVE_MINUTES) {
    return { scanned: 0, notified: 0, skipped: "throttled" as const }
  }
  lastExpiryScanAt = now

  await connectToDatabase()
  const CertificateModel = getModuleModel("certificates")

  const candidates = await CertificateModel.find({
    expiryDate: { $exists: true, $ne: null },
    $or: [
      { expiryNotificationSentAt: { $exists: false } },
      { expiryNotificationSentAt: null },
    ],
  })
    .select("_id title expiryDate createdBy")
    .lean()

  let notified = 0
  let scanned = 0

  for (const cert of candidates as Array<Record<string, unknown>>) {
    scanned += 1
    const expiry = parseDate(cert.expiryDate)
    if (!expiry || !isExpired(expiry)) continue

    const recipients = await resolveRecipientEmails(cert.createdBy)
    if (!recipients.length) continue

    const formattedExpiry = expiry.toISOString().split("T")[0]
    const content = buildEmailBody(String(cert.title || "Certificate"), formattedExpiry)
    const mailResult = await sendEmail({
      to: recipients,
      subject: content.subject,
      text: content.text,
      html: content.html,
    })

    if (!mailResult.sent) {
      if (mailResult.reason === "MAIL_NOT_CONFIGURED") {
        break
      }
      continue
    }

    await CertificateModel.findByIdAndUpdate(String(cert._id), {
      $set: {
        expiryNotificationSentAt: new Date(),
        expiryNotificationRecipients: mailResult.recipients,
      },
    })
    notified += 1
  }

  return { scanned, notified, skipped: null as null }
}

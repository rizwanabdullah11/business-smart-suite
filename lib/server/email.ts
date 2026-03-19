const nodemailer = require("nodemailer")

type MailPayload = {
  to: string[]
  subject: string
  html: string
  text?: string
}

function parsePort(value?: string) {
  if (!value) return 587
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : 587
}

function getMailConfig() {
  const host = process.env.SMTP_HOST
  const port = parsePort(process.env.SMTP_PORT)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.MAIL_FROM || user

  if (!host || !user || !pass || !from) {
    return null
  }

  return {
    host,
    port,
    user,
    pass,
    from,
    secure: port === 465,
  }
}

export async function sendEmail(payload: MailPayload) {
  const config = getMailConfig()
  if (!config) {
    return { sent: false as const, reason: "MAIL_NOT_CONFIGURED" as const }
  }

  const recipients = Array.from(new Set(payload.to.map(email => email.trim().toLowerCase()).filter(Boolean)))
  if (!recipients.length) {
    return { sent: false as const, reason: "NO_RECIPIENTS" as const }
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })

  await transporter.sendMail({
    from: config.from,
    bcc: recipients,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  })

  return { sent: true as const, recipients }
}

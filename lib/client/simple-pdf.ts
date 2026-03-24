"use client"

type PdfSection = {
  heading: string
  lines: string[]
}

type DownloadSimplePdfArgs = {
  filename: string
  title: string
  subtitle?: string
  sections: PdfSection[]
}

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const LEFT_MARGIN = 48
const TOP_MARGIN = 750
const BOTTOM_MARGIN = 48
const BODY_FONT_SIZE = 11
const TITLE_FONT_SIZE = 20
const HEADING_FONT_SIZE = 14
const LINE_HEIGHT = 16
const MAX_CHARS_PER_LINE = 92

function escapePdfText(input: string) {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?")
}

function wrapText(input: string, maxChars = MAX_CHARS_PER_LINE) {
  const text = input.trim()
  if (!text) return [""]

  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars) {
      current = candidate
      continue
    }
    if (current) lines.push(current)
    if (word.length <= maxChars) {
      current = word
      continue
    }
    let remaining = word
    while (remaining.length > maxChars) {
      lines.push(remaining.slice(0, maxChars))
      remaining = remaining.slice(maxChars)
    }
    current = remaining
  }

  if (current) lines.push(current)
  return lines
}

function buildContentCommands(title: string, subtitle: string | undefined, sections: PdfSection[]) {
  const pages: string[][] = [[]]
  let currentPage = pages[0]
  let y = TOP_MARGIN

  const ensureSpace = (requiredHeight: number) => {
    if (y - requiredHeight >= BOTTOM_MARGIN) return
    currentPage = []
    pages.push(currentPage)
    y = TOP_MARGIN
  }

  const pushText = (text: string, x: number, fontSize: number) => {
    currentPage.push(`BT /F1 ${fontSize} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`)
    y -= fontSize === TITLE_FONT_SIZE ? 28 : LINE_HEIGHT
  }

  ensureSpace(40)
  pushText(title, LEFT_MARGIN, TITLE_FONT_SIZE)
  if (subtitle) {
    ensureSpace(LINE_HEIGHT)
    pushText(subtitle, LEFT_MARGIN, BODY_FONT_SIZE)
    y -= 4
  }

  for (const section of sections) {
    ensureSpace(28)
    y -= 6
    pushText(section.heading, LEFT_MARGIN, HEADING_FONT_SIZE)
    const lines = section.lines.length > 0 ? section.lines : ["No data available."]
    for (const line of lines) {
      const wrapped = wrapText(line)
      ensureSpace(wrapped.length * LINE_HEIGHT + 4)
      for (const chunk of wrapped) {
        pushText(chunk, LEFT_MARGIN + 8, BODY_FONT_SIZE)
      }
    }
    y -= 4
  }

  return pages
}

function buildPdfDocument(title: string, subtitle: string | undefined, sections: PdfSection[]) {
  const pageCommands = buildContentCommands(title, subtitle, sections)
  const objects: string[] = []

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>"
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"

  const pageObjectIds: number[] = []
  let nextObjectId = 5

  for (const commands of pageCommands) {
    const pageId = nextObjectId++
    const contentId = nextObjectId++
    pageObjectIds.push(pageId)
    const stream = commands.join("\n")
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 4 0 R >> >> /Contents ${contentId} 0 R >>`
  }

  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = []

  for (let i = 1; i < objects.length; i += 1) {
    if (!objects[i]) continue
    offsets[i] = pdf.length
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`
  }

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length}\n`
  pdf += "0000000000 65535 f \n"
  for (let i = 1; i < objects.length; i += 1) {
    const offset = offsets[i] || 0
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return pdf
}

export function downloadSimplePdf({ filename, title, subtitle, sections }: DownloadSimplePdfArgs) {
  const pdf = buildPdfDocument(title, subtitle, sections)
  const blob = new Blob([pdf], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

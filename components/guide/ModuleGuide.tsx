"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { BookOpen, CheckCircle2, HelpCircle, Lightbulb, Sparkles, X } from "lucide-react"
import { COMMON_ACTIONS, ITEM_PAGE_GUIDE, getGuideForPath } from "@/lib/module-guides"

const SEEN_KEY_PREFIX = "bss-guide-seen:"

function hasSeen(key: string) {
  try {
    return localStorage.getItem(SEEN_KEY_PREFIX + key) === "1"
  } catch {
    return true // storage blocked → never auto-open
  }
}

function markSeen(key: string) {
  try {
    localStorage.setItem(SEEN_KEY_PREFIX + key, "1")
  } catch {
    /* ignore */
  }
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  )
}

/**
 * Floating "How to use" button + slide-in guide for the current module.
 * Rendered once in AppLayout; picks the guide from the URL.
 * Opens automatically the first time a user visits each module.
 */
export function ModuleGuide() {
  const pathname = usePathname()
  const match = getGuideForPath(pathname)
  const [open, setOpen] = useState(false)

  const guideKey = match?.key

  const close = () => {
    if (guideKey) markSeen(guideKey)
    setOpen(false)
  }

  useEffect(() => {
    setOpen(false)
    if (!guideKey) return
    if (!hasSeen(guideKey)) {
      const timer = setTimeout(() => setOpen(true), 600)
      return () => clearTimeout(timer)
    }
  }, [guideKey])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!match) return null
  const { guide, isItemPage, key } = match
  const isModule = key !== "dashboard" && key !== "business-profile"

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-700"
        aria-label={`How to use ${guide.title}`}
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">How to use</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`${guide.title} guide`}>
          <div className="absolute inset-0 bg-slate-900/40" onClick={close} />
          <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">How to use</p>
                <h2 className="text-xl font-bold text-slate-900">{guide.title}</h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close guide"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <p className="mb-2 text-[15px] leading-relaxed text-slate-700">{guide.purpose}</p>
              {guide.isoRef && (
                <p className="mb-5 inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                  {guide.isoRef}
                </p>
              )}

              {isItemPage && isModule && (
                <Section icon={<BookOpen className="h-4 w-4" />} title="On this item page">
                  <ul className="space-y-2">
                    {ITEM_PAGE_GUIDE.map((line) => (
                      <li key={line} className="flex gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <Section icon={<BookOpen className="h-4 w-4" />} title="Step by step">
                <ol className="space-y-3">
                  {guide.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm text-slate-700">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </Section>

              {guide.examples?.length ? (
                <Section icon={<Sparkles className="h-4 w-4" />} title="Examples">
                  <div className="flex flex-wrap gap-2">
                    {guide.examples.map((example) => (
                      <span key={example} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
                        {example}
                      </span>
                    ))}
                  </div>
                </Section>
              ) : null}

              {guide.tips?.length ? (
                <Section icon={<Lightbulb className="h-4 w-4" />} title="Tips">
                  <ul className="space-y-2">
                    {guide.tips.map((tip) => (
                      <li key={tip} className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              {isModule && !isItemPage && (
                <Section icon={<CheckCircle2 className="h-4 w-4" />} title="Works in every module">
                  <ul className="space-y-2">
                    {COMMON_ACTIONS.map((line) => (
                      <li key={line} className="flex gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>

            <footer className="border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={close}
                className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Got it
              </button>
            </footer>
          </aside>
        </div>
      )}
    </>
  )
}

export default ModuleGuide

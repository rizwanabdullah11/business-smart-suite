"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import DynamicModulePage from "@/components/dynamic-module-page"
import { getDashboardIcon } from "@/lib/dashboard-icon-map"

function toTitleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export default function CustomModulePage() {
  const params = useParams<{ slug: string }>()
  const slug = String(params?.slug || "").trim().toLowerCase()
  const safeSlug = slug || "untitled-module"
  const moduleSlug = `custom-${safeSlug}`
  const moduleTitle = toTitleFromSlug(safeSlug)
  const [iconName, setIconName] = useState("Folder")

  useEffect(() => {
    try {
      const raw = localStorage.getItem("customDashboardModules")
      const parsed = raw ? JSON.parse(raw) : []
      const modules = Array.isArray(parsed) ? parsed : []
      const match = modules.find((mod: any) => String(mod?.slug || "") === safeSlug || String(mod?.href || "") === `/custom-modules/${safeSlug}`)
      setIconName(String(match?.icon || "Folder"))
    } catch {
      setIconName("Folder")
    }
  }, [safeSlug])

  const ModuleIcon = useMemo(() => getDashboardIcon(iconName), [iconName])

  return (
    <DynamicModulePage
      moduleSlug={moduleSlug}
      categoryType={moduleSlug}
      title={moduleTitle}
      description={`Manage ${moduleTitle} tasks and records dynamically`}
      itemLabel="Task"
      icon={ModuleIcon}
      newItemHref={`/custom-modules/${safeSlug}`}
      itemHrefPrefix={`/custom-modules/${safeSlug}`}
    />
  )
}

"use client"

import { FileText } from "lucide-react"
import DynamicModulePage from "@/components/dynamic-module-page"

export default function ManualPage() {
  return (
    <DynamicModulePage
      moduleSlug="manual"
      apiModuleSlug="manuals"
      categoryType="manual"
      title="Manuals"
      description="Manage documentation, categories, and publication status in one place."
      itemLabel="Manual"
      icon={FileText}
      newItemHref="/manual/new"
      itemHrefPrefix="/manual"
      formFields={[
        { key: "title", label: "Manual Title", required: true, placeholder: "Enter manual title..." },
        { key: "version", label: "Version", placeholder: "e.g., v1.0" },
        { key: "location", label: "Location", placeholder: "e.g., QMS" },
        { key: "issueDate", label: "Issue Date", type: "date" },
      ]}
      listFieldKeys={["version", "issueDate", "location"]}
    />
  )
}

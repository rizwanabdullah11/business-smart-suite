"use client"

import { FileText } from "lucide-react"
import DynamicModulePage from "@/components/dynamic-module-page"

export default function PoliciesPage() {
  return (
    <DynamicModulePage
      moduleSlug="policies"
      categoryType="policy"
      title="Policies"
      description="Manage organizational policies"
      itemLabel="Policy"
      icon={FileText}
      newItemHref="/policies/new"
      itemHrefPrefix="/policies"
      formFields={[
        { key: "title", label: "Policy Title", required: true, placeholder: "Enter policy title..." },
        { key: "version", label: "Version", placeholder: "e.g., v1.0" },
        { key: "location", label: "Location", placeholder: "e.g., QMS" },
        { key: "issueDate", label: "Issue Date", type: "date" },
      ]}
      listFieldKeys={["version", "issueDate", "location"]}
    />
  )
}

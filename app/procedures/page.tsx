"use client"

import { List } from "lucide-react"
import DynamicModulePage from "@/components/dynamic-module-page"

export default function ProceduresPage() {
  return (
    <DynamicModulePage
      moduleSlug="procedures"
      categoryType="procedure"
      title="Procedures"
      description="Manage standard operating procedures"
      itemLabel="Procedure"
      icon={List}
      newItemHref="/procedures/new"
      itemHrefPrefix="/procedures"
      formFields={[
        { key: "title", label: "Procedure Title", required: true, placeholder: "Enter procedure title..." },
        { key: "version", label: "Version", placeholder: "e.g., v1.0" },
        { key: "location", label: "Location", placeholder: "e.g., OPS" },
        { key: "issueDate", label: "Issue Date", type: "date" },
      ]}
      listFieldKeys={["version", "issueDate", "location"]}
    />
  )
}

"use client"

import { use } from "react"
import DynamicModuleEditPage from "@/components/dynamic-module-edit-page"

export default function EditOrganisationalContextPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <DynamicModuleEditPage
      id={id}
      moduleSlug="organisational-context"
      pageTitle="Edit Context Issue"
      backHref="/organisational-context"
      backLabel="Back to Organisational Context"
      fields={[
        { key: "title", label: "Title", required: true, placeholder: "Issue title..." },
        { key: "description", label: "Description", type: "textarea", placeholder: "Issue details..." },
        { key: "type", label: "Type", type: "select", options: ["Strength", "Weakness", "Opportunity", "Threat"], defaultValue: "Strength" },
        { key: "impact", label: "Impact", type: "select", options: ["Low", "Medium", "High"], defaultValue: "Low" },
      ]}
    />
  )
}

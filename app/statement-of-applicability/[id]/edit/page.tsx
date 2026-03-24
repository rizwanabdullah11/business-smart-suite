"use client"

import { use } from "react"
import DynamicModuleEditPage from "@/components/dynamic-module-edit-page"

export default function EditSoAPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <DynamicModuleEditPage
      id={id}
      moduleSlug="statement-of-applicability"
      pageTitle="Edit Control"
      backHref="/statement-of-applicability"
      backLabel="Back to SoA"
      fields={[
        { key: "title", label: "Control", required: true, placeholder: "Control ID and title..." },
        { key: "description", label: "Description", type: "textarea", placeholder: "Control description..." },
        { key: "status", label: "Status", type: "select", options: ["Implemented", "Planned", "Not Applicable"], defaultValue: "Implemented" },
        { key: "applicable", label: "Applicable", type: "checkbox", defaultValue: true },
        { key: "justification", label: "Justification", type: "textarea", placeholder: "Justification..." },
        { key: "owner", label: "Owner", placeholder: "Owner..." },
      ]}
    />
  )
}

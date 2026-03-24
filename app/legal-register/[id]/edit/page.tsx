"use client"

import { use } from "react"
import DynamicModuleEditPage from "@/components/dynamic-module-edit-page"

export default function EditLegalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <DynamicModuleEditPage
      id={id}
      moduleSlug="legal-register"
      pageTitle="Edit Regulation"
      backHref="/legal-register"
      backLabel="Back to Legal Register"
      fields={[
        { key: "title", label: "Title", required: true, placeholder: "Regulation title..." },
        { key: "authority", label: "Authority", placeholder: "Authority..." },
        { key: "description", label: "Description", type: "textarea", placeholder: "Description..." },
        { key: "compliance", label: "Compliance", type: "select", options: ["Compliant", "Partial", "Non-Compliant"], defaultValue: "Compliant" },
        { key: "lastReview", label: "Last Review", type: "date" },
        { key: "nextReview", label: "Next Review", type: "date" },
      ]}
    />
  )
}
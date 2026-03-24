"use client"

import { use } from "react"
import DynamicModuleEditPage from "@/components/dynamic-module-edit-page"

export default function EditInterestedPartyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <DynamicModuleEditPage
      id={id}
      moduleSlug="interested-parties"
      pageTitle="Edit Interested Party"
      backHref="/interested-parties"
      backLabel="Back to Interested Parties"
      fields={[
        { key: "name", label: "Name", required: true, placeholder: "Party name..." },
        { key: "needs", label: "Needs", type: "textarea", placeholder: "Needs/expectations..." },
        { key: "influence", label: "Influence", type: "select", options: ["Low", "Medium", "High"], defaultValue: "Medium" },
        { key: "interest", label: "Interest", type: "select", options: ["Low", "Medium", "High"], defaultValue: "Medium" },
      ]}
    />
  )
}

"use client"

import { use } from "react"
import DynamicModuleEditPage from "@/components/dynamic-module-edit-page"

export default function EditObjectivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <DynamicModuleEditPage
      id={id}
      moduleSlug="objectives"
      pageTitle="Edit Objective"
      backHref="/objectives"
      backLabel="Back to Objectives"
      fields={[
        { key: "title", label: "Title", required: true, placeholder: "Objective title..." },
        { key: "target", label: "Target", placeholder: "Target..." },
        { key: "current", label: "Current", placeholder: "Current status..." },
        { key: "deadline", label: "Deadline", type: "date" },
        { key: "status", label: "Status", type: "select", options: ["On Track", "At Risk", "Behind", "Completed"], defaultValue: "On Track" },
        { key: "owner", label: "Owner", placeholder: "Owner..." },
      ]}
    />
  )
}

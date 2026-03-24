"use client"

import { use } from "react"
import DynamicModuleEditPage from "@/components/dynamic-module-edit-page"

export default function EditAuditSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <DynamicModuleEditPage
      id={id}
      moduleSlug="audit-schedule"
      pageTitle="Edit Audit Schedule"
      backHref="/audit-schedule"
      backLabel="Back to Audit Schedule"
      fields={[
        { key: "title", label: "Title", required: true, placeholder: "Enter audit title..." },
        { key: "department", label: "Department", placeholder: "Department..." },
        { key: "auditor", label: "Auditor", placeholder: "Auditor name..." },
        { key: "scheduledDate", label: "Scheduled Date", type: "date" },
        { key: "status", label: "Status", type: "select", options: ["Scheduled", "In Progress", "Completed"], defaultValue: "Scheduled" },
      ]}
    />
  )
}
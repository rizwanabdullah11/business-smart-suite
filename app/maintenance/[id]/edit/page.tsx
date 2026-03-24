"use client"

import { use } from "react"
import DynamicModuleEditPage from "@/components/dynamic-module-edit-page"

export default function EditMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <DynamicModuleEditPage
      id={id}
      moduleSlug="maintenance"
      pageTitle="Edit Maintenance Record"
      backHref="/maintenance"
      backLabel="Back to Maintenance"
      fields={[
        { key: "title", label: "Title", required: true, placeholder: "Maintenance item..." },
        { key: "type", label: "Type", type: "select", options: ["Preventive", "Corrective", "Predictive"], defaultValue: "Preventive" },
        { key: "date", label: "Date", type: "date" },
        { key: "technician", label: "Technician", placeholder: "Technician..." },
        { key: "status", label: "Status", type: "select", options: ["Scheduled", "In Progress", "Completed"], defaultValue: "Scheduled" },
      ]}
    />
  )
}

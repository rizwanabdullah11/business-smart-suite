"use client"

import { use } from "react"
import DynamicModuleEditPage from "@/components/dynamic-module-edit-page"

export default function EditTrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <DynamicModuleEditPage
      id={id}
      moduleSlug="training"
      pageTitle="Edit Training Record"
      backHref="/training"
      backLabel="Back to Training"
      fields={[
        { key: "title", label: "Training", required: true, placeholder: "Training title..." },
        { key: "employee", label: "Employee", placeholder: "Employee name..." },
        { key: "department", label: "Department", placeholder: "Department..." },
        { key: "date", label: "Training Date", type: "date" },
        { key: "expiry", label: "Expiry Date", type: "date" },
        { key: "status", label: "Status", type: "select", options: ["Valid", "Expired", "Pending"], defaultValue: "Valid" },
        { key: "certificate", label: "Certificate Issued", type: "checkbox", defaultValue: true },
      ]}
    />
  )
}

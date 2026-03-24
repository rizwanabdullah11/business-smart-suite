"use client"

import { use } from "react"
import DynamicModuleEditPage from "@/components/dynamic-module-edit-page"

export default function EditImprovementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <DynamicModuleEditPage
      id={id}
      moduleSlug="improvement-register"
      pageTitle="Edit Improvement Record"
      backHref="/improvement-register"
      backLabel="Back to Improvement Register"
      fields={[
        { key: "title", label: "Title", required: true, placeholder: "Improvement title..." },
        { key: "source", label: "Source", type: "select", options: ["Internal Audit", "Customer Complaint", "Employee Suggestion", "External Audit"], defaultValue: "Internal Audit" },
        { key: "date", label: "Date", type: "date" },
        { key: "assignee", label: "Assignee", placeholder: "Assignee..." },
        { key: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Closed"], defaultValue: "Open" },
      ]}
    />
  )
}

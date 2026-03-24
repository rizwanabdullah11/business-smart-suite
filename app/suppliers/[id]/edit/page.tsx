"use client"

import { use } from "react"
import DynamicModuleEditPage from "@/components/dynamic-module-edit-page"

export default function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <DynamicModuleEditPage
      id={id}
      moduleSlug="suppliers"
      pageTitle="Edit Supplier"
      backHref="/suppliers"
      backLabel="Back to Suppliers"
      fields={[
        { key: "title", label: "Supplier Name", required: true, placeholder: "Supplier..." },
        { key: "contact", label: "Contact", placeholder: "Contact person..." },
        { key: "email", label: "Email", placeholder: "Email..." },
        { key: "phone", label: "Phone", placeholder: "Phone..." },
        { key: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Probation", "Rejected"], defaultValue: "Pending" },
        { key: "criticality", label: "Criticality", type: "select", options: ["Low", "Medium", "High"], defaultValue: "Low" },
        { key: "lastAudit", label: "Last Audit", type: "date" },
      ]}
    />
  )
}

"use client"

import { use } from "react"
import DynamicModuleEditPage from "@/components/dynamic-module-edit-page"

export default function EditEnergyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <DynamicModuleEditPage
      id={id}
      moduleSlug="energy-consumption"
      pageTitle="Edit Reading"
      backHref="/energy-consumption"
      backLabel="Back to Energy"
      fields={[
        { key: "title", label: "Reading Title", required: true, placeholder: "Meter/period..." },
        { key: "reading", label: "Reading", type: "number", placeholder: "0" },
        { key: "unit", label: "Unit", type: "select", options: ["kWh", "m3", "L"], defaultValue: "kWh" },
        { key: "cost", label: "Cost", type: "number", placeholder: "0.00" },
        { key: "date", label: "Date", type: "date" },
        { key: "location", label: "Location", placeholder: "Location..." },
        { key: "status", label: "Status", type: "select", options: ["Pending", "Verified"], defaultValue: "Pending" },
      ]}
    />
  )
}

"use client"

import { ClipboardCheck } from "lucide-react"
import DynamicModulePage from "@/components/dynamic-module-page"

export default function ObligationsRegisterPage() {
  return (
    <DynamicModulePage
      moduleSlug="obligations-register"
      title="Obligations Register"
      description="Track contractual and voluntary obligations separate from legal requirements"
      itemLabel="Obligation"
      icon={ClipboardCheck}
      newItemHref="/obligations-register/new"
      itemHrefPrefix="/obligations-register"
      dateFieldKey="dueDate"
      formFields={[
        { key: "title", label: "Obligation", required: true, placeholder: "e.g., Customer SLA response within 4 hours" },
        { key: "source", label: "Source", placeholder: "e.g., Contract, Customer, Regulator" },
        { key: "owner", label: "Owner", placeholder: "Responsible person" },
        { key: "dueDate", label: "Due Date", type: "date" },
        { key: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Completed"], defaultValue: "Open" },
        { key: "evidence", label: "Evidence / Notes", type: "textarea", placeholder: "Links, notes, evidence..." },
      ]}
      listFieldKeys={["source", "owner", "dueDate", "status"]}
    />
  )
}


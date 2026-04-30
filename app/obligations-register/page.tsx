"use client"

import { FileCheck } from "lucide-react"
import DynamicModulePage from "@/components/dynamic-module-page"

export default function ObligationsRegisterPage() {
  return (
    <DynamicModulePage
      moduleSlug="obligations-register"
      title="Obligations Register"
      description="Track contractual and voluntary commitments, owners, deadlines, and fulfilment status"
      itemLabel="Obligation"
      icon={FileCheck}
      newItemHref="/obligations-register/new"
      itemHrefPrefix="/obligations-register"
      dateFieldKey="deadline"
      formFields={[
        { key: "title", label: "Obligation", required: true, placeholder: "Describe the obligation..." },
        { key: "source", label: "Source", placeholder: "Customer / regulator / contract..." },
        { key: "stakeholder", label: "Stakeholder", placeholder: "Related stakeholder..." },
        { key: "owner", label: "Owner", placeholder: "Responsible person..." },
        { key: "deadline", label: "Deadline", type: "date" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["Not Started", "In Progress", "Completed", "Overdue"],
          defaultValue: "Not Started",
        },
        { key: "evidence", label: "Evidence", placeholder: "Link / reference to evidence..." },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional context..." },
      ]}
      listFieldKeys={["source", "stakeholder", "owner", "deadline", "status", "evidence"]}
    />
  )
}


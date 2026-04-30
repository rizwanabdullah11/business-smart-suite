"use client"

import { ShieldAlert } from "lucide-react"
import DynamicModulePage from "@/components/dynamic-module-page"

export default function ItRiskManagementPage() {
  return (
    <DynamicModulePage
      moduleSlug="it-risk-management"
      title="IT Risk Management"
      description="Maintain an information security risk register, treatments, and control implementation status"
      itemLabel="IT Risk"
      icon={ShieldAlert}
      newItemHref="/it-risk-management/new"
      itemHrefPrefix="/it-risk-management"
      dateFieldKey="reviewDate"
      formFields={[
        { key: "title", label: "Risk Title", required: true, placeholder: "e.g. Phishing compromise risk" },
        { key: "description", label: "Description", type: "textarea", placeholder: "Describe the risk..." },
        { key: "owner", label: "Owner", placeholder: "Risk owner..." },
        { key: "likelihood", label: "Likelihood", type: "select", options: ["1", "2", "3", "4", "5"], defaultValue: "3" },
        { key: "impact", label: "Impact", type: "select", options: ["1", "2", "3", "4", "5"], defaultValue: "3" },
        { key: "score", label: "Score", placeholder: "Optional: L x I" },
        { key: "control", label: "Linked Control", placeholder: "ISO 27001 Annex A control..." },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["Open", "In Treatment", "Accepted", "Closed"],
          defaultValue: "Open",
        },
        { key: "treatment", label: "Treatment", type: "textarea", placeholder: "Treatment decision / actions..." },
        { key: "reviewDate", label: "Next Review Date", type: "date" },
      ]}
      listFieldKeys={["owner", "likelihood", "impact", "score", "control", "status", "reviewDate"]}
    />
  )
}


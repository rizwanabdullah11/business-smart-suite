"use client"

import { ShieldAlert } from "lucide-react"
import DynamicModulePage from "@/components/dynamic-module-page"

export default function ITRiskManagementPage() {
  return (
    <DynamicModulePage
      moduleSlug="it-risk-management"
      title="IT Risk Management"
      description="Identify and treat information security risks (ISO 27001)"
      itemLabel="IT Risk"
      icon={ShieldAlert}
      newItemHref="/it-risk-management/new"
      itemHrefPrefix="/it-risk-management"
      formFields={[
        { key: "title", label: "Risk Title", required: true, placeholder: "e.g., Unauthorized access to customer data" },
        { key: "asset", label: "Information Asset", placeholder: "e.g., CRM Database" },
        { key: "threat", label: "Threat", placeholder: "e.g., Credential stuffing" },
        { key: "vulnerability", label: "Vulnerability", placeholder: "e.g., Weak MFA adoption" },
        { key: "likelihood", label: "Likelihood", type: "select", options: ["1", "2", "3", "4", "5"], defaultValue: "3" },
        { key: "impact", label: "Impact", type: "select", options: ["1", "2", "3", "4", "5"], defaultValue: "3" },
        { key: "treatment", label: "Treatment", type: "select", options: ["Accept", "Mitigate", "Transfer", "Avoid"], defaultValue: "Mitigate" },
        { key: "owner", label: "Owner", placeholder: "Responsible person" },
        { key: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Closed"], defaultValue: "Open" },
        { key: "controls", label: "Controls / Annex A refs", type: "textarea", placeholder: "List controls and references..." },
      ]}
      listFieldKeys={["asset", "likelihood", "impact", "treatment", "owner", "status"]}
    />
  )
}


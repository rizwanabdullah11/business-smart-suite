"use client"

import { Award } from "lucide-react"
import DynamicModulePage from "@/components/dynamic-module-page"

export default function CertificatePage() {
  return (
    <DynamicModulePage
      moduleSlug="certificates"
      categoryType="certificate"
      title="Certificates"
      description="Manage certifications and credentials"
      itemLabel="Certificate"
      icon={Award}
      newItemHref="/certificate/new"
      itemHrefPrefix="/certificate"
      dateFieldKey="expiryDate"
      formFields={[
        { key: "title", label: "Certificate Title", required: true, placeholder: "Enter certificate title..." },
        { key: "version", label: "Version", placeholder: "e.g., v1.0" },
        { key: "location", label: "Location", placeholder: "e.g., QA" },
        { key: "issueDate", label: "Issue Date", type: "date" },
        { key: "expiryDate", label: "Expiry Date", type: "date" },
      ]}
      listFieldKeys={["version", "issueDate", "expiryDate", "location"]}
    />
  )
}

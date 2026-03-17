"use client"

import { FileBox } from "lucide-react"
import DynamicModulePage from "@/components/dynamic-module-page"

export default function FormsPage() {
  return (
    <DynamicModulePage
      moduleSlug="forms"
      categoryType="form"
      title="Forms"
      description="Manage operational and compliance forms"
      itemLabel="Form"
      icon={FileBox}
      newItemHref="/forms/new"
      itemHrefPrefix="/forms"
      formFields={[
        { key: "title", label: "Form Title", required: true, placeholder: "Enter form title..." },
        { key: "version", label: "Version", placeholder: "e.g., v1.0" },
        { key: "location", label: "Location", placeholder: "e.g., HR" },
        { key: "issueDate", label: "Issue Date", type: "date" },
      ]}
      listFieldKeys={["version", "issueDate", "location"]}
    />
  )
}

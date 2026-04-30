"use client"

import { Package } from "lucide-react"
import DynamicModulePage from "@/components/dynamic-module-page"

export default function AssetManagementPage() {
  return (
    <DynamicModulePage
      moduleSlug="asset-management"
      title="Asset Management"
      description="Track company assets, ownership, location, and maintenance history"
      itemLabel="Asset"
      icon={Package}
      newItemHref="/asset-management/new"
      itemHrefPrefix="/asset-management"
      formFields={[
        { key: "title", label: "Asset Name", required: true, placeholder: "e.g., Company Laptop A12" },
        { key: "assetTag", label: "Asset Tag / ID", placeholder: "e.g., IT-000123" },
        { key: "type", label: "Type", placeholder: "e.g., Vehicle, Hardware, Equipment" },
        { key: "owner", label: "Owner", placeholder: "Responsible person" },
        { key: "location", label: "Location", placeholder: "Current location" },
        { key: "status", label: "Status", type: "select", options: ["In Service", "Out of Service", "In Repair", "Retired"], defaultValue: "In Service" },
        { key: "lastServiceDate", label: "Last Service Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional details..." },
      ]}
      listFieldKeys={["assetTag", "type", "owner", "location", "status", "lastServiceDate"]}
    />
  )
}


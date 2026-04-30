"use client"

import { Package } from "lucide-react"
import DynamicModulePage from "@/components/dynamic-module-page"

export default function AssetManagementPage() {
  return (
    <DynamicModulePage
      moduleSlug="asset-management"
      title="Asset Management"
      description="Track company assets, ownership, location, status, and service history"
      itemLabel="Asset"
      icon={Package}
      newItemHref="/asset-management/new"
      itemHrefPrefix="/asset-management"
      dateFieldKey="nextServiceDate"
      formFields={[
        { key: "title", label: "Asset Name", required: true, placeholder: "e.g. Forklift FL-02" },
        { key: "assetType", label: "Asset Type", placeholder: "e.g. Vehicle / Equipment / IT Hardware" },
        { key: "serialNumber", label: "Serial Number", placeholder: "Serial / tag number..." },
        { key: "owner", label: "Owner", placeholder: "Assigned owner..." },
        { key: "location", label: "Location", placeholder: "Site / room..." },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["Operational", "Under Maintenance", "Out of Service", "Retired"],
          defaultValue: "Operational",
        },
        { key: "lastServiceDate", label: "Last Service Date", type: "date" },
        { key: "nextServiceDate", label: "Next Service Due", type: "date" },
        { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional details..." },
      ]}
      listFieldKeys={["assetType", "serialNumber", "owner", "location", "status", "nextServiceDate"]}
    />
  )
}


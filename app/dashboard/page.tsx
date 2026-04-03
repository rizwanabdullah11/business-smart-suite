"use client"

import { useState } from "react"
import { ModuleHubContent } from "@/components/dashboard/ModuleHubContent"
import { CreateSectionDialog } from "@/components/dashboard/CreateSectionDialog"

export default function DashboardPage() {
    const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false)

    const handleAddFolder = () => {
        setIsCreateSectionOpen(true)
    }

    return (
        <>
            <ModuleHubContent onAddFolder={handleAddFolder} />
            <CreateSectionDialog
                open={isCreateSectionOpen}
                onOpenChange={setIsCreateSectionOpen}
            />
        </>
    )
}

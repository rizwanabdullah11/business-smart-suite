"use client"

import { useEffect, useMemo, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { COLORS } from "@/constant/colors"
import { useToast } from "@/components/ui/use-toast"
import { DASHBOARD_ICON_OPTIONS } from "@/lib/dashboard-icon-map"

interface CreateSectionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

function toSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

export function CreateSectionDialog({ open, onOpenChange }: CreateSectionDialogProps) {
    const { toast } = useToast()
    const [title, setTitle] = useState("")
    const [icon, setIcon] = useState("FileText")
    const [selectedModules, setSelectedModules] = useState<string[]>([])
    const [customModules, setCustomModules] = useState<Array<{ label: string; href: string; moduleSlug: string }>>([])
    const [newModuleName, setNewModuleName] = useState("")
    const [newModuleIcon, setNewModuleIcon] = useState("FileText")

    useEffect(() => {
        const loadCustomModules = () => {
            try {
                const raw = localStorage.getItem("customDashboardModules")
                const parsed = raw ? JSON.parse(raw) : []
                setCustomModules(Array.isArray(parsed) ? parsed : [])
            } catch {
                setCustomModules([])
            }
        }
        loadCustomModules()
        window.addEventListener("custom-modules-updated", loadCustomModules)
        return () => window.removeEventListener("custom-modules-updated", loadCustomModules)
    }, [])

    const selectedModuleLabels = useMemo(() => {
        return customModules
            .filter((module) => selectedModules.includes(module.href))
            .map((module) => module.label)
    }, [customModules, selectedModules])

    const handleCreateModule = () => {
        const name = newModuleName.trim()
        if (!name) {
            toast({
                title: "Module name required",
                description: "Please enter a module name.",
                variant: "destructive",
            })
            return
        }

        const slug = toSlug(name)
        if (!slug) {
            toast({
                title: "Invalid module name",
                description: "Use letters and numbers for module name.",
                variant: "destructive",
            })
            return
        }

        const module = {
            label: name,
            slug,
            href: `/custom-modules/${slug}`,
            moduleSlug: `custom-${slug}`,
            icon: newModuleIcon,
            createdAt: new Date().toISOString(),
        }

        const storageKey = "customDashboardModules"
        const existingRaw = localStorage.getItem(storageKey)
        const existing = existingRaw ? JSON.parse(existingRaw) : []
        const list = Array.isArray(existing) ? existing : []

        if (list.some((m: any) => String(m?.slug || "") === slug || String(m?.href || "") === module.href)) {
            toast({
                title: "Module already exists",
                description: "A custom module with this name already exists.",
                variant: "destructive",
            })
            return
        }

        const next = [...list, module]
        localStorage.setItem(storageKey, JSON.stringify(next))
        window.dispatchEvent(new CustomEvent("custom-modules-updated"))
        setSelectedModules((prev) => (prev.includes(module.href) ? prev : [...prev, module.href]))
        setNewModuleName("")
        setNewModuleIcon("FileText")
        toast({
            title: "Module Created",
            description: `${name} module has been added.`,
        })
    }

    const handleCreate = () => {
        if (!title.trim()) {
            toast({
                title: "Title required",
                description: "Please enter a section title.",
                variant: "destructive",
            })
            return
        }

        if (selectedModules.length === 0) {
            toast({
                title: "Select at least one module",
                description: "Choose modules to include inside this section.",
                variant: "destructive",
            })
            return
        }

        const section = {
            id: `custom-${Date.now()}`,
            title: title.trim(),
            icon,
            moduleHrefs: selectedModules,
            createdAt: new Date().toISOString(),
        }

        const storageKey = "customDashboardSections"
        const existingRaw = localStorage.getItem(storageKey)
        const existing = existingRaw ? JSON.parse(existingRaw) : []
        const next = Array.isArray(existing) ? [...existing, section] : [section]
        localStorage.setItem(storageKey, JSON.stringify(next))
        window.dispatchEvent(new CustomEvent("custom-sections-updated"))

        toast({
            title: "Section Created",
            description: `Successfully created custom section: ${section.title}`,
        })

        // Reset and close
        setTitle("")
        setIcon("FileText")
        setSelectedModules([])
        setNewModuleName("")
        setNewModuleIcon("FileText")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-black">Create Custom Section</DialogTitle>
                    <DialogDescription className="text-gray-500">Create a custom section and add new modules.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="font-semibold text-gray-700">Title</Label>
                        <Input
                            id="title"
                            placeholder="Enter section title"
                            className="h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-gray-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="icon" className="font-semibold text-gray-700">Icon</Label>
                        <Select value={icon} onValueChange={setIcon}>
                            <SelectTrigger className="h-11 rounded-lg border-gray-300 text-black">
                                <SelectValue placeholder="Select an icon" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200">
                                {DASHBOARD_ICON_OPTIONS.map((item) => {
                                    const IconComponent = item.icon
                                    return (
                                        <SelectItem key={item.value} value={item.value} className="text-black hover:bg-gray-100 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <IconComponent className="w-4 h-4 text-gray-500" />
                                                <span>{item.label}</span>
                                            </div>
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-700">Create New Module</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newModuleName}
                                onChange={(e) => setNewModuleName(e.target.value)}
                                placeholder="Enter module name (e.g. Incident Register)"
                                className="h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-gray-500"
                            />
                            <Select value={newModuleIcon} onValueChange={setNewModuleIcon}>
                                <SelectTrigger className="h-11 w-[190px] rounded-lg border-gray-300 text-black">
                                    <SelectValue placeholder="Select module icon" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-200 max-h-72">
                                    {DASHBOARD_ICON_OPTIONS.map((item) => {
                                        const IconComponent = item.icon
                                        return (
                                            <SelectItem key={`module-${item.value}`} value={item.value} className="text-black hover:bg-gray-100 cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <IconComponent className="w-4 h-4 text-gray-500" />
                                                    <span>{item.label}</span>
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                onClick={handleCreateModule}
                                className="h-11 px-4 rounded-lg font-semibold text-white"
                                style={{ background: COLORS.primary }}
                            >
                                Add Module
                            </Button>
                        </div>
                        <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                            Added modules: {selectedModuleLabels.length ? selectedModuleLabels.join(", ") : "None"}
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-0">
                    <DialogClose asChild>
                        <Button className="h-11 px-6 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-semibold text-gray-900">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleCreate}
                        className="h-11 px-6 rounded-lg font-bold shadow-md hover:shadow-lg transition-all text-white"
                        style={{ background: COLORS.primary }}
                    >
                        Create Section
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

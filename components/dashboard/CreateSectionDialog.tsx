"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/Button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
    FileText,
    Folder,
    Star,
    Shield,
    Briefcase,
    Users,
    Settings,
    Layout
} from "lucide-react"
import { COLORS } from "@/constant/colors"
import { useToast } from "@/components/ui/use-toast"

interface CreateSectionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const ICONS = [
    { value: "FileText", label: "File Text", icon: FileText },
    { value: "Folder", label: "Folder", icon: Folder },
    { value: "Star", label: "Star", icon: Star },
    { value: "Shield", label: "Shield", icon: Shield },
    { value: "Briefcase", label: "Briefcase", icon: Briefcase },
    { value: "Users", label: "Users", icon: Users },
    { value: "Settings", label: "Settings", icon: Settings },
    { value: "Layout", label: "Layout", icon: Layout },
]

export function CreateSectionDialog({ open, onOpenChange }: CreateSectionDialogProps) {
    const { toast } = useToast()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [icon, setIcon] = useState("FileText")

    const handleCreate = () => {
        // Here you would typically call an API or update state
        console.log("Creating section:", { title, description, icon })

        toast({
            title: "Section Created",
            description: `Successfully created custom section: ${title}`,
        })

        // Reset and close
        setTitle("")
        setDescription("")
        setIcon("FileText")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-black">Create Custom Section</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Add a new custom section to organize your content.
                        This will appear as a new box on the homepage.
                    </DialogDescription>
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
                        <Label htmlFor="description" className="font-semibold text-gray-700">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter section description"
                            className="min-h-[100px] resize-none rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-gray-500"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="icon" className="font-semibold text-gray-700">Icon</Label>
                        <Select value={icon} onValueChange={setIcon}>
                            <SelectTrigger className="h-11 rounded-lg border-gray-300 text-black">
                                <SelectValue placeholder="Select an icon" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200">
                                {ICONS.map((item) => {
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

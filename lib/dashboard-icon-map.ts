import type { LucideIcon } from "lucide-react"
import {
  AlertOctagon,
  AlertTriangle,
  Award,
  BarChart,
  BarChart2,
  BookOpen,
  Bot,
  Briefcase,
  Calendar,
  ClipboardList,
  FileCheck,
  FileCode,
  FileIcon,
  FileInput,
  FileText,
  FileWarning,
  Folder,
  GraduationCap,
  LayoutDashboard,
  PenTool,
  Scale,
  Settings,
  Shield,
  Star,
  Target,
  TrendingUp,
  Truck,
  Users,
  Zap,
} from "lucide-react"

export const DASHBOARD_ICON_OPTIONS: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: "FileText", label: "File Text", icon: FileText },
  { value: "Folder", label: "Folder", icon: Folder },
  { value: "Star", label: "Star", icon: Star },
  { value: "Shield", label: "Shield", icon: Shield },
  { value: "Briefcase", label: "Briefcase", icon: Briefcase },
  { value: "Users", label: "Users", icon: Users },
  { value: "Settings", label: "Settings", icon: Settings },
  { value: "LayoutDashboard", label: "Layout Dashboard", icon: LayoutDashboard },
  { value: "BookOpen", label: "Book Open", icon: BookOpen },
  { value: "ClipboardList", label: "Clipboard List", icon: ClipboardList },
  { value: "FileInput", label: "File Input", icon: FileInput },
  { value: "Award", label: "Award", icon: Award },
  { value: "FileIcon", label: "File Icon", icon: FileIcon },
  { value: "FileWarning", label: "File Warning", icon: FileWarning },
  { value: "AlertOctagon", label: "Alert Octagon", icon: AlertOctagon },
  { value: "FileCode", label: "File Code", icon: FileCode },
  { value: "AlertTriangle", label: "Alert Triangle", icon: AlertTriangle },
  { value: "Calendar", label: "Calendar", icon: Calendar },
  { value: "Target", label: "Target", icon: Target },
  { value: "PenTool", label: "Pen Tool", icon: PenTool },
  { value: "BarChart2", label: "Bar Chart 2", icon: BarChart2 },
  { value: "FileCheck", label: "File Check", icon: FileCheck },
  { value: "Scale", label: "Scale", icon: Scale },
  { value: "Truck", label: "Truck", icon: Truck },
  { value: "GraduationCap", label: "Graduation Cap", icon: GraduationCap },
  { value: "Zap", label: "Zap", icon: Zap },
  { value: "TrendingUp", label: "Trending Up", icon: TrendingUp },
  { value: "BarChart", label: "Bar Chart", icon: BarChart },
  { value: "Bot", label: "Bot", icon: Bot },
]

const iconMap: Record<string, LucideIcon> = DASHBOARD_ICON_OPTIONS.reduce<Record<string, LucideIcon>>((acc, current) => {
  acc[current.value] = current.icon
  return acc
}, {})

// Backward compatibility with older saved icon values.
iconMap.Layout = LayoutDashboard

export function getDashboardIcon(iconName?: string): LucideIcon {
  if (!iconName) return FileText
  return iconMap[iconName] || FileText
}

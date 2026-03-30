import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  FileText,
  ClipboardList,
  FileInput,
  Award,
  Briefcase,
  Users,
  FileIcon,
  FileWarning,
  AlertOctagon,
  FileCode,
  AlertTriangle,
  Calendar,
  Target,
  PenTool,
  BarChart2,
  FileCheck,
  Scale,
  Truck,
  GraduationCap,
  Zap,
  MessageSquare,
  Shield,
  TrendingUp,
  BarChart,
  Settings,
} from "lucide-react"
import { Permission } from "@/lib/types/permissions"

export type DashboardModuleItem = {
  icon: LucideIcon
  label: string
  href: string
  permission?: Permission
}

export type DashboardModuleGroup = {
  title: string
  subtitle: string
  icon: LucideIcon
  color: string
  bgGradient: string
  iconGradient: string
  moduleGradient: string
  shadow: string
  modules: DashboardModuleItem[]
}

export const DASHBOARD_MODULE_GROUPS: DashboardModuleGroup[] = [
  {
    title: "Core Management",
    subtitle: "Documents & records",
    icon: Shield,
    color: "#2563eb",
    bgGradient: "linear-gradient(160deg,#0f1f3d 0%,#1a2f5a 60%,#1e3a6e 100%)",
    iconGradient: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    moduleGradient: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    shadow: "0 8px 32px rgba(37,99,235,0.25)",
    modules: [
      { icon: BookOpen, label: "Manual", href: "/manual", permission: Permission.VIEW_MANUALS },
      { icon: FileText, label: "Policies", href: "/policies", permission: Permission.VIEW_POLICIES },
      { icon: ClipboardList, label: "Procedures", href: "/procedures", permission: Permission.VIEW_PROCEDURES },
      { icon: FileInput, label: "Forms", href: "/forms", permission: Permission.VIEW_FORMS },
      { icon: Award, label: "Certificates", href: "/certificate", permission: Permission.VIEW_CERTIFICATES },
    ],
  },
  {
    title: "Compliance & Risk",
    subtitle: "Standards & auditing",
    icon: TrendingUp,
    color: "#7c3aed",
    bgGradient: "linear-gradient(160deg,#1a0d2e 0%,#2d1654 60%,#3b1c6e 100%)",
    iconGradient: "linear-gradient(135deg,#6d28d9,#a855f7)",
    moduleGradient: "linear-gradient(135deg,#6d28d9,#a855f7)",
    shadow: "0 8px 32px rgba(109,40,217,0.25)",
    modules: [
      { icon: Briefcase, label: "Business Continuity", href: "/business-continuity" },
      { icon: Users, label: "Management Reviews", href: "/management-reviews" },
      { icon: FileIcon, label: "Job Descriptions", href: "/job-descriptions" },
      { icon: FileWarning, label: "Work Instructions", href: "/work-instructions" },
      { icon: AlertOctagon, label: "Risk Assessments", href: "/risk-assessments", permission: Permission.VIEW_RISK_ASSESSMENTS },
      { icon: AlertOctagon, label: "COSHH", href: "/coshh", permission: Permission.VIEW_COSHH },
      { icon: FileCode, label: "Technical File", href: "/technical-file" },
      { icon: AlertTriangle, label: "IMS Aspects & Impacts", href: "/ims-aspects-impacts" },
    ],
  },
  {
    title: "Registers & Records",
    subtitle: "Operations & compliance",
    icon: BarChart,
    color: "#059669",
    bgGradient: "linear-gradient(160deg,#052e1a 0%,#064e2e 60%,#065f38 100%)",
    iconGradient: "linear-gradient(135deg,#047857,#10b981)",
    moduleGradient: "linear-gradient(135deg,#047857,#10b981)",
    shadow: "0 8px 32px rgba(5,150,105,0.25)",
    modules: [
      { icon: Calendar, label: "Audit Schedule", href: "/audit-schedule", permission: Permission.VIEW_AUDIT_SCHEDULE },
      { icon: Users, label: "Interested Parties", href: "/interested-parties" },
      { icon: FileText, label: "Organisational Context", href: "/organisational-context" },
      { icon: Target, label: "Objectives", href: "/objectives" },
      { icon: PenTool, label: "Maintenance", href: "/maintenance" },
      { icon: BarChart2, label: "Improvement Register", href: "/improvement-register", permission: Permission.VIEW_IMPROVEMENTS },
      { icon: FileCheck, label: "Statement of Applicability", href: "/statement-of-applicability" },
      { icon: Scale, label: "Legal Register", href: "/legal-register" },
      { icon: Truck, label: "Suppliers", href: "/suppliers" },
      { icon: GraduationCap, label: "Training", href: "/training" },
      { icon: Zap, label: "Energy Consumption", href: "/energy-consumption" },
      { icon: MessageSquare, label: "Customer Feedback", href: "/customer-feedback" },
    ],
  },
  {
    title: "Administration",
    subtitle: "Users & settings",
    icon: Settings,
    color: "#ea580c",
    bgGradient: "linear-gradient(160deg,#2c1200 0%,#4a1f00 60%,#5c2700 100%)",
    iconGradient: "linear-gradient(135deg,#c2410c,#f97316)",
    moduleGradient: "linear-gradient(135deg,#c2410c,#f97316)",
    shadow: "0 8px 32px rgba(194,65,12,0.25)",
    modules: [
      { icon: Users, label: "Users", href: "/admin/users", permission: Permission.VIEW_USERS },
      { icon: Users, label: "Permissions", href: "/admin/permissions", permission: Permission.MANAGE_ROLES },
      { icon: BarChart2, label: "Diagnostics", href: "/admin/diagnostics", permission: Permission.MANAGE_ROLES },
    ],
  },
]

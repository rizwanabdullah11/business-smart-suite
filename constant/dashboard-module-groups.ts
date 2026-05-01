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
  FolderOpen,
  Rocket,
  BadgeCheck,
} from "lucide-react"
import { Permission } from "@/lib/types/permissions"

export type DashboardModuleItem = {
  icon: LucideIcon
  label: string
  href: string
  permission?: Permission
  moduleKey?: string
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
      { icon: BookOpen, label: "Manual", href: "/manual", permission: Permission.VIEW_MANUALS, moduleKey: "document-control" },
      { icon: FileText, label: "Policies", href: "/policies", permission: Permission.VIEW_POLICIES, moduleKey: "document-control" },
      { icon: ClipboardList, label: "Procedures", href: "/procedures", permission: Permission.VIEW_PROCEDURES, moduleKey: "document-control" },
      { icon: FileInput, label: "Forms", href: "/forms", permission: Permission.VIEW_FORMS, moduleKey: "document-control" },
      { icon: Award, label: "Certificates", href: "/certificate", permission: Permission.VIEW_CERTIFICATES, moduleKey: "document-control" },
      { icon: FolderOpen, label: "Documents", href: "/documents", permission: Permission.VIEW_MANUALS, moduleKey: "document-control" },
      { icon: Rocket, label: "Getting Started", href: "/guides/getting-started" },
      { icon: BadgeCheck, label: "ISO Standards", href: "/guides/iso-standards" },
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
      { icon: AlertOctagon, label: "Risk Register", href: "/risk-assessments", permission: Permission.VIEW_RISK_ASSESSMENTS, moduleKey: "risk-register" },
      { icon: AlertOctagon, label: "COSHH", href: "/coshh", permission: Permission.VIEW_COSHH },
      { icon: FileCode, label: "IT Risk Management", href: "/it-risk-management", moduleKey: "it-risk-management" },
      { icon: FileCode, label: "Technical File", href: "/technical-file", moduleKey: "it-risk-management" },
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
      { icon: Calendar, label: "Audit Management", href: "/audit-schedule", permission: Permission.VIEW_AUDIT_SCHEDULE, moduleKey: "audit-management" },
      { icon: Users, label: "Stakeholders", href: "/interested-parties", moduleKey: "stakeholder-management" },
      { icon: FileText, label: "Business Environment", href: "/organisational-context", moduleKey: "business-environment" },
      { icon: Target, label: "Objectives & Targets", href: "/objectives", moduleKey: "objectives-targets" },
      { icon: PenTool, label: "Equipment Maintenance", href: "/maintenance", moduleKey: "equipment-maintenance" },
      { icon: BarChart2, label: "Improvement Log (CAPA)", href: "/improvement-register", permission: Permission.VIEW_IMPROVEMENTS, moduleKey: "improvement-log" },
      { icon: FileCheck, label: "Statement of Applicability", href: "/statement-of-applicability", moduleKey: "it-risk-management" },
      { icon: Scale, label: "Legal Register", href: "/legal-register", moduleKey: "legal-register" },
      { icon: Truck, label: "Suppliers", href: "/suppliers", moduleKey: "supplier-management" },
      { icon: GraduationCap, label: "Training", href: "/training", moduleKey: "training-management" },
      { icon: Zap, label: "Environmental Aspects", href: "/energy-consumption", moduleKey: "environmental-aspects" },
      { icon: MessageSquare, label: "Customer Feedback", href: "/customer-feedback" },
      { icon: FileText, label: "Asset Management", href: "/asset-management", moduleKey: "asset-management" },
      { icon: FileText, label: "Obligations Register", href: "/obligations-register", moduleKey: "obligations-register" },
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
      { icon: Settings, label: "Billing & Plan", href: "/admin/billing", permission: Permission.MANAGE_ORGANIZATION_SETTINGS },
    ],
  },
]

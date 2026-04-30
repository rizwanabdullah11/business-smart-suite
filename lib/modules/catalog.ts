export type SubscriptionPlan = "starter" | "growth" | "enterprise"

export type ModuleKey =
  // Core document control (always included in Starter)
  | "manual"
  | "policies"
  | "procedures"
  | "forms"
  | "certificate"
  | "documents"
  // Compliance / registers already in app
  | "audit-schedule"
  | "legal-register"
  | "objectives"
  | "improvement-register"
  | "risk-assessments"
  | "coshh"
  | "interested-parties"
  | "organisational-context"
  | "suppliers"
  | "training"
  | "maintenance"
  | "energy-consumption"
  | "customer-feedback"
  // Newly added from modules guide
  | "asset-management"
  | "obligations-register"
  | "it-risk-management"

export type ModuleDefinition = {
  key: ModuleKey
  label: string
  description: string
  /** First path segment used for routing, e.g. "/asset-management" -> "asset-management" */
  routeSegment: string
  /** Plan availability (activation is still explicitly controlled per org) */
  availableIn: SubscriptionPlan[]
}

export const MODULE_CATALOG: ModuleDefinition[] = [
  {
    key: "manual",
    label: "Manual",
    description: "Quality manual and documentation hub",
    routeSegment: "manual",
    availableIn: ["starter", "growth", "enterprise"],
  },
  {
    key: "policies",
    label: "Policies",
    description: "Controlled policy documents",
    routeSegment: "policies",
    availableIn: ["starter", "growth", "enterprise"],
  },
  {
    key: "procedures",
    label: "Procedures",
    description: "Controlled procedures and workflows",
    routeSegment: "procedures",
    availableIn: ["starter", "growth", "enterprise"],
  },
  {
    key: "forms",
    label: "Forms",
    description: "Forms and submissions",
    routeSegment: "forms",
    availableIn: ["starter", "growth", "enterprise"],
  },
  {
    key: "certificate",
    label: "Certificates",
    description: "Certificates register and expiry management",
    routeSegment: "certificate",
    availableIn: ["starter", "growth", "enterprise"],
  },
  {
    key: "documents",
    label: "Documents",
    description: "Document library (controlled docs)",
    routeSegment: "documents",
    availableIn: ["starter", "growth", "enterprise"],
  },
  {
    key: "audit-schedule",
    label: "Audit Management",
    description: "Schedule audits, record findings, close actions",
    routeSegment: "audit-schedule",
    availableIn: ["starter", "growth", "enterprise"],
  },
  {
    key: "risk-assessments",
    label: "Risk Register",
    description: "Maintain risk assessments and treatments",
    routeSegment: "risk-assessments",
    availableIn: ["starter", "growth", "enterprise"],
  },
  {
    key: "legal-register",
    label: "Legal Register",
    description: "Track laws, regulations and compliance status",
    routeSegment: "legal-register",
    availableIn: ["starter", "growth", "enterprise"],
  },
  {
    key: "objectives",
    label: "Objectives & Targets",
    description: "Set objectives, owners and progress",
    routeSegment: "objectives",
    availableIn: ["starter", "growth", "enterprise"],
  },
  {
    key: "improvement-register",
    label: "Improvement Log (CAPA)",
    description: "Corrective/preventive actions and improvements",
    routeSegment: "improvement-register",
    availableIn: ["starter", "growth", "enterprise"],
  },
  {
    key: "interested-parties",
    label: "Stakeholder Management",
    description: "Maintain stakeholder register and expectations",
    routeSegment: "interested-parties",
    availableIn: ["growth", "enterprise"],
  },
  {
    key: "organisational-context",
    label: "Business Environment (Context)",
    description: "Context register and SWOT/PESTLE evidence",
    routeSegment: "organisational-context",
    availableIn: ["growth", "enterprise"],
  },
  {
    key: "suppliers",
    label: "Supplier Management",
    description: "Approved supplier list and evaluations",
    routeSegment: "suppliers",
    availableIn: ["growth", "enterprise"],
  },
  {
    key: "training",
    label: "Training Management",
    description: "Assignments, completion, certificates",
    routeSegment: "training",
    availableIn: ["growth", "enterprise"],
  },
  {
    key: "maintenance",
    label: "Equipment Maintenance",
    description: "Service intervals and maintenance history",
    routeSegment: "maintenance",
    availableIn: ["growth", "enterprise"],
  },
  {
    key: "energy-consumption",
    label: "Environmental Aspects",
    description: "Environmental data tracking (energy/waste/emissions)",
    routeSegment: "energy-consumption",
    availableIn: ["growth", "enterprise"],
  },
  {
    key: "asset-management",
    label: "Asset Management",
    description: "Asset register with owners, location and status",
    routeSegment: "asset-management",
    availableIn: ["growth", "enterprise"],
  },
  {
    key: "obligations-register",
    label: "Obligations Register",
    description: "Track contractual/voluntary commitments",
    routeSegment: "obligations-register",
    availableIn: ["enterprise"],
  },
  {
    key: "it-risk-management",
    label: "IT Risk Management",
    description: "ISO 27001 risk register and controls tracking",
    routeSegment: "it-risk-management",
    availableIn: ["enterprise"],
  },
  {
    key: "coshh",
    label: "COSHH",
    description: "COSHH register and controls",
    routeSegment: "coshh",
    availableIn: ["starter", "growth", "enterprise"],
  },
  {
    key: "customer-feedback",
    label: "Customer Feedback",
    description: "Feedback records and actions",
    routeSegment: "customer-feedback",
    availableIn: ["starter", "growth", "enterprise"],
  },
]

export const PLAN_DEFAULT_MODULES: Record<SubscriptionPlan, ModuleKey[]> = {
  starter: [
    "manual",
    "policies",
    "procedures",
    "forms",
    "certificate",
    "documents",
    "audit-schedule",
    "risk-assessments",
    "legal-register",
    "objectives",
    "improvement-register",
    // Starter still has access to basic registers you already ship
    "coshh",
    "customer-feedback",
  ],
  growth: MODULE_CATALOG.filter((m) => m.availableIn.includes("growth")).map((m) => m.key),
  enterprise: MODULE_CATALOG.filter((m) => m.availableIn.includes("enterprise")).map((m) => m.key),
}

export function isModuleInPlan(moduleKey: ModuleKey, plan: SubscriptionPlan) {
  return PLAN_DEFAULT_MODULES[plan].includes(moduleKey)
}

export function routeSegmentToModuleKey(segment: string): ModuleKey | null {
  const hit = MODULE_CATALOG.find((m) => m.routeSegment === segment)
  return hit ? hit.key : null
}


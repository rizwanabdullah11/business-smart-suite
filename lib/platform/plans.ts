export type SubscriptionPlan = "starter" | "growth" | "enterprise"

export type PlatformModuleKey =
  | "document-control"
  | "audit-management"
  | "risk-register"
  | "legal-register"
  | "objectives-targets"
  | "improvement-log"
  | "stakeholder-management"
  | "supplier-management"
  | "training-management"
  | "equipment-maintenance"
  | "business-environment"
  | "environmental-aspects"
  | "asset-management"
  | "it-risk-management"
  | "obligations-register"

export type PlatformModuleDefinition = {
  key: PlatformModuleKey
  label: string
  /** Module slugs in this codebase that are part of this platform module */
  slugs: string[]
  availableIn: SubscriptionPlan[]
  category:
    | "operations"
    | "compliance"
    | "strategy"
    | "performance"
    | "quality"
    | "supply-chain"
    | "people"
    | "security"
    | "environment"
    | "governance"
    | "risk"
}

export const PLATFORM_MODULES: PlatformModuleDefinition[] = [
  {
    key: "document-control",
    label: "Document Control",
    slugs: ["manual", "policies", "procedures", "forms", "certificate", "documents"],
    availableIn: ["starter", "growth", "enterprise"],
    category: "governance",
  },
  {
    key: "audit-management",
    label: "Audit Management",
    slugs: ["audit-schedule"],
    availableIn: ["starter", "growth", "enterprise"],
    category: "compliance",
  },
  {
    key: "risk-register",
    label: "Risk Register",
    slugs: ["risk-assessments"],
    availableIn: ["starter", "growth", "enterprise"],
    category: "risk",
  },
  {
    key: "legal-register",
    label: "Legal Register",
    slugs: ["legal-register"],
    availableIn: ["starter", "growth", "enterprise"],
    category: "compliance",
  },
  {
    key: "objectives-targets",
    label: "Objectives & Targets",
    slugs: ["objectives"],
    availableIn: ["starter", "growth", "enterprise"],
    category: "performance",
  },
  {
    key: "improvement-log",
    label: "Improvement Log (CAPA)",
    slugs: ["improvement-register"],
    availableIn: ["starter", "growth", "enterprise"],
    category: "quality",
  },
  {
    key: "stakeholder-management",
    label: "Stakeholder Management",
    slugs: ["interested-parties"],
    availableIn: ["growth", "enterprise"],
    category: "strategy",
  },
  {
    key: "supplier-management",
    label: "Supplier Management",
    slugs: ["suppliers"],
    availableIn: ["growth", "enterprise"],
    category: "supply-chain",
  },
  {
    key: "training-management",
    label: "Training Management",
    slugs: ["training"],
    availableIn: ["growth", "enterprise"],
    category: "people",
  },
  {
    key: "equipment-maintenance",
    label: "Equipment Maintenance",
    slugs: ["maintenance"],
    availableIn: ["growth", "enterprise"],
    category: "operations",
  },
  {
    key: "business-environment",
    label: "Business Environment (Context)",
    slugs: ["organisational-context"],
    availableIn: ["growth", "enterprise"],
    category: "strategy",
  },
  {
    key: "environmental-aspects",
    label: "Environmental Aspects",
    slugs: ["ims-aspects-impacts", "energy-consumption"],
    availableIn: ["growth", "enterprise"],
    category: "environment",
  },
  {
    key: "asset-management",
    label: "Asset Management",
    slugs: ["asset-management"],
    availableIn: ["growth", "enterprise"],
    category: "operations",
  },
  {
    key: "it-risk-management",
    label: "IT Risk Management",
    slugs: ["it-risk-management", "technical-file", "statement-of-applicability"],
    availableIn: ["enterprise"],
    category: "security",
  },
  {
    key: "obligations-register",
    label: "Obligations Register",
    slugs: ["obligations-register"],
    availableIn: ["enterprise"],
    category: "compliance",
  },
]

export function getDefaultEnabledModulesForPlan(plan: SubscriptionPlan): PlatformModuleKey[] {
  return PLATFORM_MODULES.filter((m) => m.availableIn.includes(plan)).map((m) => m.key)
}

export function moduleKeyForSlug(slug: string): PlatformModuleKey | null {
  const hit = PLATFORM_MODULES.find((m) => m.slugs.includes(slug))
  return hit?.key || null
}


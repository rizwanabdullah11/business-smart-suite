export const ROLE = {
  ADMIN: "Admin",
  ORGANIZATION: "Organization",
  EMPLOYEE: "Employee",
} as const

export type CanonicalRole = (typeof ROLE)[keyof typeof ROLE]

const roleMap: Record<string, CanonicalRole> = {
  admin: ROLE.ADMIN,
  administrator: ROLE.ADMIN,
  super_admin: ROLE.ADMIN,
  organization: ROLE.ORGANIZATION,
  org: ROLE.ORGANIZATION,
  manager: ROLE.ORGANIZATION,
  employee: ROLE.EMPLOYEE,
  user: ROLE.EMPLOYEE,
  employer: ROLE.EMPLOYEE,
  member: ROLE.EMPLOYEE,
}

export function normalizeRole(input?: string | null): CanonicalRole {
  const raw = (input || ROLE.EMPLOYEE).trim().toLowerCase()
  return roleMap[raw] || ROLE.EMPLOYEE
}

export function toClientRole(role: string): "admin" | "organization" | "employee" {
  const normalized = normalizeRole(role)
  if (normalized === ROLE.ADMIN) return "admin"
  if (normalized === ROLE.ORGANIZATION) return "organization"
  return "employee"
}

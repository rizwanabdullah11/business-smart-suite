// Role-based permission system types

export enum Role {
  ADMIN = "admin",
  EMPLOYEE = "employee",
  ORGANIZATION = "organization"
}

export enum Permission {
  // Core Management
  VIEW_DASHBOARD = "view:dashboard",
  VIEW_ANALYTICS = "view:analytics",
  
  // Manual Management
  VIEW_MANUALS = "view:manuals",
  CREATE_MANUAL = "create:manual",
  EDIT_MANUAL = "edit:manual",
  DELETE_MANUAL = "delete:manual",
  UPLOAD_MANUAL = "upload:manual",
  
  // Procedure Management
  VIEW_PROCEDURES = "view:procedures",
  CREATE_PROCEDURE = "create:procedure",
  EDIT_PROCEDURE = "edit:procedure",
  DELETE_PROCEDURE = "delete:procedure",
  ARCHIVE_PROCEDURE = "archive:procedure",
  
  // Policy Management
  VIEW_POLICIES = "view:policies",
  CREATE_POLICY = "create:policy",
  EDIT_POLICY = "edit:policy",
  DELETE_POLICY = "delete:policy",
  
  // Forms Management
  VIEW_FORMS = "view:forms",
  CREATE_FORM = "create:form",
  EDIT_FORM = "edit:form",
  DELETE_FORM = "delete:form",
  SUBMIT_FORM = "submit:form",
  
  // Certificate Management
  VIEW_CERTIFICATES = "view:certificates",
  CREATE_CERTIFICATE = "create:certificate",
  EDIT_CERTIFICATE = "edit:certificate",
  DELETE_CERTIFICATE = "delete:certificate",
  REVIEW_CERTIFICATE = "review:certificate",
  
  // Risk & Compliance
  VIEW_RISK_ASSESSMENTS = "view:risk_assessments",
  CREATE_RISK_ASSESSMENT = "create:risk_assessment",
  EDIT_RISK_ASSESSMENT = "edit:risk_assessment",
  DELETE_RISK_ASSESSMENT = "delete:risk_assessment",
  
  // COSHH Management
  VIEW_COSHH = "view:coshh",
  CREATE_COSHH = "create:coshh",
  EDIT_COSHH = "edit:coshh",
  DELETE_COSHH = "delete:coshh",
  
  // Audit Schedule
  VIEW_AUDIT_SCHEDULE = "view:audit_schedule",
  CREATE_AUDIT_SCHEDULE = "create:audit_schedule",
  EDIT_AUDIT_SCHEDULE = "edit:audit_schedule",
  DELETE_AUDIT_SCHEDULE = "delete:audit_schedule",
  REVIEW_AUDIT = "review:audit",
  
  // Improvement Register
  VIEW_IMPROVEMENTS = "view:improvements",
  CREATE_IMPROVEMENT = "create:improvement",
  EDIT_IMPROVEMENT = "edit:improvement",
  DELETE_IMPROVEMENT = "delete:improvement",
  
  // User Management
  VIEW_USERS = "view:users",
  CREATE_USER = "create:user",
  EDIT_USER = "edit:user",
  DELETE_USER = "delete:user",
  MANAGE_ROLES = "manage:roles",
  
  // Organization Management
  VIEW_ORGANIZATION = "view:organization",
  EDIT_ORGANIZATION = "edit:organization",
  MANAGE_ORGANIZATION_SETTINGS = "manage:organization_settings",
  
  // Category Management
  VIEW_CATEGORIES = "view:categories",
  CREATE_CATEGORY = "create:category",
  EDIT_CATEGORY = "edit:category",
  DELETE_CATEGORY = "delete:category",
}

export type PermissionMap = {
  [key in Role]: Permission[]
}

// Define permissions for each role
export const ROLE_PERMISSIONS: PermissionMap = {
  [Role.ADMIN]: [
    // Admin has ALL permissions
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_MANUALS,
    Permission.CREATE_MANUAL,
    Permission.EDIT_MANUAL,
    Permission.DELETE_MANUAL,
    Permission.UPLOAD_MANUAL,
    Permission.VIEW_PROCEDURES,
    Permission.CREATE_PROCEDURE,
    Permission.EDIT_PROCEDURE,
    Permission.DELETE_PROCEDURE,
    Permission.ARCHIVE_PROCEDURE,
    Permission.VIEW_POLICIES,
    Permission.CREATE_POLICY,
    Permission.EDIT_POLICY,
    Permission.DELETE_POLICY,
    Permission.VIEW_FORMS,
    Permission.CREATE_FORM,
    Permission.EDIT_FORM,
    Permission.DELETE_FORM,
    Permission.SUBMIT_FORM,
    Permission.VIEW_CERTIFICATES,
    Permission.CREATE_CERTIFICATE,
    Permission.EDIT_CERTIFICATE,
    Permission.DELETE_CERTIFICATE,
    Permission.REVIEW_CERTIFICATE,
    Permission.VIEW_RISK_ASSESSMENTS,
    Permission.CREATE_RISK_ASSESSMENT,
    Permission.EDIT_RISK_ASSESSMENT,
    Permission.DELETE_RISK_ASSESSMENT,
    Permission.VIEW_COSHH,
    Permission.CREATE_COSHH,
    Permission.EDIT_COSHH,
    Permission.DELETE_COSHH,
    Permission.VIEW_AUDIT_SCHEDULE,
    Permission.CREATE_AUDIT_SCHEDULE,
    Permission.EDIT_AUDIT_SCHEDULE,
    Permission.DELETE_AUDIT_SCHEDULE,
    Permission.REVIEW_AUDIT,
    Permission.VIEW_IMPROVEMENTS,
    Permission.CREATE_IMPROVEMENT,
    Permission.EDIT_IMPROVEMENT,
    Permission.DELETE_IMPROVEMENT,
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
    Permission.MANAGE_ROLES,
    Permission.VIEW_ORGANIZATION,
    Permission.EDIT_ORGANIZATION,
    Permission.MANAGE_ORGANIZATION_SETTINGS,
    Permission.VIEW_CATEGORIES,
    Permission.CREATE_CATEGORY,
    Permission.EDIT_CATEGORY,
    Permission.DELETE_CATEGORY,
  ],
  
  [Role.ORGANIZATION]: [
    // Organization can manage most content but not users/roles
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_MANUALS,
    Permission.CREATE_MANUAL,
    Permission.EDIT_MANUAL,
    Permission.DELETE_MANUAL,
    Permission.UPLOAD_MANUAL,
    Permission.VIEW_PROCEDURES,
    Permission.CREATE_PROCEDURE,
    Permission.EDIT_PROCEDURE,
    Permission.DELETE_PROCEDURE,
    Permission.ARCHIVE_PROCEDURE,
    Permission.VIEW_POLICIES,
    Permission.CREATE_POLICY,
    Permission.EDIT_POLICY,
    Permission.DELETE_POLICY,
    Permission.VIEW_FORMS,
    Permission.CREATE_FORM,
    Permission.EDIT_FORM,
    Permission.DELETE_FORM,
    Permission.SUBMIT_FORM,
    Permission.VIEW_CERTIFICATES,
    Permission.CREATE_CERTIFICATE,
    Permission.EDIT_CERTIFICATE,
    Permission.REVIEW_CERTIFICATE,
    Permission.VIEW_RISK_ASSESSMENTS,
    Permission.CREATE_RISK_ASSESSMENT,
    Permission.EDIT_RISK_ASSESSMENT,
    Permission.VIEW_COSHH,
    Permission.CREATE_COSHH,
    Permission.EDIT_COSHH,
    Permission.VIEW_AUDIT_SCHEDULE,
    Permission.CREATE_AUDIT_SCHEDULE,
    Permission.EDIT_AUDIT_SCHEDULE,
    Permission.REVIEW_AUDIT,
    Permission.VIEW_IMPROVEMENTS,
    Permission.CREATE_IMPROVEMENT,
    Permission.EDIT_IMPROVEMENT,
    Permission.VIEW_ORGANIZATION,
    Permission.EDIT_ORGANIZATION,
    Permission.VIEW_CATEGORIES,
    Permission.CREATE_CATEGORY,
    Permission.EDIT_CATEGORY,
    // Organization can manage their employees
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
  ],
  
  [Role.EMPLOYEE]: [
    // Employee: view modules, create own tasks & categories, edit own work (API enforces scope)
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_MANUALS,
    Permission.CREATE_MANUAL,
    Permission.EDIT_MANUAL,
    Permission.UPLOAD_MANUAL,
    Permission.VIEW_PROCEDURES,
    Permission.VIEW_POLICIES,
    Permission.VIEW_FORMS,
    Permission.SUBMIT_FORM,
    Permission.VIEW_CERTIFICATES,
    Permission.VIEW_RISK_ASSESSMENTS,
    Permission.VIEW_COSHH,
    Permission.VIEW_AUDIT_SCHEDULE,
    Permission.VIEW_IMPROVEMENTS,
    Permission.VIEW_CATEGORIES,
    Permission.CREATE_CATEGORY,
    Permission.EDIT_CATEGORY,
  ],
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  organizationId?: string
}

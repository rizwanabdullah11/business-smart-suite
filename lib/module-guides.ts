/**
 * In-app "How to use" guides for every module.
 *
 * Keyed by the first URL segment (e.g. /manual, /risk-assessments).
 * Edit the text here to change what users see — no other code changes needed.
 */

export type ModuleGuide = {
  title: string
  /** One or two sentences: what the module is for */
  purpose: string
  /** Related ISO clause / regulation */
  isoRef?: string
  /** Step-by-step: how to use this module */
  steps: string[]
  /** Practical tips / what auditors look for */
  tips?: string[]
  /** Example entries to help users get started */
  examples?: string[]
}

/** Actions that work the same in every module list page */
export const COMMON_ACTIONS: string[] = [
  "Add Category — group related items (e.g. by department, site or topic). Tap ✨ Suggest with AI for category names that fit your business.",
  "Add New / + on a category — create an item. Tap ✨ Suggest with AI under the title for ideas based on your business profile.",
  "Tabs on each category — Active, Done (completed), Starred (highlighted) and Archived.",
  "Archive instead of delete — archived items stay as history for auditors and can be restored.",
  "Insights — see totals and ask the AI to summarise an item or a whole category.",
]

/** What the tabs mean when you open a single item */
export const ITEM_PAGE_GUIDE: string[] = [
  "Details — the main information. Use Edit to change it.",
  "Document — upload the file (PDF, Word, image) and preview it.",
  "Version history — record each new issue (version, date, what changed). Auditors check this.",
  "Reviews — set the next review date and who reviews it. Overdue reviews show in red.",
  "Permissions — choose which employees can see or edit this item.",
  "Audits — link the item to audits that checked it.",
]

export const MODULE_GUIDES: Record<string, ModuleGuide> = {
  dashboard: {
    title: "Dashboard",
    purpose: "Your home screen: every module you have access to, plus quick stats on documents, approvals and reviews.",
    steps: [
      "Admins: pick the organization in the company selector at the top first — everything you see follows that choice.",
      "Set up your Business Profile (menu → Business Profile (AI)) so AI suggestions match your business.",
      "Open a module tile to start adding records. Start with Organisational Context, Interested Parties and Policies.",
      "Check the stats for pending reviews and overdue items every week.",
    ],
    tips: ["Modules you don't see are not in your plan or not enabled for your account."],
  },
  "business-profile": {
    title: "Business Profile (AI)",
    purpose: "Tells the AI what your business does, so every module suggests titles and categories that fit you.",
    steps: [
      "Describe the business: services, customers, areas covered, equipment, vehicles, staff and ISO goals.",
      "Or upload a document about the business (PDF, .txt or .md). For Word files, save as PDF first.",
      "Tap Create / Update profile with AI and check the summary it produces.",
      "Update it whenever your services, equipment or locations change.",
    ],
    tips: ["The more specific the description, the better the suggestions in every module."],
  },
  manual: {
    title: "Manuals",
    purpose: "Your controlled manuals — the main documents that describe how the business and its management system work.",
    isoRef: "ISO 9001 clause 4.3 (scope) and 7.5 (documented information)",
    steps: [
      "Create categories such as Quality, Operations and Health & Safety.",
      "Add a manual with a clear title, version (e.g. v1.0), location and issue date.",
      "Open the manual and upload the document file.",
      "Record every new issue in Version history and set a yearly review date.",
    ],
    tips: ["Auditors expect one current version only — archive old versions rather than deleting them."],
    examples: ["Quality Management System Manual", "Operations Manual", "Health & Safety Manual"],
  },
  policies: {
    title: "Policies",
    purpose: "Top-level policy statements signed off by management (quality, environment, health & safety, data).",
    isoRef: "ISO 9001 / 14001 / 45001 / 27001 clause 5.2",
    steps: [
      "Create categories for each policy area.",
      "Add the policy, upload the signed copy and set the version and issue date.",
      "Set a review date (usually every 12 months) in Reviews.",
      "Share it with staff using Permissions so everyone can read it.",
    ],
    tips: ["Policies must be signed and dated by top management and communicated to staff."],
    examples: ["Quality Policy", "Health & Safety Policy", "Environmental Policy", "Data Protection Policy"],
  },
  procedures: {
    title: "Procedures",
    purpose: "Step-by-step descriptions of how key processes are done, who does them and what records are kept.",
    isoRef: "ISO 9001 clause 4.4, 7.5 and 8.1",
    steps: [
      "Group procedures by process (Operations, Sales, Purchasing, HR…).",
      "Add each procedure with an owner, version and issue date.",
      "Upload the procedure document and link related forms.",
      "Review after any process change or incident.",
    ],
    examples: ["Document Control Procedure", "Complaint Handling Procedure", "Internal Audit Procedure"],
  },
  forms: {
    title: "Forms",
    purpose: "Blank forms, checklists and templates staff fill in — the completed forms become your evidence.",
    isoRef: "ISO 9001 clause 7.5.3 (control of records)",
    steps: [
      "Create categories such as Checklists, Inspections and HR Forms.",
      "Add the form with a form number and version.",
      "Upload the blank template so staff always use the latest copy.",
    ],
    examples: ["Daily Equipment Checklist", "Job Completion Form", "Incident Report Form"],
  },
  certificate: {
    title: "Certificates",
    purpose: "Insurance, licences, accreditations, ISO certificates and staff qualifications — with expiry tracking.",
    steps: [
      "Add each certificate with its issue date and expiry date.",
      "Upload a scan or PDF of the certificate.",
      "The system emails a reminder before a certificate expires — keep expiry dates accurate.",
      "When renewed, upload the new copy and update the expiry date.",
    ],
    tips: ["Expired insurance or licences are a common audit finding — check this list monthly."],
    examples: ["Public Liability Insurance", "Waste Carrier Licence", "ISO 9001 Certificate"],
  },
  "business-continuity": {
    title: "Business Continuity",
    purpose: "Plans for keeping the business running when something goes wrong (IT failure, staff absence, bad weather, supplier failure).",
    isoRef: "ISO 22301; ISO 27001 Annex A 5.29–5.30",
    steps: [
      "Add a plan for each disruption scenario.",
      "Record who is responsible, the steps to recover and target recovery time.",
      "Test the plan at least once a year and record the result.",
    ],
    examples: ["IT System Outage Plan", "Key Staff Absence Plan", "Vehicle Breakdown Plan"],
  },
  "management-reviews": {
    title: "Management Reviews",
    purpose: "Records of top-management meetings that review how well the management system is working.",
    isoRef: "ISO 9001 clause 9.3",
    steps: [
      "Add a review for each meeting (quarterly or yearly).",
      "Cover: audit results, customer feedback, objectives, risks, supplier performance and improvement actions.",
      "Upload the minutes and record decisions and actions.",
      "Add actions to the Improvement Register so they are tracked.",
    ],
    tips: ["Auditors always ask for the latest management review minutes."],
  },
  "job-descriptions": {
    title: "Job Descriptions",
    purpose: "Roles, responsibilities and required skills for each position.",
    isoRef: "ISO 9001 clause 5.3 (roles) and 7.2 (competence)",
    steps: [
      "Group by department.",
      "Add each role with its responsibilities and required qualifications.",
      "Link required training to the Training module.",
    ],
    examples: ["Operations Manager", "Field Technician", "Office Administrator"],
  },
  "work-instructions": {
    title: "Work Instructions",
    purpose: "Detailed task-level instructions for frontline staff — more detailed than a procedure.",
    isoRef: "ISO 9001 clause 8.5.1",
    steps: [
      "Group by equipment or task.",
      "Add the instruction and upload photos or a step-by-step document.",
      "Review whenever equipment or methods change.",
    ],
    examples: ["Equipment Set-Up", "End-of-Job Clean Down", "Vehicle Loading"],
  },
  "risk-assessments": {
    title: "Risk Assessments",
    purpose: "Identify hazards, who could be harmed, the controls in place and the remaining risk level.",
    isoRef: "ISO 45001 clause 6.1.2; ISO 9001 clause 6.1",
    steps: [
      "Group by activity or location (Site Safety, Equipment, Vehicles, Office).",
      "Add an assessment for each activity and upload the completed form.",
      "Score likelihood × severity before and after controls.",
      "Review yearly, after an incident, or when the work changes.",
    ],
    tips: ["Make sure staff doing the work have read the assessment — use Permissions to share it."],
    examples: ["Manual Handling", "Lone Working", "Vehicle Use"],
  },
  coshh: {
    title: "COSHH",
    purpose: "Assessments for hazardous substances (chemicals, fuels, dusts) used in the business.",
    isoRef: "COSHH Regulations 2002; ISO 45001 clause 6.1.2",
    steps: [
      "Add an assessment for each substance you use.",
      "Upload the supplier's Safety Data Sheet (SDS).",
      "Record hazards, PPE, storage, spill and first-aid measures.",
      "Review when the product or supplier changes.",
    ],
    examples: ["Detergents", "Biocides", "Fuels & Oils"],
  },
  "technical-file": {
    title: "Technical File",
    purpose: "Technical documents for your products or equipment: specifications, manuals, test and inspection records.",
    steps: [
      "Group by product or equipment.",
      "Upload specifications, user manuals and test certificates.",
      "Keep revisions in Version history.",
    ],
  },
  "ims-aspects-impacts": {
    title: "Environmental Aspects & Impacts",
    purpose: "How your activities affect the environment (emissions, waste, water, noise) and how significant each impact is.",
    isoRef: "ISO 14001 clause 6.1.2",
    steps: [
      "List each activity and its environmental aspect (e.g. vehicle use → fuel emissions).",
      "Score the impact and mark significant ones.",
      "Set controls or objectives for significant impacts.",
      "Review yearly.",
    ],
    examples: ["Vehicle Fuel Emissions", "Waste Disposal", "Electricity Use"],
  },
  "audit-schedule": {
    title: "Audit Schedule",
    purpose: "Plan and run internal and external audits, record findings and track them to closure.",
    isoRef: "ISO 9001 clause 9.2",
    steps: [
      "Add an audit with the process or clause being checked, the date and the auditor.",
      "Open the audit → Workflow: assign the auditor and the person responsible.",
      "The auditor records issues; the responsible person fixes them and adds evidence.",
      "The auditor reviews the fixes and marks the audit Completed.",
    ],
    tips: ["Plan audits so every process is covered at least once a year."],
  },
  "interested-parties": {
    title: "Interested Parties",
    purpose: "The people and organizations that affect or are affected by your business, and what they expect from you.",
    isoRef: "ISO 9001 clause 4.2",
    steps: [
      "Add each party (customers, staff, suppliers, regulators, insurers, neighbours).",
      "Record their needs and expectations and how you meet them.",
      "Review yearly or when the business changes.",
    ],
  },
  "organisational-context": {
    title: "Organisational Context",
    purpose: "Internal and external issues that affect your business (e.g. SWOT or PESTLE).",
    isoRef: "ISO 9001 clause 4.1",
    steps: [
      "Add each issue and mark it internal or external.",
      "Note how it affects the business and what you do about it.",
      "Link big risks to Risk Assessments and big opportunities to Objectives.",
    ],
    examples: ["Seasonal demand", "Rising fuel costs", "Skilled staff shortage"],
  },
  objectives: {
    title: "Objectives",
    purpose: "Measurable goals for quality, safety, environment or the business, with owners and target dates.",
    isoRef: "ISO 9001 clause 6.2",
    steps: [
      "Add each objective with a measurable target (e.g. 95% on-time jobs).",
      "Set an owner and a target date.",
      "Update progress regularly and review in Management Reviews.",
    ],
    tips: ["Good objectives are SMART: specific, measurable, achievable, relevant, time-bound."],
  },
  maintenance: {
    title: "Maintenance",
    purpose: "Planned servicing and inspection of equipment, vehicles and premises.",
    isoRef: "ISO 9001 clause 7.1.3 (infrastructure)",
    steps: [
      "Add each asset's maintenance task with its frequency and next due date.",
      "Upload service reports, MOTs and inspection certificates.",
      "Mark the task Done when completed and set the next date.",
    ],
    examples: ["Vehicle annual service", "Equipment monthly inspection", "PAT testing"],
  },
  "improvement-register": {
    title: "Improvement Register",
    purpose: "Track problems, complaints and ideas through to a fix — corrective and preventive actions (CAPA).",
    isoRef: "ISO 9001 clause 10.2 and 10.3",
    steps: [
      "Add the issue: what happened, where it came from (audit, complaint, incident).",
      "Find the root cause and record the action to fix it.",
      "Set an owner and due date.",
      "Check the fix worked, then mark it Done.",
    ],
    tips: ["Auditors check that actions are closed and that you checked they worked."],
  },
  "statement-of-applicability": {
    title: "Statement of Applicability",
    purpose: "The ISO 27001 Annex A controls, whether each applies to you, why, and how it is implemented.",
    isoRef: "ISO 27001 clause 6.1.3 d)",
    steps: [
      "Add each Annex A control (grouped as Organisational, People, Physical, Technological).",
      "Mark it applicable or not and give the reason.",
      "Describe how it is implemented and link evidence.",
    ],
  },
  "legal-register": {
    title: "Legal Register",
    purpose: "The laws and regulations that apply to your business and how you comply with each.",
    isoRef: "ISO 14001 / 45001 clause 6.1.3 and 9.1.2",
    steps: [
      "Add each law (e.g. Health and Safety at Work etc. Act 1974).",
      "Summarise what it requires from you and how you comply.",
      "Upload evidence and review yearly or when the law changes.",
    ],
    tips: ["Use ✨ Suggest with AI to find laws relevant to your industry, then check each one."],
  },
  suppliers: {
    title: "Suppliers",
    purpose: "Your approved suppliers and subcontractors, with evaluations and documents.",
    isoRef: "ISO 9001 clause 8.4",
    steps: [
      "Add each supplier with what they supply and contact details.",
      "Upload insurance, certificates and contracts.",
      "Rate performance at least yearly and record the result.",
    ],
  },
  training: {
    title: "Training",
    purpose: "Training courses and records showing staff are competent for their job.",
    isoRef: "ISO 9001 clause 7.2 and 7.3",
    steps: [
      "Add each training course and who needs it.",
      "Record attendance and upload certificates for each employee.",
      "Set refresher dates for training that expires.",
      "Use Skills to see gaps by employee.",
    ],
    examples: ["New Starter Induction", "Manual Handling", "First Aid at Work"],
  },
  "energy-consumption": {
    title: "Energy Consumption",
    purpose: "Readings for electricity, gas, water and fuel so you can track use and set reduction targets.",
    isoRef: "ISO 50001; ISO 14001 clause 9.1",
    steps: [
      "Add a reading for each meter or fuel type every month.",
      "Upload bills or fuel receipts as evidence.",
      "Compare months and set targets in Objectives.",
    ],
  },
  "customer-feedback": {
    title: "Customer Feedback",
    purpose: "Compliments, complaints and suggestions from customers.",
    isoRef: "ISO 9001 clause 9.1.2",
    steps: [
      "Log every piece of feedback with the date and customer.",
      "For complaints, record the response and add an Improvement Register action if needed.",
      "Review trends in Management Reviews.",
    ],
  },
  "asset-management": {
    title: "Asset Management",
    purpose: "Register of company assets — equipment, vehicles and IT — with owners and condition.",
    isoRef: "ISO 27001 Annex A 5.9 (inventory of assets)",
    steps: [
      "Add each asset with an ID, owner and location.",
      "Link maintenance tasks to the Maintenance module.",
      "Archive assets that are sold or disposed of.",
    ],
  },
  "it-risk-management": {
    title: "IT Risk Management",
    purpose: "Information security and IT risks, with controls and owners.",
    isoRef: "ISO 27001 clause 6.1.2 and 8.2",
    steps: [
      "Add each risk (e.g. phishing, data loss, lost phone).",
      "Score likelihood and impact, and record controls.",
      "Review after any security incident.",
    ],
  },
  "obligations-register": {
    title: "Obligations Register",
    purpose: "Compliance obligations beyond the law: contracts, customer requirements, codes of practice and accreditation rules.",
    isoRef: "ISO 14001 clause 6.1.3",
    steps: [
      "Add each obligation and where it comes from.",
      "Record how you meet it and who is responsible.",
      "Review yearly.",
    ],
  },
}

/** API slugs used in /task/<module>/<id> URLs → guide key */
const SLUG_ALIASES: Record<string, string> = {
  manuals: "manual",
  certificates: "certificate",
}

/**
 * Work out which guide to show for a URL.
 * /risk-assessments → risk-assessments; /policies/123 → policies (item page);
 * /task/manuals/123 → manual (item page).
 */
export function getGuideForPath(pathname: string | null): { key: string; guide: ModuleGuide; isItemPage: boolean } | null {
  if (!pathname) return null
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 0) return null

  let key = segments[0]
  let isItemPage = segments.length > 1 && !["new", "skills", "analytics"].includes(segments[1])
  if (key === "task" && segments[1]) {
    key = segments[1]
    isItemPage = true
  }
  key = SLUG_ALIASES[key] || key

  const guide = MODULE_GUIDES[key]
  return guide ? { key, guide, isItemPage } : null
}

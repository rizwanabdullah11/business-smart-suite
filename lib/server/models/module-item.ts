import mongoose, { Schema, type Model } from "mongoose"

const ALLOWED_MODULES = new Set([
  "policies",
  "procedures",
  "forms",
  "certificates",
  "tasks",
])

export function isSupportedModule(module: string) {
  return ALLOWED_MODULES.has(module)
}

function toModelName(module: string) {
  return `${module.charAt(0).toUpperCase()}${module.slice(1)}Item`
}

const moduleItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    version: { type: String, default: "v1.0" },
    location: { type: String, default: "N/A" },
    issueDate: { type: Schema.Types.Mixed, default: () => new Date().toISOString().split("T")[0] },
    expiryDate: { type: Schema.Types.Mixed, default: null },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    highlighted: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    paused: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    strict: false,
  }
)

moduleItemSchema.pre("save", function syncCategory(next) {
  if (!this.category && this.categoryId) this.category = this.categoryId
  if (!this.categoryId && this.category) this.categoryId = this.category
  next()
})

export function getModuleModel(module: string): Model<mongoose.Document> {
  const modelName = toModelName(module)
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName] as Model<mongoose.Document>
  }
  return mongoose.model<mongoose.Document>(modelName, moduleItemSchema, module)
}

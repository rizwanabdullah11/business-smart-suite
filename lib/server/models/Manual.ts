import mongoose, { Schema, type Model } from "mongoose"

export interface IManual extends mongoose.Document {
  title: string
  version?: string
  location?: string
  issueDate?: string | Date
  category?: mongoose.Types.ObjectId
  categoryId?: mongoose.Types.ObjectId
  highlighted: boolean
  approved: boolean
  paused: boolean
  archived: boolean
  isArchived: boolean
  fileName?: string
  fileType?: string
  fileSize?: number
  createdAt: Date
  updatedAt: Date
}

const manualSchema = new Schema<IManual>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: String,
      default: "v1.0",
    },
    location: {
      type: String,
      default: "QMS",
    },
    issueDate: {
      type: Schema.Types.Mixed,
      default: () => new Date().toISOString().split("T")[0],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    highlighted: {
      type: Boolean,
      default: false,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    paused: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    fileName: String,
    fileType: String,
    fileSize: Number,
  },
  {
    timestamps: true,
    strict: false,
  }
)

manualSchema.pre("save", function manualPreSave(next) {
  if (!this.category && this.categoryId) {
    this.category = this.categoryId
  }
  if (!this.categoryId && this.category) {
    this.categoryId = this.category
  }
  next()
})

const Manual: Model<IManual> =
  mongoose.models.Manual || mongoose.model<IManual>("Manual", manualSchema)

export default Manual

import mongoose, { Schema, type Model } from "mongoose"

export interface ICategory extends mongoose.Document {
  name: string
  type?: string
  archived: boolean
  isArchived: boolean
  highlighted: boolean
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: "manual",
      trim: true,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    highlighted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
)

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema)

export default Category

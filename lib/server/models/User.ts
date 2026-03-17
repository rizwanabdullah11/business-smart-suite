import mongoose, { Schema, type Model } from "mongoose"
import { normalizeRole, ROLE } from "../utils/roles"

export interface IUser extends mongoose.Document {
  name: string
  email: string
  password: string
  role: string
  organizationId?: mongoose.Types.ObjectId | null
  organizationName?: string | null
  organizationEmail?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [ROLE.ADMIN, ROLE.ORGANIZATION, ROLE.EMPLOYEE, "User"],
      default: ROLE.EMPLOYEE,
      set: (value: string) => normalizeRole(value),
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    organizationName: {
      type: String,
      default: null,
    },
    organizationEmail: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

userSchema.pre("save", function userPreSave() {
  this.email = this.email.toLowerCase().trim()
  this.role = normalizeRole(this.role)
})

userSchema.pre("validate", function userPreValidate() {
  const role = normalizeRole(this.role)
  if (role === ROLE.EMPLOYEE && !this.organizationId) {
    this.invalidate("organizationId", "organizationId is required for Employee/User role")
  }
})

userSchema.methods.toJSON = function userToJSON() {
  const data = this.toObject()
  delete data.password
  return data
}

if (process.env.NODE_ENV === "development" && mongoose.models.User) {
  mongoose.deleteModel("User")
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema)

export default User

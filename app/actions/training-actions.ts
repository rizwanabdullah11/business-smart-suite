"use server"

import mongoose from "mongoose"
import { revalidatePath } from "next/cache"
import { connectToDatabase } from "@/lib/server/db"
import { getModuleModel } from "@/lib/server/models/module-item"

function normalizeSkill(row: any) {
  return {
    id: String(row?._id || row?.id || ""),
    name: String(row?.name || row?.title || ""),
    description: String(row?.description || ""),
    frequencyDays: Number(row?.frequencyDays || 0),
    departments: Array.isArray(row?.departments) ? row.departments : [],
    mandatory: Boolean(row?.mandatory),
  }
}

export async function getSkills() {
  try {
    await connectToDatabase()
    const Model = getModuleModel("training")
    const rows = await Model.find({ kind: "skill" } as any).sort({ createdAt: -1 }).lean()
    return { success: true, data: rows.map(normalizeSkill) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error", data: [] }
  }
}

export async function createSkill(data: any) {
  try {
    await connectToDatabase()
    const Model = getModuleModel("training")
    const created = await Model.create({
      kind: "skill",
      title: String(data?.name || ""),
      name: String(data?.name || ""),
      description: String(data?.description || ""),
      frequencyDays: Number(data?.frequencyDays || 0),
      departments: Array.isArray(data?.departments) ? data.departments : [],
      mandatory: String(data?.mandatory || "No").toLowerCase() === "yes",
    } as any)
    revalidatePath("/training/skills")
    return { success: true, data: normalizeSkill(created) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateSkill(id: string, data: any) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return { success: false, error: "Invalid skill id" }
    await connectToDatabase()
    const Model = getModuleModel("training")
    const updated = await Model.findByIdAndUpdate(
      id,
      {
        $set: {
          title: String(data?.name || ""),
          name: String(data?.name || ""),
          description: String(data?.description || ""),
          frequencyDays: Number(data?.frequencyDays || 0),
          departments: Array.isArray(data?.departments) ? data.departments : [],
          mandatory: String(data?.mandatory || "No").toLowerCase() === "yes",
        },
      },
      { new: true }
    ).lean()
    if (!updated) return { success: false, error: "Skill not found" }
    revalidatePath("/training/skills")
    return { success: true, data: normalizeSkill(updated) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function deleteSkill(id: string) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return { success: false, error: "Invalid skill id" }
    await connectToDatabase()
    const Model = getModuleModel("training")
    await Model.findByIdAndDelete(id)
    revalidatePath("/training/skills")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getEmployee(id: string) {
  return { success: false, data: null, error: `Legacy getEmployee not implemented for id ${id}` }
}

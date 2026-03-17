"use server"

import mongoose from "mongoose"
import { revalidatePath } from "next/cache"
import { connectToDatabase } from "@/lib/server/db"
import { getModuleModel } from "@/lib/server/models/module-item"

function normalizeSupplier(row: any) {
  const id = String(row?._id || row?.id || "")
  const fallbackDocument =
    row?.fileData || row?.fileName
      ? [
          {
            id: `${id}-file`,
            title: row?.fileName || row?.title || "Document",
            fileType: row?.fileType || "application/octet-stream",
            size: Number(row?.fileSize || 0),
            uploadedAt: row?.updatedAt || row?.createdAt || new Date().toISOString(),
          },
        ]
      : []

  return {
    id,
    name: row?.title || row?.name || "Supplier",
    documents: Array.isArray(row?.documents) ? row.documents : fallbackDocument,
  }
}

export async function getSupplier(id: string) {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Invalid supplier id" }
    }

    await connectToDatabase()
    const Model = getModuleModel("suppliers")
    const row = await Model.findById(id).lean()
    if (!row) return { success: false, error: "Supplier not found" }
    return { success: true, data: normalizeSupplier(row) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function uploadSupplierDocument(supplierId: string, formData: FormData) {
  try {
    if (!supplierId || !mongoose.Types.ObjectId.isValid(supplierId)) {
      return { success: false, error: "Invalid supplier id" }
    }

    const file = formData.get("file")
    if (!(file instanceof File)) {
      return { success: false, error: "File is required" }
    }

    const notes = String(formData.get("notes") || "")
    const expiryDate = String(formData.get("expiryDate") || "")
    const arrayBuffer = await file.arrayBuffer()
    const fileData = Buffer.from(arrayBuffer).toString("base64")

    await connectToDatabase()
    const Model = getModuleModel("suppliers")
    const existing = await Model.findById(supplierId).lean()
    if (!existing) return { success: false, error: "Supplier not found" }

    const document = {
      id: new mongoose.Types.ObjectId().toString(),
      title: file.name,
      fileType: file.type || "application/octet-stream",
      size: file.size,
      uploadedAt: new Date().toISOString(),
      notes,
      expiryDate: expiryDate || null,
    }

    const documents = Array.isArray((existing as any).documents) ? [...(existing as any).documents, document] : [document]

    await Model.findByIdAndUpdate(supplierId, {
      $set: {
        documents,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        fileData,
      },
    })

    revalidatePath(`/suppliers/${supplierId}/documents`)
    return { success: true, data: document }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

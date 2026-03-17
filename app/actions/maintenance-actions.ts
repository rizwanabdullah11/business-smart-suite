"use server"

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export async function uploadMaintenanceDocument(
  _maintenanceId: string,
  _formData: FormData
): Promise<ActionResult> {
  return { success: true }
}

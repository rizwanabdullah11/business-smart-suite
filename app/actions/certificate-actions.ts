"use server"

type ActionResult = {
  success: boolean
  error?: string
}

export async function addCertificateReview(
  _certificateId: string,
  _payload: {
    details: string
    reviewDate: Date
    nextReviewDate?: Date
    reviewedBy: string
  }
): Promise<ActionResult> {
  return { success: true }
}

export async function deleteCertificateReview(_reviewId: string): Promise<ActionResult> {
  return { success: true }
}

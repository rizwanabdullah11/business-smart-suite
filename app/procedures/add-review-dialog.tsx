"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { addProcedureReview } from "@/app/actions/procedure-actions"
import { useRouter } from "next/navigation"

interface AddReviewDialogProps {
  procedureId: string
  canEdit: boolean
}

export function AddReviewDialog({ procedureId, canEdit }: AddReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewerName, setReviewerName] = useState("")
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split("T")[0])
  const [nextReviewDate, setNextReviewDate] = useState("")
  const [details, setDetails] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return

    setIsSubmitting(true)
    try {
      const form = new FormData()
      form.append("details", details)
      form.append("reviewDate", reviewDate)
      if (nextReviewDate) {
        form.append("nextReviewDate", nextReviewDate)
      }
      form.append("reviewerName", reviewerName)

      const result = await addProcedureReview(procedureId, form)
      if (result.success) {
        toast.success("Review added successfully")
        setOpen(false)
        // reset form
        setReviewerName("")
        setReviewDate(new Date().toISOString().split("T")[0])
        setNextReviewDate("")
        setDetails("")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to add review")
      }
    } catch (error) {
      toast.error("An error occurred while adding the review")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canEdit) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reviewerName">Reviewer Name</Label>
            <Input
              id="reviewerName"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Enter reviewer name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Review Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter review details"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reviewDate">Review Date</Label>
            <Input
              id="reviewDate"
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nextReviewDate">Next Review Date (Optional)</Label>
            <Input
              id="nextReviewDate"
              type="date"
              value={nextReviewDate}
              onChange={(e) => setNextReviewDate(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
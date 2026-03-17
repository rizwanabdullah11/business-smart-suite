"use client"

import Link from "next/link"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/Button"

type AuditDocument = {
  id: string
  title?: string
}

interface AuditDocumentListProps {
  documents: AuditDocument[]
  auditId: string
  canEdit?: boolean
}

export default function AuditDocumentList({ documents, auditId, canEdit }: AuditDocumentListProps) {
  if (!documents?.length) {
    return <div className="rounded-md border p-4 text-sm text-muted-foreground">No documents found.</div>
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((document) => (
            <tr key={document.id}>
              <td className="px-4 py-3">{document.title || "Untitled document"}</td>
              <td className="px-4 py-3 text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/audit-schedule/${auditId}/documents/${document.id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Open
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {canEdit ? null : null}
    </div>
  )
}

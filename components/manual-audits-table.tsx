"use client"

export default function ManualAuditsTable({ manualId }: { manualId: string }) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Audit History</h3>
      <p className="text-sm text-gray-500">No audit records available.</p>
    </div>
  )
}

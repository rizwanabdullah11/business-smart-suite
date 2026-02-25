"use client"

import { useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/use-permissions"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user, loading } = usePermissions()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            403 - Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this resource.
          </p>
        </div>

        {user && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">User:</span> {user.name}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Role:</span>{" "}
              <span className="capitalize">{user.role}</span>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If you believe you should have access to this resource, please contact your
            administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

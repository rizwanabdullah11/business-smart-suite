// Static auth functions - no database
export async function hasPermission(action: string, resource: string): Promise<boolean> {
  // For static pages, always return true
  return true
}

export async function getUser() {
  // Return a mock user for static pages
  return {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    role: "admin"
  }
}

export async function isAuthenticated(): Promise<boolean> {
  // For static pages, always return true
  return true
}

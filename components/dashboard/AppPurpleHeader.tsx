"use client"

import { useState } from "react"
import { Search, HelpCircle } from "lucide-react"
import { CompanySelector } from "@/components/dashboard/CompanySelector"
import { UserNav } from "@/components/dashboard/UserNav"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui"
import { useRouter } from "next/navigation"

type AppPurpleHeaderProps = {
  user: { name?: string; email?: string; role?: string } | null
  onLogout: () => void | Promise<void>
}

interface SearchResult {
  id: string
  title: string
  type: string
  href: string
  section: string
}

/** Fixed purple gradient header — matches home / marketing style on every screen */
export function AppPurpleHeader({ user, onLogout }: AppPurpleHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error("Search failed")
      const results = await response.json()
      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-40 shadow-none">
      <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-4 flex justify-between items-center relative overflow-hidden border-0 shadow-none">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.2),transparent_50%)]"></div>

        <div className="flex items-center relative z-10">
          <CompanySelector />
        </div>

        <div className="flex items-center gap-4 relative z-10">
          {/* Search Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 backdrop-blur-sm">
                <Search className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-3xl bg-white">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl font-bold text-gray-900">Search</DialogTitle>
              </DialogHeader>
              <div className="relative mb-4">
                <Input
                  placeholder="Search across all sections..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleSearch(e.target.value)
                  }}
                  className="h-14 text-base rounded-2xl border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder:text-gray-400 bg-white text-gray-900"
                />
                {isSearching && (
                  <div className="absolute right-4 top-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
                  </div>
                )}
              </div>
              <ScrollArea className="h-[350px]">
                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all duration-200"
                        onClick={() => {
                          router.push(result.href)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{result.title}</h4>
                            <p className="text-sm text-gray-600">{result.section}</p>
                          </div>
                          <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium ml-4">
                            {result.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-400 text-lg">Start typing to search...</p>
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Help Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 backdrop-blur-sm">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-3xl bg-white">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl font-bold text-gray-900">Help & Support</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">Quick Navigation</h4>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Use the Business Smart Suite dropdown in the top-left corner to quickly navigate between different sections of the application.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">Search Functionality</h4>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Search across all sections using the search icon. Results will show documents, policies, and other relevant content.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">Need More Help?</h4>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Contact your system administrator for additional support or training.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <UserNav user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  )
}

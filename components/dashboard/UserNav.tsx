"use client"

import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserNavProps = {
  user: { name?: string; email?: string; role?: string } | null
  onLogout: () => void | Promise<void>
}

export function UserNav({ user, onLogout }: UserNavProps) {
  const userInitial = String(user?.name || user?.email || "U").charAt(0).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
        >
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-base font-bold text-white">{userInitial}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-0 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500" align="end" forceMount>
        {/* User Info Section */}
        <div className="px-6 py-5 border-b border-white/20">
          <div className="flex flex-col space-y-1">
            <p className="text-base font-bold text-white leading-none">{user?.name || "User"}</p>
            <p className="text-sm text-purple-100 leading-none mt-2">{user?.email || ""}</p>
            {user?.role && (
              <p className="text-sm text-purple-100 leading-none mt-1 capitalize">{user.role}</p>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <DropdownMenuItem className="cursor-pointer px-4 py-3 rounded-lg hover:bg-white/10 focus:bg-white/10">
            <User className="mr-3 h-5 w-5 text-white" />
            <span className="text-base font-medium text-white">Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="my-2 bg-white/20" />
          
          <DropdownMenuItem 
            onClick={() => void onLogout()} 
            className="cursor-pointer px-4 py-3 rounded-lg text-red-300 hover:text-red-200 hover:bg-white/10 focus:text-red-200 focus:bg-white/10"
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span className="text-base font-medium">Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

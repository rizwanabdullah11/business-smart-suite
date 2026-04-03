"use client"

import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
          className="relative h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
        >
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm font-bold text-white">{userInitial}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
            {user?.role && (
              <p className="text-xs leading-none text-muted-foreground capitalize">{user.role}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void onLogout()} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

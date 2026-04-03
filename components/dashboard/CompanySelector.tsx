"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { DASHBOARD_MODULE_GROUPS } from "@/constant/dashboard-module-groups"

export function CompanySelector() {
  const { can } = usePermissions()

  const navigationSections = DASHBOARD_MODULE_GROUPS.map((group) => ({
    label: group.title,
    items: group.modules
      .filter((m) => !m.permission || can(m.permission))
      .map((m) => ({
        icon: <m.icon className="h-4 w-4" />,
        label: m.label,
        href: m.href,
      })),
  })).filter((section) => section.items.length > 0)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20 px-4 py-2 h-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Business Smart Suite</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 sm:w-80 max-h-[80vh] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        avoidCollisions={true}
        collisionPadding={8}
      >
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <DropdownMenuLabel className="font-semibold text-base text-gray-900">
            Navigation Menu
          </DropdownMenuLabel>
        </div>
        <ScrollArea className="h-[calc(80vh-60px)]">
          <div className="p-2">
            {navigationSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-4 last:mb-0">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2 py-1.5">
                    {section.label}
                  </DropdownMenuLabel>
                  {section.items.map((item, itemIndex) => (
                    <DropdownMenuItem key={itemIndex} asChild className="px-2 py-1.5">
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 cursor-pointer w-full rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-600 flex-shrink-0">{item.icon}</span>
                        <span className="font-medium text-gray-900 truncate">{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                {sectionIndex < navigationSections.length - 1 && (
                  <div className="mx-2 my-2 border-t border-gray-200" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

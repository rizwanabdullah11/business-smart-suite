"use client"

import { ChevronDown, Sparkles, Home, BarChart } from "lucide-react"
import { Button } from "@/components/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { usePermissions } from "@/hooks/use-permissions"
import { DASHBOARD_MODULE_GROUPS } from "@/constant/dashboard-module-groups"

export function CompanySelector() {
  const { can } = usePermissions()

  // Build navigation sections with permission filtering
  const navigationSections = [
    {
      label: "MAIN NAVIGATION",
      items: [
        { icon: <Home className="h-5 w-5" />, label: "Dashboard", href: "/dashboard" },
        { icon: <BarChart className="h-5 w-5" />, label: "Registers", href: "/registers" },
      ],
    },
    ...DASHBOARD_MODULE_GROUPS.map((group) => ({
      label: group.title.toUpperCase(),
      items: group.modules
        .filter((m) => !m.permission || can(m.permission))
        .map((m) => ({
          icon: <m.icon className="h-5 w-5" />,
          label: m.label,
          href: m.href,
        })),
    })).filter((section) => section.items.length > 0),
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20 px-4 py-2 h-auto rounded-xl"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Business Smart Suite</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[360px] max-h-[85vh] p-0 rounded-2xl bg-white"
        align="start"
        side="bottom"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={8}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="font-bold text-xl text-gray-900">Navigation Menu</h2>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="h-[calc(85vh-90px)]">
          <div className="px-6 py-5">
            {navigationSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6 last:mb-2">
                <DropdownMenuGroup>
                  {/* Section Label */}
                  <DropdownMenuLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider px-0 mb-3">
                    {section.label}
                  </DropdownMenuLabel>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <DropdownMenuItem key={itemIndex} asChild className="p-0">
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 cursor-pointer w-full rounded-lg hover:bg-gray-50 transition-all duration-200 px-3 py-2.5 group"
                        >
                          <span className="text-gray-600 group-hover:text-gray-900 flex-shrink-0 transition-colors">
                            {item.icon}
                          </span>
                          <span className="font-medium text-gray-900 text-sm">
                            {item.label}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuGroup>

                {/* Separator Line */}
                {sectionIndex < navigationSections.length - 1 && (
                  <div className="mt-5 mb-1 border-t border-gray-200" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import {
  BadgeDollarSign,
  LayoutDashboard,
  LineChart,
  WalletCards,
  BarChartIcon,
  type LucideIcon,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavManage() {
  const items = [
    {
      name: "Accounts",
      url: "/manage/accounts",
      icon: WalletCards
    },
    {
      name: "Transactions",
      url: "/manage/transactions",
      icon: BadgeDollarSign
    },
    {
      name: "Categories",
      url: "/manage/categories",
      icon: BarChartIcon
    }
  ]

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Manage</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

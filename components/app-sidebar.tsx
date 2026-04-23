"use client"

import * as React from "react"
import {
  Banknote,
  Calculator,
  CalendarClock,
  LayoutDashboard,
  Layers,
  Target,
  ArrowRightLeft,
  LogOut,
  BadgeCheck,
  Wallet,
  Shield,
  TrendingDown,
  Activity,
  TrendingUp,
  LineChart,
  Briefcase,
  User,
  Receipt,
  Building2,
  HeartPulse,
  Landmark,
} from "lucide-react"

import { cn } from "@/lib/utils"
// import { NavOverview } from "@/components/nav-overview" // Removed as we will put Dashboard directly in main nav
// import { NavManage } from "./nav-manage" // Removed in favor of unified lists
import { NavTools } from "@/components/nav-tools" // We can reuse this component or just map directly
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import HeaderLogo from "./header-logo"
import { ClerkLoaded, ClerkLoading, useUser, useClerk } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "Manage",
    items: [
      { title: "Transactions",       url: "/manage/transactions", icon: ArrowRightLeft },
      { title: "Accounts",           url: "/manage/accounts",     icon: Banknote },
      { title: "Categories",         url: "/manage/categories",   icon: Layers },
      { title: "Recurring Expenses", url: "/manage/recurring",    icon: CalendarClock },
    ],
  },
  {
    title: "Planning",
    items: [
      { title: "Goals",              url: "/manage/goals",               icon: Target },
      { title: "Budget Planner",     url: "/planning/budgets",           icon: Wallet },
      { title: "Emergency Fund",     url: "/planning/emergency-fund",    icon: Shield },
      { title: "Debt Payoff Planner",url: "/planning/debt-planner",      icon: TrendingDown },
    ],
  },
  {
    title: "Insights",
    items: [
      { title: "Health Score",       url: "/insights/health-score",       icon: HeartPulse },
      { title: "Cashflow Forecast",  url: "/insights/cashflow-forecast",  icon: TrendingUp },
      { title: "Net Worth History",  url: "/insights/net-worth",          icon: LineChart },
    ],
  },
  {
    title: "Investments",
    items: [
      { title: "Portfolio",          url: "/investments",                 icon: Briefcase },
    ],
  },
  {
    title: "Personal",
    items: [
      { title: "Profile",            url: "/personal/profile",            icon: User },
      { title: "Income Tax",         url: "/personal/tax-calculator",     icon: Receipt },
      { title: "CPF Tracker",        url: "/personal/cpf",                icon: Landmark },
    ],
  },
  {
    title: "Tools",
    items: [
      { title: "Interest Calculator", url: "/tools/interest-calculator",  icon: Calculator },
      { title: "Savings Goal", url: "/tools/savings-goal",  icon: Calculator },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, state } = useSidebar()
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const pathname = usePathname();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="group" {...props}>
      <SidebarHeader className={cn(
        "flex-row items-center",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <HeaderLogo className={isCollapsed ? "hidden" : "flex"} />
        <SidebarTrigger className={isCollapsed ? "mx-auto" : ""} />
      </SidebarHeader>
      <SidebarContent>
        {navItems.map((group) => (
            <div key={group.title} className="p-2">
                {!isCollapsed && <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{group.title}</div>}
                <SidebarMenu>
                    {group.items.map((item) => {
                        const isActive = pathname === item.url;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton 
                                    asChild 
                                    isActive={isActive}
                                    tooltip={item.title}
                                >
                                    <Link href={item.url}>
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </div>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <ClerkLoading>
            <div className="flex items-center justify-center p-4">
                 <Loader2 className="size-8 animate-spin text-slate-400" />
            </div>
        </ClerkLoading>
        <ClerkLoaded>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.imageUrl} alt={user?.username ?? ""} />
                      <AvatarFallback className="rounded-lg">User</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user?.username}</span>
                      <span className="truncate text-xs">{user?.emailAddresses[0].emailAddress}</span>
                    </div>
                    {/* <Settings className="ml-auto size-4" /> */}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "top"}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user?.imageUrl} alt={user?.username ?? ""} />
                        <AvatarFallback className="rounded-lg">User</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{user?.username}</span>
                        <span className="truncate text-xs">{user?.emailAddresses[0].emailAddress}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      onClick={() => openUserProfile()}
                      className="cursor-pointer"
                    >
                      <BadgeCheck className="mr-2 h-4 w-4 text-muted-foreground"/>
                      Account
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4 text-muted-foreground"/>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </ClerkLoaded>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

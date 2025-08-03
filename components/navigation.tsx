"use client";

import { usePathname, useRouter } from "next/navigation";
import NavButton from "@/components/nav-button";
import { useState } from "react";
import { useMedia } from "react-use";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const routes = [
    {
        href: "/",
        label: "Overview",
    },
    {
        href: "/manage",
        label: "Manage"
    },
    {
        href: "/tools",
        label: "Tools",
        subRoutes: [
            {
                href: "/tools/interest-calculator",
                label: "Interest Calculator"
            }
        ]
    },
];

const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const isMobile = useMedia("(max-width: 768px)", false);

    const onClick = (href: string) => {
        router.push(href);
        setIsOpen(false);
    }

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger>
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition"
                    >
                        <Menu className="size-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="px-2">
                    <nav className="flex flex-col gap-y-2 pt-6">
                        {routes.map((route) => {
                            if (route.subRoutes) {
                                return (
                                    <div key={route.href}>
                                        <Button
                                            variant={"ghost"}
                                            className="w-full justify-start text-left font-bold"
                                            disabled
                                        >
                                            {route.label}
                                        </Button>
                                        {route.subRoutes.map((subRoute) => (
                                            <Button
                                                key={subRoute.href}
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onClick(subRoute.href)}
                                                className={`w-full justify-start font-normal ${pathname === subRoute.href && "bg-white/10 text-white"}`}
                                            >
                                                {subRoute.label}
                                            </Button>
                                        ))}
                                    </div>
                                )
                            }

                            return (
                                <Button
                                    key={route.href}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onClick(route.href)}
                                    className={`w-full justify-start font-normal ${pathname === route.href && "bg-white/10 text-white"}`}
                                >
                                    {route.label}
                                </Button>
                            )
                        })}
                    </nav>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <nav className="hidden md:flex items-center gap-x-2 overflow-x-auto">
            {routes.map((route) => {
                if (route.subRoutes) {
                    return (
                        <DropdownMenu key={route.href} onOpenChange={setIsToolsOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className={`
                                        w-full
                                        lg:w-auto
                                        justify-between
                                        font-normal
                                        hover:bg-white/20
                                        hover:text-white
                                        border-none
                                        focus-visible:ring-offset-0
                                        focus-visible:ring-transparent
                                        outline-none
                                        text-white
                                        transition
                                        ${pathname.startsWith(route.href) ? "bg-white/10 font-bold" : "bg-transparent"}
                                    `}
                                >
                                    {route.label}
                                    <ChevronDown className={`size-4 ml-2 transition-transform duration-300 ${isToolsOpen ? "transform rotate-180" : ""}`} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="bg-transparent border-none">
                                {route.subRoutes.map((subRoute) => (
                                    <DropdownMenuItem
                                        key={subRoute.href}
                                        onSelect={() => onClick(subRoute.href)}
                                        className="cursor-pointer"
                                    >
                                        {subRoute.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                }

                return (
                    <NavButton
                        key={route.href}
                        href={route.href}
                        label={route.label}
                        isActive={pathname === route.href}
                    />
                )
            })}
        </nav>
    )
}
export default Navigation
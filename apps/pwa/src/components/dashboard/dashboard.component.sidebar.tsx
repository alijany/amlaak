"use client";

import React from "react";
import { MenuItems } from "./dashboard.component.menu-items"
import { cn } from "@/libs/style/style.util.helpers";


type SidebarProps = React.HTMLAttributes<HTMLDivElement>

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
    return <MenuItems
        className={cn("flex flex-col gap-4 px-4 py-6 rounded-2xl bg-white overflow-hidden min-w-72", className)}
        itemClassName="text-slate-600 hover:text-slate-800"
        onClose={() => { }}
    />
}
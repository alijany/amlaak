"use client";

import React, { useState } from "react";
import { cn } from "@/libs/style/style.util.helpers";

export interface TabItem {
    id: string;
    label: string;
    count?: number;
}

interface TabsProps {
    tabs: TabItem[];
    defaultTab?: string;
    onTabChange?: (tabId: string) => void;
    className?: string;
    variant?: "pills" | "underline";
}

export function Tabs({
    tabs,
    defaultTab,
    onTabChange,
    className,
    variant = "pills",
}: TabsProps) {
    const [activeTab, setActiveTab] = useState<string>(
        defaultTab || (tabs.length > 0 ? tabs[0].id : "")
    );

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (onTabChange) {
            onTabChange(tabId);
        }
    };

    return (
        <div className={cn("w-full", className)}>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
                {tabs.map((tab) => (
                    <TabButton
                        key={tab.id}
                        isActive={activeTab === tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        count={tab.count}
                        variant={variant}
                    >
                        {tab.label}
                    </TabButton>
                ))}
            </div>
        </div>
    );
}

interface TabButtonProps {
    children: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    count?: number;
    variant: "pills" | "underline";
}

function TabButton({
    children,
    isActive,
    onClick,
    count,
    variant,
}: TabButtonProps) {
    if (variant === "pills") {
        return (
            <button
                onClick={onClick}
                className={cn(
                    "flex w-full justify-center items-center font-semibold gap-2 rounded-xl px-4 py-2 transition-all whitespace-nowrap",
                    isActive && "bg-slate-50 text-orange-600"
                )}
            >
                <span>{children}</span>
                {typeof count !== "undefined" && (
                    <span
                        className={cn(
                            "rounded-full px-2 py-0.5 bg-slate-100 text-sm ",
                            isActive && "text-rose-500"

                        )}
                    >
                        {count}
                    </span>
                )}
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
            )}
        >
            <span>{children}</span>
            {typeof count !== "undefined" && (
                <span
                    className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-muted-foreground/10 text-muted-foreground"
                    )}
                >
                    {count}
                </span>
            )}
        </button>
    );
}
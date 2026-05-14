import React, { createContext, useContext, useState } from "react";
import { cn } from "@/libs/style/style.util.helpers";
import { TabItem } from "./ui.tabs";

interface TabContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabContext = createContext<TabContextValue | undefined>(undefined);

function useTabContext() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("Tab components must be used within a TabPanel");
  }
  return context;
}

export interface TabPanelProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
  children: React.ReactNode;
}

export function TabPanel({
  tabs,
  defaultTab,
  className,
  children,
}: TabPanelProps) {
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab || (tabs.length > 0 ? tabs[0].id : "")
  );

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabContext.Provider>
  );
}

export interface TabNavProps {
  tabs: TabItem[];
  className?: string;
  variant?: "pills" | "underline";
}

export function TabNav({ tabs, className, variant = "pills" }: TabNavProps) {
  const { activeTab, setActiveTab } = useTabContext();

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2 no-scrollbar", className)}>
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          isActive={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
          count={tab.count}
          variant={variant}
        >
          {tab.label}
        </TabButton>
      ))}
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
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
          isActive
            ? "bg-primary text-white"
            : "bg-muted/30 text-muted-foreground hover:bg-muted"
        )}
      >
        <span>{children}</span>
        {typeof count !== "undefined" && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs",
              isActive
                ? "bg-white/20 text-white"
                : "bg-muted-foreground/20 text-muted-foreground"
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

interface TabContentProps {
  tabId: string;
  children: React.ReactNode;
  className?: string;
}

export function TabContent({ tabId, children, className }: TabContentProps) {
  const { activeTab } = useTabContext();

  if (activeTab !== tabId) {
    return null;
  }

  return (
    <div className={cn("animate-fadeIn", className)}>
      {children}
    </div>
  );
}
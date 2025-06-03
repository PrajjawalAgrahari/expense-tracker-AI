"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  PieChart,
  Target,
  Menu,
  ChevronLeft,
  ListOrdered,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  setActiveSection: (section: string) => void;
  activeSection: string;
}

export default function Sidebar({
  className,
  setActiveSection,
  activeSection,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      title: "Overview",
      icon: LayoutDashboard,
      value: "overview",
    },
    {
      title: "Transactions",
      icon: ListOrdered,
      value: "transactions",
    },
    {
      title: "Visualizations",
      icon: PieChart,
      value: "visualizations",
    },
    {
      title: "Goals",
      icon: Target,
      value: "goals",
    },
  ];

  return (
    <div
      className={cn(
        "relative min-h-screen bg-gray-50 border-r border-gray-100 px-4 py-8 transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[280px]",
        className
      )}
    >
      {/* Logo/Brand Section */}
      <div className="mb-8 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="font-semibold text-gray-800">Expensify</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 rounded-lg hover:bg-gray-100"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.value}
            variant={activeSection === item.value ? "default" : "ghost"}
            className={cn(
              "w-full justify-start h-12 px-4 transition-colors",
              activeSection === item.value
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              isCollapsed ? "px-2" : "px-4"
            )}
            onClick={() => setActiveSection(item.value)}
          >
            <item.icon
              className={cn(
                "h-5 w-5",
                activeSection === item.value
                  ? "text-blue-600"
                  : "text-gray-500",
                isCollapsed ? "mr-0" : "mr-3"
              )}
            />
            {!isCollapsed && <span className="font-medium">{item.title}</span>}
          </Button>
        ))}
      </nav>
    </div>
  );
}

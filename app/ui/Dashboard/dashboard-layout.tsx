"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import TransactionsPage from "./transactions/page";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardLayout({
  children,
  className,
}: DashboardLayoutProps) {
  const [activeSection, setActiveSection] = useState("overview");

  const renderContent = () => {
    switch (activeSection) {
      case "transactions":
        return <TransactionsPage />;
      case "overview":
      default:
        return children;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>

      {/* Mobile sidebar - can be implemented later if needed */}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {activeSection === "overview" ? "Dashboard" : "Transactions"}
            </h1>
            <p className="text-gray-600">Welcome back!</p>
          </header>

          {/* Content */}
          <div className="space-y-6">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
}

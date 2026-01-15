import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function LayoutRaw({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh bg-muted/20">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-overlay bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
				fixed inset-y-0 left-0 z-modal w-64 transform transition-transform duration-200 ease-out lg:relative lg:translate-x-0 pb-[env(safe-area-inset-bottom)]
				${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
			`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex overflow-hidden flex-col flex-1 lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="overflow-auto flex-1 pb-[env(safe-area-inset-bottom)]">
          <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export const Layout = React.memo(LayoutRaw);

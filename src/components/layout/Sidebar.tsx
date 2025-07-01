import {
  BookOpen,
  ChefHat,
  Home,
  MessageCircle,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Pantry", href: "/pantry", icon: Package },
  { name: "Recipes", href: "/recipes", icon: BookOpen },
  { name: "Shopping List", href: "/shopping", icon: ShoppingCart },
  { name: "Leftovers", href: "/leftovers", icon: Utensils },
  { name: "AI Assistant", href: "/assistant", icon: MessageCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  // Accessibility: Focus trap for modal/drawer usage
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!onClose) return;
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ];
    const getFocusable = () =>
      sidebar.querySelectorAll<HTMLElement>(focusableSelectors.join(", "));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(getFocusable());
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    sidebar.addEventListener("keydown", handleKeyDown);
    // Focus the first focusable element when opened
    setTimeout(() => {
      const focusable = getFocusable();
      if (focusable.length) focusable[0].focus();
    }, 0);
    return () => {
      sidebar.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={sidebarRef}
      className="flex flex-col w-64 h-full border-r bg-background border-border"
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Enhanced Sidebar Header with Branding */}
      <div className="flex justify-between items-center p-4 h-14 bg-gradient-to-r from-emerald-50 border-b border-border to-emerald-100/50 sm:h-16">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="relative">
            <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg sm:h-10 sm:w-10">
              <ChefHat className="w-4 h-4 text-white sm:h-5 sm:w-5" />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-700 sm:text-xl">
            Appetite
          </h2>
        </div>
        {/* Mobile close button */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose} // Close sidebar on mobile when clicking nav item
            className={({ isActive }) =>
              cn(
                "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1",
              )
            }
          >
            <item.icon
              className={cn(
                "flex-shrink-0 mr-3 w-5 h-5 transition-all duration-200",
                "group-hover:scale-110",
              )}
            />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer Branding */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="text-center">
          <p className="mb-1 text-xs text-muted-foreground">
            Powered by AI • Made with ❤️
          </p>
          <div className="flex justify-center items-center space-x-1 text-xs text-muted-foreground">
            <span>Version 1.0</span>
            <span>•</span>
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
              Beta
            </span>
          </div>
          <img
            src="/bolt-badge/black_circle_360x360/black_circle_360x360.svg"
            alt="Bolt Badge"
            className="mx-auto mt-3 h-7"
          />
        </div>
      </div>
    </div>
  );
}

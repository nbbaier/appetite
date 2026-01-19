import { ChefHat, LogOut, Menu } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

export function HeaderRaw({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>

            {/* Enhanced Brand Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <div className="flex justify-center items-center size-8 bg-emerald-600 rounded-xl shadow-lg sm:size-10">
                  <ChefHat className="size-4 text-white sm:size-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <h1 className="text-lg font-bold text-emerald-700 sm:text-xl text-balance">
                    Appetite
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                    Beta
                  </span>
                </div>
                <p className="hidden text-xs sm:block text-muted-foreground">
                  AI-Powered Cooking Assistant
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5">
              <div
                className="flex justify-center items-center size-6 text-xs font-bold text-white bg-emerald-500 rounded-full"
              >
                {user?.user_metadata?.full_name
                  ? user.user_metadata.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <Link
                to="/settings"
                className="underline truncate rounded transition-colors max-w-32 sm:max-w-none text-primary hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ textDecoration: "underline" }}
              >
                {user?.user_metadata?.full_name || user?.email}
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export const Header = React.memo(HeaderRaw);

import { ChefHat, LogOut, Menu } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

function HeaderRaw({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <Button
              aria-label="Open menu"
              className="lg:hidden"
              onClick={onMenuClick}
              size="icon"
              variant="ghost"
            >
              <Menu className="size-5" />
            </Button>

            {/* Enhanced Brand Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-600 shadow-lg sm:size-10">
                  <ChefHat className="size-4 text-white sm:size-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <h1 className="text-balance font-bold text-emerald-700 text-lg sm:text-xl">
                    Appetite
                  </h1>
                  <span className="hidden rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 text-xs sm:inline-block">
                    Beta
                  </span>
                </div>
                <p className="hidden text-muted-foreground text-xs sm:block">
                  AI-Powered Cooking Assistant
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden items-center space-x-2 rounded-lg bg-muted/50 px-3 py-1.5 text-muted-foreground text-sm sm:flex">
              <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500 font-bold text-white text-xs">
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
                className="max-w-32 truncate rounded text-primary underline transition-colors hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary sm:max-w-none"
                style={{ textDecoration: "underline" }}
                to="/settings"
              >
                {user?.user_metadata?.full_name || user?.email}
              </Link>
            </div>
            <Button
              aria-label="Sign out"
              className="transition-colors hover:bg-red-50 hover:text-red-600"
              onClick={signOut}
              size="icon"
              variant="ghost"
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

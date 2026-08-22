"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-muted border border-border animate-pulse" />
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Switch Theme"
        aria-label="Switch Theme"
        className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-foreground hover:bg-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-sm"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-purple-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl border border-border bg-card text-foreground backdrop-blur-md p-1.5 shadow-xl z-50 animate-in fade-in-50 zoom-in-95">
          <button
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              theme === "light"
                ? "bg-purple-600/10 text-purple-600 dark:text-purple-400 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span>Light</span>
            {theme === "light" && <span className="ml-auto text-[10px]">✓</span>}
          </button>

          <button
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              theme === "dark"
                ? "bg-purple-600/10 text-purple-600 dark:text-purple-400 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Moon className="h-3.5 w-3.5 text-purple-400" />
            <span>Dark</span>
            {theme === "dark" && <span className="ml-auto text-[10px]">✓</span>}
          </button>

          <button
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              theme === "system"
                ? "bg-purple-600/10 text-purple-600 dark:text-purple-400 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Laptop className="h-3.5 w-3.5 text-blue-500" />
            <span>System</span>
            {theme === "system" && <span className="ml-auto text-[10px]">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}

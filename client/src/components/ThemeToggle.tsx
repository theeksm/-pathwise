import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Only show the theme toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:bg-gray-100 rounded-full">
      <Sun className="h-4 w-4" />
    </Button>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-gray-500 hover:bg-gray-100 rounded-full focus-visible:ring-2 focus-visible:ring-primary"
        >
          {theme === "light" && <Sun className="h-4 w-4" />}
          {theme === "dark" && <Moon className="h-4 w-4" />}
          {theme === "system" && <Monitor className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] p-2">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm ${theme === "light" ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm ${theme === "dark" ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm ${theme === "system" ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
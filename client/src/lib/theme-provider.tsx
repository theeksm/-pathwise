import * as React from "react";

// Define theme types
type Theme = "light" | "dark" | "system";

// Define props for the theme provider
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

// Define the context type
type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

// Create the context with a default value
const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

// ThemeProvider component
export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "pathwise-theme",
  ...props
}: ThemeProviderProps) {
  // Initialize theme from localStorage or default
  const [theme, setThemeState] = React.useState<Theme>(() => {
    // Check for stored theme preference
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem(storageKey) as Theme;
      return savedTheme || defaultTheme;
    }
    return defaultTheme;
  });

  // Update the theme and save to localStorage
  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  }, [storageKey]);

  // Apply the theme class to the document element
  React.useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    
    // Determine the effective theme
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Create the context value
  const contextValue = React.useMemo(() => ({
    theme,
    setTheme,
  }), [theme, setTheme]);

  return (
    <ThemeContext.Provider {...props} value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use the theme context
export function useTheme() {
  const context = React.useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}
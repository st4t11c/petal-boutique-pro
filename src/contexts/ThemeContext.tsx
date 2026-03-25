import React, { createContext, useContext, useEffect, useState } from "react";

export const themes = [
  { id: "default", name: "Midnight Amber", class: "", color: "#d97706" },
  { id: "ocean", name: "Ocean Blue", class: "theme-ocean", color: "#0891b2" },
  { id: "crimson", name: "Crimson Night", class: "theme-crimson", color: "#e11d48" },
  { id: "forest", name: "Forest Dark", class: "theme-forest", color: "#16a34a" },
  { id: "purple", name: "Royal Purple", class: "theme-purple", color: "#9333ea" },
  { id: "sunset", name: "Sunset Warm", class: "theme-sunset", color: "#ea580c" },
  { id: "arctic", name: "Arctic Frost", class: "theme-arctic", color: "#0ea5e9" },
  { id: "neon", name: "Neon City", class: "theme-neon", color: "#ec4899" },
];

interface ThemeContextType {
  themeId: string;
  setThemeId: (id: string) => void;
  isDark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeId: "default", setThemeId: () => {}, isDark: true, toggleDark: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState(() => localStorage.getItem("themeId") || "default");
  const [isDark, setIsDark] = useState(() => localStorage.getItem("darkMode") !== "false");

  const applyTheme = (id: string, dark: boolean) => {
    const html = document.documentElement;
    themes.forEach((t) => { if (t.class) html.classList.remove(t.class); });
    html.classList.remove("dark", "light");
    const theme = themes.find((t) => t.id === id);
    if (theme?.class) html.classList.add(theme.class);
    html.classList.add(dark ? "dark" : "light");
  };

  useEffect(() => { applyTheme(themeId, isDark); }, [themeId, isDark]);

  const setThemeId = (id: string) => { setThemeIdState(id); localStorage.setItem("themeId", id); };
  const toggleDark = () => {
    setIsDark((prev) => { const next = !prev; localStorage.setItem("darkMode", String(next)); return next; });
  };

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

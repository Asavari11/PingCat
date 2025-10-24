import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({ children }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={["light", "dark", "blue-light", "blue-dark", "green-light", "green-dark"]}
    >
      {children}
    </NextThemesProvider>
  );
}

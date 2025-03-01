"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { applyStoredSettings } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const { initializeSettings } = useSettingsStore();
  
  useEffect(() => {
    // Apply stored settings immediately
    applyStoredSettings();
    
    // Then fetch latest settings from server
    initializeSettings();
  }, [initializeSettings]);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
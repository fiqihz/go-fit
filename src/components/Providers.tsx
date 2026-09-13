"use client";

import { I18nProvider } from "@/lib/i18n/provider";
import { AuthProvider } from "@/lib/auth/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>{children}</AuthProvider>
    </I18nProvider>
  );
}

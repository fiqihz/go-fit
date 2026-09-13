"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/lib/auth/provider";
import { useI18n } from "@/lib/i18n/provider";
import { fetchOnboarded } from "@/lib/supabase/repo";

/**
 * App-shell layout for authenticated pages: full-height container, scrollable
 * content area, sticky bottom nav. Redirects to /login when signed out.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (loading || !configured) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // Send first-time users to onboarding to set their targets.
    let active = true;
    fetchOnboarded()
      .then((done) => {
        if (active && !done) router.replace("/onboarding");
      })
      .catch(() => {
        // Non-fatal: if the check fails, let the user into the app.
      });
    return () => {
      active = false;
    };
  }, [loading, configured, user, router]);

  if (!configured) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6 text-center">
        <p className="max-w-xs text-[15px] text-ink-soft">
          {t("supabaseMissing")}
        </p>
      </main>
    );
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-[15px] text-ink-soft">{t("loading")}</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto w-full max-w-md flex-1 px-4 pt-[calc(env(safe-area-inset-top)+16px)]">
        {children}
      </div>
      <div className="mx-auto w-full max-w-md">
        <BottomNav />
      </div>
    </div>
  );
}

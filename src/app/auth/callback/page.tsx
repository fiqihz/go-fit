"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchOnboarded } from "@/lib/supabase/repo";
import { useI18n } from "@/lib/i18n/provider";

/**
 * OAuth redirect target. The Supabase client is configured with
 * detectSessionInUrl, so it exchanges the code in the URL for a session on
 * load. Once the session exists we route first-time users to onboarding and
 * everyone else to the diary.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      router.replace("/login");
      return;
    }

    let active = true;

    async function route() {
      try {
        const done = await fetchOnboarded();
        if (active) router.replace(done ? "/" : "/onboarding");
      } catch {
        if (active) router.replace("/");
      }
    }

    const sb = getSupabase();

    // Session may already be present, or arrive shortly after code exchange.
    sb.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        route();
        return;
      }
      const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
        if (session) {
          sub.subscription.unsubscribe();
          route();
        }
      });
      // Safety net: if nothing arrives, send back to login.
      const timer = setTimeout(() => {
        sub.subscription.unsubscribe();
        if (active) setFailed(true);
      }, 8000);
      return () => clearTimeout(timer);
    });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[15px] text-ink-soft">
        {failed ? t("authError") : t("signingIn")}
      </p>
      {failed && (
        <button
          onClick={() => router.replace("/login")}
          className="text-[14px] font-semibold text-lime-strong active:opacity-70"
        >
          {t("signIn")}
        </button>
      )}
    </main>
  );
}

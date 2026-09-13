"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/lib/auth/provider";
import { useI18n } from "@/lib/i18n/provider";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const { t } = useI18n();
  const { user, loading, configured, signIn, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
        router.replace("/");
      } else {
        const { needsConfirm } = await signUp(email.trim(), password);
        if (needsConfirm) {
          setNotice(t("checkEmail"));
          setMode("signin");
        } else {
          // Fresh account with an active session → set targets first.
          router.replace("/onboarding");
        }
      }
    } catch {
      setError(t("authError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-10 pt-[calc(env(safe-area-inset-top)+24px)]">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime text-white">
            <Leaf size={28} />
          </div>
          <h1 className="text-[28px] font-bold tracking-tight">
            {t("appName")}
          </h1>
          <p className="mt-1 text-[14px] text-ink-soft">{t("tagline")}</p>
        </div>

        {!configured && (
          <p className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-[13px] text-danger">
            {t("supabaseMissing")}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Field
            label={t("email")}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Field
            label={t("password")}
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {notice && (
            <p className="rounded-xl bg-lime-soft px-4 py-3 text-[13px] text-lime-strong">
              {notice}
            </p>
          )}
          {error && (
            <p className="rounded-xl bg-danger/10 px-4 py-3 text-[13px] text-danger">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth disabled={busy || !configured}>
            {busy
              ? t("saving")
              : mode === "signin"
                ? t("signInCta")
                : t("signUpCta")}
          </Button>
        </form>

        <div className="mt-5 text-center text-[14px] text-ink-soft">
          {mode === "signin" ? (
            <>
              {t("noAccount")}{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="font-semibold text-lime-strong active:opacity-70"
              >
                {t("signUp")}
              </button>
            </>
          ) : (
            <>
              {t("haveAccount")}{" "}
              <button
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
                className="font-semibold text-lime-strong active:opacity-70"
              >
                {t("signIn")}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

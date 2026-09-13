"use client";

import { useI18n } from "@/lib/i18n/provider";
import { LANGUAGES, type Language } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

const LABEL: Record<Language, string> = { en: "EN", id: "ID" };

/** Compact EN/ID segmented toggle. */
export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="inline-flex select-none rounded-full border border-line bg-surface p-0.5">
      {LANGUAGES.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "min-h-[36px] min-w-[44px] rounded-full px-3 text-[13px] font-semibold transition-colors",
            lang === l ? "bg-lime text-white" : "text-ink-soft",
          )}
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  );
}

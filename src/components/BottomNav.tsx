"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Scale, CalendarRange, Settings } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { useReminderStore } from "@/lib/store/reminder-store";
import { cn } from "@/lib/utils";

const ITEMS: {
  href: string;
  icon: typeof BookOpen;
  key: TranslationKey;
}[] = [
  { href: "/", icon: BookOpen, key: "navDiary" },
  { href: "/weight", icon: Scale, key: "navWeight" },
  { href: "/summary", icon: CalendarRange, key: "navSummary" },
  { href: "/settings", icon: Settings, key: "navSettings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const weightLogged = useReminderStore((s) => s.weightLoggedToday);
  const refresh = useReminderStore((s) => s.refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <nav className="sticky bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map(({ href, icon: Icon, key }) => {
          const active = pathname === href;
          const showBadge = href === "/weight" && weightLogged === false;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex min-h-[56px] select-none flex-col items-center justify-center gap-0.5 text-[11px] font-medium active:opacity-70",
                  active ? "text-lime-strong" : "text-ink-soft",
                )}
              >
                <span className="relative">
                  <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
                  {showBadge && (
                    <span className="absolute -right-1.5 -top-0.5 h-2 w-2 rounded-full bg-lime ring-2 ring-surface" />
                  )}
                </span>
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

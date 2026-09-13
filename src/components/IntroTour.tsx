"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Scale, CalendarRange, Settings } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

interface Slide {
  icon: typeof BookOpen;
  title: TranslationKey;
  body: TranslationKey;
}

const SLIDES: Slide[] = [
  { icon: BookOpen, title: "tourDiaryTitle", body: "tourDiaryBody" },
  { icon: Scale, title: "tourWeightTitle", body: "tourWeightBody" },
  { icon: CalendarRange, title: "tourSummaryTitle", body: "tourSummaryBody" },
  { icon: Settings, title: "tourSettingsTitle", body: "tourSettingsBody" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * First-run intro carousel shown once after onboarding. Explains each page.
 * Swipe (drag) or use the buttons; Skip/Start close it.
 */
export function IntroTour({ open, onClose }: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const last = step === SLIDES.length - 1;
  const slide = SLIDES[step];
  const Icon = slide.icon;

  function go(next: number) {
    if (next < 0 || next >= SLIDES.length) return;
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  function finish() {
    setStep(0);
    onClose();
  }

  return (
    <BottomSheet open={open} onOpenChange={(o) => !o && finish()} title={t("appName")}>
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, info) => {
              if (info.offset.x < -60) go(step + 1);
              else if (info.offset.x > 60) go(step - 1);
            }}
            className="flex flex-col items-center px-2 py-4 text-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime text-white">
              <Icon size={30} />
            </span>
            <h3 className="mt-4 text-[19px] font-bold">{t(slide.title)}</h3>
            <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-ink-soft">
              {t(slide.body)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-5 bg-lime" : "w-1.5 bg-line"
            }`}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => go(step - 1)}>
            {t("tourBack")}
          </Button>
        ) : (
          <Button variant="ghost" onClick={finish}>
            {t("tourSkip")}
          </Button>
        )}
        <Button
          onClick={() => (last ? finish() : go(step + 1))}
          fullWidth
        >
          {last ? t("tourDone") : t("tourNext")}
        </Button>
      </div>
    </BottomSheet>
  );
}

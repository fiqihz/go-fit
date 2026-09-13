"use client";

import { Drawer } from "vaul";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

/** Mobile bottom sheet built on vaul, styled with go-fit tokens. */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
}: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[24px] bg-paper outline-none">
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-line" />
          <Drawer.Title className="px-5 pt-3 text-[18px] font-bold text-ink">
            {title}
          </Drawer.Title>
          <div
            className="flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

import React, { useEffect, useRef } from 'react';

type Props = {
  title: React.ReactNode;
  icon?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ title, icon, open, onClose, children }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Focus trap within modal
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const el = containerRef.current!;
    const getFocusables = () =>
      Array.from(
        el.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((n) => !n.hasAttribute('disabled') && !n.getAttribute('aria-hidden'));

    const focusables = getFocusables();
    if (focusables.length) focusables[0].focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const items = getFocusables();
      if (items.length === 0) return;
      const idx = items.indexOf(document.activeElement as HTMLElement);
      const nextIdx = e.shiftKey ? (idx <= 0 ? items.length - 1 : idx - 1) : (idx === items.length - 1 ? 0 : idx + 1);
      items[nextIdx].focus();
      e.preventDefault();
    }

    el.addEventListener('keydown', onKeyDown as any);
    return () => {
      el.removeEventListener('keydown', onKeyDown as any);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div ref={containerRef} className="relative mx-auto mt-24 w-full max-w-lg bg-white rounded shadow-lg">
        <div className="border-b px-4 py-3 flex items-center gap-2">
          {icon}
          <h2 className="font-semibold">{title}</h2>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

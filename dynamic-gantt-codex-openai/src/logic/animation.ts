// Simple FLIP animation manager keyed by task name
// Usage:
// - TaskItem calls register(name, el) on mount and unregister on unmount.
// - Before scenario change, call capturePositions().
// - After DOM updates, call playTransitions() to animate to new positions.

type El = HTMLElement & { _flipCleanup?: () => void };

// Allow multiple elements per key (task name). If duplicates exist, skip FLIP for that name.
const registry = new Map<string, El[]>();
let prevRects: Map<string, DOMRect> | null = null;

export function registerTaskElement(name: string, el: HTMLElement | null) {
  if (!el) {
    registry.delete(name);
    return;
  }
  const arr = registry.get(name) ?? [];
  if (!arr.includes(el as El)) arr.push(el as El);
  registry.set(name, arr);
}

export function capturePositions() {
  prevRects = new Map<string, DOMRect>();
  for (const [name, arr] of registry) {
    if (arr.length === 1) {
      prevRects.set(name, arr[0].getBoundingClientRect());
    }
    // if duplicates, skip storing; animation will be disabled for this name
  }
}

export function playTransitions(durationMs = 2000) {
  if (!prevRects) return;
  const easing = 'ease';
  const durationSec = `${durationMs}ms`;

  for (const [name, arr] of registry) {
    if (arr.length !== 1) continue;
    const el = arr[0];
    const prev = prevRects.get(name);
    if (!prev) continue; // new element or duplicates, no animation

    const next = el.getBoundingClientRect();
    const dx = prev.left - next.left;
    const dy = prev.top - next.top;
    const sx = next.width ? prev.width / next.width : 1;
    const sy = next.height ? prev.height / next.height : 1;

    // If no movement and no size change, skip
    if (dx === 0 && dy === 0 && Math.abs(sx - 1) < 1e-6 && Math.abs(sy - 1) < 1e-6) continue;

    // Cancel previous cleanup if any
    el._flipCleanup?.();

    // Invert
    el.style.willChange = 'transform';
    const originalTransition = el.style.transition;
    const originalZ = el.style.zIndex;
    const originalPE = el.style.pointerEvents;
    el.style.transition = 'none';
    el.style.transformOrigin = 'top left';
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    const geom = el.querySelector('[data-flip-geometry]') as HTMLElement | null;
    let originalGeomTransition = '';
    if (geom) {
      originalGeomTransition = geom.style.transition;
      geom.style.transition = 'none';
      geom.style.transformOrigin = 'top left';
      geom.style.transform = `scale(${sx}, ${sy})`;
    }
    // Ensure element stays on top and clickable during animation
    el.style.zIndex = '50';
    el.style.pointerEvents = 'auto';

    // Force reflow
    void el.getBoundingClientRect();

    // Play
    el.style.transition = `transform ${durationSec} ${easing}`;
    if (geom) {
      geom.style.transition = `transform ${durationSec} ${easing}`;
      geom.style.transform = 'scale(1, 1)';
    }
    el.style.transform = 'translate(0px, 0px)';

    const onEnd = () => {
      el.style.transition = originalTransition;
      el.style.willChange = '';
      el.style.transformOrigin = '';
      if (geom) {
        geom.style.transition = originalGeomTransition;
        geom.style.transform = '';
        geom.style.transformOrigin = '';
      }
      el.style.zIndex = originalZ;
      el.style.pointerEvents = originalPE;
      el.removeEventListener('transitionend', onEnd);
      el._flipCleanup = undefined;
    };
    el._flipCleanup = onEnd;
    el.addEventListener('transitionend', onEnd);
  }

  prevRects = null;
}

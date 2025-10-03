import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerTaskElement, capturePositions, playTransitions } from './animation';

function makeEl(rect: Partial<DOMRect>): HTMLElement {
  const el = document.createElement('div');
  (el as any).getBoundingClientRect = () => ({
    x: rect.x ?? 0,
    y: rect.y ?? 0,
    width: rect.width ?? 100,
    height: rect.height ?? 20,
    top: rect.top ?? rect.y ?? 0,
    left: rect.left ?? rect.x ?? 0,
    right: (rect.left ?? rect.x ?? 0) + (rect.width ?? 100),
    bottom: (rect.top ?? rect.y ?? 0) + (rect.height ?? 20),
    toJSON: () => ({}),
  } as DOMRect);
  document.body.appendChild(el);
  return el;
}

describe('FLIP animation manager', () => {
  beforeEach(() => {
    // @ts-expect-error override raf
    global.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 0 as any;
    };
  });

  it('applies transform transition on play when positions change', () => {
    const el = makeEl({ left: 100, top: 100 });
    registerTaskElement('A', el);
    capturePositions();

    // Move element by changing its reported rect
    (el as any).getBoundingClientRect = () => ({
      x: 10,
      y: 20,
      width: 100,
      height: 20,
      top: 20,
      left: 10,
      right: 110,
      bottom: 40,
      toJSON: () => ({}),
    } as DOMRect);

    playTransitions(2000);
    expect((el as HTMLElement).style.transition).toContain('transform');
  });

  it('applies transform transition when only size changes', () => {
    const el = makeEl({ left: 50, top: 50, width: 50, height: 20 });
    registerTaskElement('B', el);
    capturePositions();
    // Change only width
    (el as any).getBoundingClientRect = () => ({
      x: 50,
      y: 50,
      width: 100,
      height: 20,
      top: 50,
      left: 50,
      right: 150,
      bottom: 70,
      toJSON: () => ({}),
    } as DOMRect);
    playTransitions(2000);
    expect((el as HTMLElement).style.transition).toContain('transform');
  });
});

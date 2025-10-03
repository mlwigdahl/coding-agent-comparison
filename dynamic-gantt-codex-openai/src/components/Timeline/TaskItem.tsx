import React from 'react';
import { taskBackground, PROGRESS_ORANGE } from '../../logic/colors';
import { useModal } from '../Modals/ModalContext';
import { registerTaskElement } from '../../logic/animation';

type Props = {
  name: string;
  swimlane: string;
  left: string;
  width: string;
  top: string;
  progress: number;
  color: 'blue' | 'indigo';
};

export default function TaskItem({ name, swimlane, left, width, top, progress, color }: Props) {
  const { openTaskEdit } = useModal();
  const bg = taskBackground(color, progress);
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    registerTaskElement(name, ref.current);
    return () => registerTaskElement(name, null);
  }, [name]);
  return (
    <div
      data-testid={`task-${name}`}
      className="absolute h-7 cursor-pointer select-none pointer-events-auto focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition shadow-sm hover:shadow-md animate-fade-in z-20"
      style={{ left, width, top }}
      title={name}
      role="button"
      tabIndex={0}
      ref={ref}
      onClick={() => openTaskEdit(name, swimlane)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTaskEdit(name, swimlane);
        }
      }}
    >
      {/* Geometry layer: animates scale without affecting text */}
      <div
        data-flip-geometry
        data-testid={`task-bg-${name}`}
        className="absolute inset-0 rounded-full border overflow-hidden"
        style={{ backgroundColor: bg, borderColor: 'rgba(0,0,0,0.2)', pointerEvents: 'none' as any }}
      >
        <div
          data-testid={`task-bar-${name}`}
          className="absolute left-0 bottom-0 h-1"
          style={{ width: `${progress}%`, backgroundColor: PROGRESS_ORANGE }}
        />
      </div>
      {/* Content layer: stays sharp during animation */}
      <div className="relative px-3 h-full flex items-center justify-between text-white text-xs font-medium">
        <span className="truncate pr-2" data-testid={`task-name-${name}`}>
          {name}
        </span>
        <span data-testid={`task-progress-${name}`}>{progress}%</span>
      </div>
    </div>
  );
}

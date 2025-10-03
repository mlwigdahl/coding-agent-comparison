import { useRef, useEffect, useCallback } from 'react';
import { ANIMATION_DURATION } from '../utils/constants';

// Task position data for FLIP animations
interface TaskPosition {
  taskName: string;
  element: HTMLElement;
  rect: DOMRect;
  gridPosition: {
    row: number;
    column: number;
    columnSpan: number;
  };
}

// Animation state tracking
interface AnimationState {
  isAnimating: boolean;
  previousPositions: Map<string, TaskPosition>;
  currentAnimationFrame?: number;
}

/**
 * Custom hook for smooth task animations during timeline transitions
 * Uses FLIP (First, Last, Invert, Play) technique for optimal performance
 */
export function useTaskAnimation() {
  const animationStateRef = useRef<AnimationState>({
    isAnimating: false,
    previousPositions: new Map(),
  });

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationStateRef.current.currentAnimationFrame) {
        cancelAnimationFrame(animationStateRef.current.currentAnimationFrame);
      }
    };
  }, []);

  // Capture current positions of all task elements
  const captureTaskPositions = useCallback((container: HTMLElement): Map<string, TaskPosition> => {
    const positions = new Map<string, TaskPosition>();
    
    try {
      // Find all task elements (they have data-task-name attribute)
      const taskElements = container.querySelectorAll('[data-task-name]') as NodeListOf<HTMLElement>;
      
      taskElements.forEach((element) => {
        try {
          const taskName = element.getAttribute('data-task-name');
          if (!taskName) return;

          const rect = element.getBoundingClientRect();
          
          // Skip elements that are not visible
          if (rect.width === 0 || rect.height === 0) return;
          
          const computedStyle = getComputedStyle(element);
          
          // Extract grid position from computed styles
          const gridColumn = computedStyle.gridColumn;
          const gridRow = computedStyle.gridRow;
          
          // Parse grid position data with more flexible regex
          const columnMatch = gridColumn.match(/(\d+)\s*\/\s*span\s*(\d+)/);
          const rowMatch = gridRow.match(/(\d+)/);
          
          // Always capture position data, even if grid parsing fails
          // The animation can still work using just the rect positions
          positions.set(taskName, {
            taskName,
            element,
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
              left: rect.left,
            } as DOMRect,
            gridPosition: columnMatch && rowMatch ? {
              row: parseInt(rowMatch[1], 10),
              column: parseInt(columnMatch[1], 10),
              columnSpan: parseInt(columnMatch[2], 10),
            } : {
              row: 1,
              column: 1,
              columnSpan: 1,
            },
          });
        } catch (error) {
          console.warn('Error capturing position for task element:', error);
        }
      });
    } catch (error) {
      console.warn('Error capturing task positions:', error);
    }

    return positions;
  }, []);

  // Apply FLIP animation to tasks that have moved
  const animateTaskTransitions = useCallback((
    container: HTMLElement,
    previousPositions: Map<string, TaskPosition>,
    newPositions: Map<string, TaskPosition>
  ) => {
    try {
      const tasksToAnimate: {
        element: HTMLElement;
        deltaX: number;
        deltaY: number;
        taskName: string;
      }[] = [];

      // Find tasks that have moved and calculate deltas
      newPositions.forEach((newPos, taskName) => {
        const prevPos = previousPositions.get(taskName);
        if (!prevPos) return; // Task is new, no animation needed

        // Check if element is still in DOM
        if (!document.body.contains(newPos.element)) return;

        const deltaX = prevPos.rect.left - newPos.rect.left;
        const deltaY = prevPos.rect.top - newPos.rect.top;

        // Only animate if position actually changed (with small threshold)
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          tasksToAnimate.push({
            element: newPos.element,
            deltaX,
            deltaY,
            taskName,
          });
        }
      });

      if (tasksToAnimate.length === 0) {
        return; // No animations needed
      }

      // Set initial state (Invert phase)
      tasksToAnimate.forEach(({ element, deltaX, deltaY }) => {
        try {
          element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          element.style.transition = 'none';
        } catch (error) {
          console.warn('Error setting initial animation state:', error);
        }
      });

      // Force reflow to ensure initial state is applied
      container.offsetHeight;

      // Start animations (Play phase)
      animationStateRef.current.currentAnimationFrame = requestAnimationFrame(() => {
        try {
          tasksToAnimate.forEach(({ element }) => {
            try {
              element.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
              element.style.transform = 'translate(0px, 0px)';
            } catch (error) {
              console.warn('Error starting animation:', error);
            }
          });

          // Clean up after animation completes
          setTimeout(() => {
            try {
              tasksToAnimate.forEach(({ element }) => {
                try {
                  // Check if element still exists before cleanup
                  if (document.body.contains(element)) {
                    element.style.transition = '';
                    element.style.transform = '';
                  }
                } catch (error) {
                  console.warn('Error cleaning up animation:', error);
                }
              });
              animationStateRef.current.isAnimating = false;
              
              // Capture positions after animation completes to prepare for next transition
              const finalPositions = captureTaskPositions(container);
              animationStateRef.current.previousPositions = finalPositions;
            } catch (error) {
              console.warn('Error in animation cleanup:', error);
              animationStateRef.current.isAnimating = false;
            }
          }, ANIMATION_DURATION);
        } catch (error) {
          console.warn('Error in animation play phase:', error);
          animationStateRef.current.isAnimating = false;
        }
      });

      animationStateRef.current.isAnimating = true;
    } catch (error) {
      console.warn('Error in animateTaskTransitions:', error);
      animationStateRef.current.isAnimating = false;
    }
  }, []);

  // Main function to trigger task animations
  const animateTimelineTransition = useCallback((container: HTMLElement) => {
    // Skip if already animating
    if (animationStateRef.current.isAnimating) {
      return;
    }

    // Get current positions (Last phase of FLIP)
    const newPositions = captureTaskPositions(container);
    
    // If we have previous positions, animate the transition
    if (animationStateRef.current.previousPositions.size > 0) {
      animateTaskTransitions(
        container,
        animationStateRef.current.previousPositions,
        newPositions
      );
      // Note: positions will be updated after animation completes
    } else {
      // Store current positions for next transition since we're not animating
      animationStateRef.current.previousPositions = newPositions;
    }
  }, [captureTaskPositions, animateTaskTransitions]);

  // Function to capture initial positions (First phase of FLIP)
  const captureInitialPositions = useCallback((container: HTMLElement) => {
    animationStateRef.current.previousPositions = captureTaskPositions(container);
  }, [captureTaskPositions]);

  // Check if animations are currently running
  const isAnimating = useCallback(() => {
    return animationStateRef.current.isAnimating;
  }, []);

  return {
    animateTimelineTransition,
    captureInitialPositions,
    isAnimating,
  };
}
import { useState, useCallback, useRef } from "react";

interface UseDraggableOptions {
  initialX?: number;
  initialY?: number;
}

export function useDraggable({ initialX = 100, initialY = 100 }: UseDraggableOptions = {}) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 100, ev.clientX - offset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 50, ev.clientY - offset.current.y)),
      });
    };

    const onMouseUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [pos.x, pos.y]);

  return { pos, onMouseDown };
}

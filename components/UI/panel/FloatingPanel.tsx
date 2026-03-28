import { ReactNode, useEffect, useState } from "react";

interface PanelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type PanelInteraction =
  | {
      mode: "drag";
      startMouseX: number;
      startMouseY: number;
      startX: number;
      startY: number;
    }
  | {
      mode: "resize";
      startMouseX: number;
      startMouseY: number;
      startWidth: number;
      startHeight: number;
    };

interface FloatingPanelProps {
  title: string;
  children: ReactNode;
  headerActions?: ReactNode;
  initialRect?: Partial<PanelRect>;
  minWidth?: number;
  minHeight?: number;
}

const DEFAULT_MIN_WIDTH = 300;
const DEFAULT_MIN_HEIGHT = 260;

export function FloatingPanel({
  title,
  children,
  headerActions,
  initialRect,
  minWidth = DEFAULT_MIN_WIDTH,
  minHeight = DEFAULT_MIN_HEIGHT,
}: FloatingPanelProps) {
  const initialWidth = initialRect?.width ?? 360;
  const initialHeight = initialRect?.height ?? 640;

  const [panelRect, setPanelRect] = useState<PanelRect>(() => {
    if (typeof window === "undefined") {
      return {
        x: initialRect?.x ?? 16,
        y: initialRect?.y ?? 16,
        width: initialWidth,
        height: initialHeight,
      };
    }

    return {
      x: initialRect?.x ?? Math.max(16, window.innerWidth - initialWidth - 16),
      y: initialRect?.y ?? 16,
      width: initialWidth,
      height: initialHeight,
    };
  });
  const [interaction, setInteraction] = useState<PanelInteraction | null>(null);

  useEffect(() => {
    if (!interaction) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (interaction.mode === "drag") {
        const nextX =
          interaction.startX + (event.clientX - interaction.startMouseX);
        const nextY =
          interaction.startY + (event.clientY - interaction.startMouseY);

        setPanelRect((prev) => ({
          ...prev,
          x: Math.max(0, nextX),
          y: Math.max(0, nextY),
        }));
        return;
      }

      const nextWidth =
        interaction.startWidth + (event.clientX - interaction.startMouseX);
      const nextHeight =
        interaction.startHeight + (event.clientY - interaction.startMouseY);

      setPanelRect((prev) => ({
        ...prev,
        width: Math.max(minWidth, nextWidth),
        height: Math.max(minHeight, nextHeight),
      }));
    };

    const handleMouseUp = () => {
      setInteraction(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [interaction, minHeight, minWidth]);

  return (
    <aside
      className="absolute z-20 flex flex-col overflow-hidden rounded-xl border border-white/20 bg-black/70 text-xs text-white backdrop-blur-sm"
      style={{
        left: panelRect.x,
        top: panelRect.y,
        width: panelRect.width,
        height: panelRect.height,
      }}
    >
      <div
        className="flex cursor-move items-center justify-between gap-2 border-b border-white/15 px-4 py-3"
        onMouseDown={(event) => {
          setInteraction({
            mode: "drag",
            startMouseX: event.clientX,
            startMouseY: event.clientY,
            startX: panelRect.x,
            startY: panelRect.y,
          });
        }}
      >
        <h2 className="text-sm font-semibold">{title}</h2>
        {headerActions ?? <div />}
      </div>

      <div className="scrollbar-dark flex-1 overflow-y-auto p-4">
        {children}
      </div>

      <div
        className="absolute bottom-0 right-0 h-5 w-5 cursor-se-resize"
        onMouseDown={(event) => {
          event.stopPropagation();
          setInteraction({
            mode: "resize",
            startMouseX: event.clientX,
            startMouseY: event.clientY,
            startWidth: panelRect.width,
            startHeight: panelRect.height,
          });
        }}
      >
        <div className="absolute bottom-1 right-1 h-2.5 w-2.5 border-b border-r border-white/70" />
      </div>
    </aside>
  );
}

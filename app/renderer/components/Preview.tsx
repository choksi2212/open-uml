import { useState, useEffect, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, AlertTriangle, Loader2, FileImage } from 'lucide-react';
import { IconButton } from './ui/IconButton';
import { Tooltip } from './ui/Tooltip';
import { DiagramRenderPayload } from '../../preload';
import { ZOOM_DEFAULT, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '../lib/constants';
import { cn } from '../lib/cn';

interface PreviewProps {
  data: string | null;
  isRendering: boolean;
  format: 'svg' | 'png';
  diagrams?: DiagramRenderPayload[] | null;
  activeDiagram?: number;
  onSelectDiagram?: (index: number) => void;
}

export function Preview({
  data,
  isRendering,
  format,
  diagrams,
  activeDiagram = 0,
  onSelectDiagram,
}: PreviewProps) {
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpaceHeld, setIsSpaceHeld] = useState(false);
  const panStart = useRef({ x: 0, y: 0, mouseX: 0, mouseY: 0 });
  const stageRef = useRef<HTMLDivElement>(null);

  const zoomBy = useCallback((delta: number) => {
    setZoom((prev) => {
      const next = Math.round((prev + delta) * 100) / 100;
      return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
    });
  }, []);

  const resetView = useCallback(() => {
    setZoom(ZOOM_DEFAULT);
    setPan({ x: 0, y: 0 });
  }, []);

  // Reset view on new data.
  useEffect(() => {
    setZoom(ZOOM_DEFAULT);
    setPan({ x: 0, y: 0 });
  }, [data, format]);

  // Scroll-to-zoom anywhere on the preview.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      zoomBy(delta);
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [zoomBy]);

  // Spacebar-held enables pan regardless of zoom.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpaceHeld && !isEditableTarget(e.target)) {
        e.preventDefault();
        setIsSpaceHeld(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceHeld(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isSpaceHeld]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1 && !isSpaceHeld) return;
    setIsPanning(true);
    panStart.current = { x: pan.x, y: pan.y, mouseX: e.clientX, mouseY: e.clientY };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isPanning) return;
    const onMove = (e: MouseEvent) => {
      setPan({
        x: panStart.current.x + (e.clientX - panStart.current.mouseX),
        y: panStart.current.y + (e.clientY - panStart.current.mouseY),
      });
    };
    const onUp = () => setIsPanning(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isPanning]);

  const showTabs = !!diagrams && diagrams.length > 1;

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-bg-elevated border border-border rounded-md overflow-hidden',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'h-9 px-3 flex items-center justify-between border-b border-border',
          'bg-bg-elevated',
        )}
      >
        <span className="text-[11px] font-medium text-fg-muted tracking-wide uppercase">
          Preview
        </span>
        <div className="flex items-center gap-1">
          {data && (
            <Tooltip content="Fit to window">
              <IconButton
                icon={<Maximize2 className="h-3.5 w-3.5" />}
                label="Fit to window"
                size="sm"
                onClick={resetView}
              />
            </Tooltip>
          )}
          <Tooltip content="Zoom out" shortcut="Ctrl+Scroll">
            <IconButton
              icon={<ZoomOut className="h-3.5 w-3.5" />}
              label="Zoom out"
              size="sm"
              onClick={() => zoomBy(-ZOOM_STEP)}
              disabled={!data}
            />
          </Tooltip>
          <span className="text-[11px] font-mono text-fg-subtle tabular-nums w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Tooltip content="Zoom in" shortcut="Ctrl+Scroll">
            <IconButton
              icon={<ZoomIn className="h-3.5 w-3.5" />}
              label="Zoom in"
              size="sm"
              onClick={() => zoomBy(ZOOM_STEP)}
              disabled={!data}
            />
          </Tooltip>
        </div>
      </div>

      {/* Diagram tabs */}
      {showTabs && (
        <div
          className={cn(
            'flex items-stretch gap-px px-2 py-1 border-b border-border overflow-x-auto',
            'bg-bg-elevated',
          )}
        >
          {diagrams!.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDiagram?.(i)}
              title={d.ok ? 'Diagram rendered' : d.error?.shortMessage || 'Rendering failed'}
              className={cn(
                'px-2.5 py-1 text-xs rounded-sm transition-colors flex items-center gap-1.5 shrink-0',
                i === activeDiagram
                  ? 'bg-surface-2 text-fg'
                  : 'text-fg-muted hover:text-fg hover:bg-surface-1',
              )}
            >
              <span>Diagram {i + 1}</span>
              {!d.ok && <AlertTriangle className="h-3 w-3 text-warn" />}
            </button>
          ))}
        </div>
      )}

      {/* Stage */}
      <div
        ref={stageRef}
        className={cn(
          'flex-1 min-h-0 overflow-hidden relative graph-paper',
          isPanning ? 'cursor-grabbing' : isSpaceHeld ? 'cursor-grab' : '',
        )}
        onMouseDown={handleMouseDown}
      >
        {isRendering ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-fg-muted">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
            <span className="text-xs">Rendering</span>
          </div>
        ) : data ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="transition-transform duration-150 ease-out"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center',
                willChange: 'transform',
              }}
            >
              <img
                src={data}
                alt="Diagram preview"
                draggable={false}
                className="max-w-full max-h-full block select-none"
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-fg-subtle">
            <FileImage className="h-8 w-8 opacity-40" />
            <span className="text-xs">No diagram</span>
            <span className="text-[11px]">Start typing PlantUML to render</span>
          </div>
        )}
      </div>
    </div>
  );
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}

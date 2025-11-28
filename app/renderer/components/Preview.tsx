import React, { useState, useEffect, useRef } from 'react';

interface PreviewProps {
  data: string | null;
  isRendering: boolean;
  format: 'svg' | 'png';
  theme: 'dark' | 'light';
}

const Preview: React.FC<PreviewProps> = ({ data, isRendering, format, theme }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoom = (delta: number) => {
    setZoom(prev => {
      const next = +(prev + delta).toFixed(2);
      return Math.min(3, Math.max(0.25, next));
    });
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [data, format]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (zoom > 1) {
          setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          });
        }
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart, zoom]);

  return (
    <div className={`flex-1 flex flex-col overflow-hidden rounded-3xl border backdrop-blur-xl h-full ${
      theme === 'dark'
        ? 'bg-[#051321]/95 border-amber-50/10 shadow-[0_25px_70px_rgba(3,10,20,0.85)]'
        : 'bg-white border-slate-200 shadow-xl'
    }`}>
      <div className={`
        px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.35em] border-b flex items-center justify-between
        ${theme === 'dark' ? 'bg-[#03101e]/80 border-amber-50/5 text-amber-100/80' : 'bg-slate-50 border-slate-200 text-slate-600'}
      `}>
        <span>Preview</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] opacity-60 font-medium">Zoom {(zoom * 100).toFixed(0)}%</span>
          <div className="inline-flex rounded-md overflow-hidden border border-gray-300 dark:border-dark-border">
            <button
              type="button"
              onClick={() => handleZoom(-0.1)}
              className={`px-3 py-1 text-sm font-semibold ${theme === 'dark' ? 'bg-dark-surface text-gray-200 hover:bg-slate-700' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              -
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className={`px-3 py-1 text-sm font-semibold border-l border-r ${theme === 'dark' ? 'border-dark-border bg-dark-surface text-gray-200 hover:bg-slate-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.1)}
              className={`px-3 py-1 text-sm font-semibold ${theme === 'dark' ? 'bg-dark-surface text-gray-200 hover:bg-slate-700' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div 
        ref={containerRef}
        className={`
        flex-1 overflow-hidden p-8 preview-stage
        ${theme === 'dark' ? 'preview-stage--dark' : 'preview-stage--light'}
        ${zoom > 1 ? 'cursor-grab' : ''}
        ${isDragging ? 'cursor-grabbing' : ''}
      `}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="preview-center">
        {isRendering ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Rendering diagram...
            </p>
          </div>
        ) : data ? (
          <div
            className="preview-zoom"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s ease',
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
          >
            <img
              src={data}
              alt="Diagram preview"
              className="preview-img"
              draggable={false}
            />
          </div>
        ) : (
          <div className={`
            text-center
            ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
          `}>
            <p className="text-lg mb-2">No preview available</p>
            <p className="text-sm">Start typing PlantUML code to see the diagram</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Preview;


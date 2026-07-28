import React, { useRef } from 'react';
import { Columns2, Grid, ZoomIn, ZoomOut, RotateCcw, Eye, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useMoodSyncStore } from '../../store/useMoodSyncStore';
import { getCssFilterString } from '../../utils/filterEngine';

export const CenterCanvas: React.FC = () => {
  const {
    images,
    activeImageId,
    viewMode,
    splitPosition,
    zoomLevel,
    setViewMode,
    setSplitPosition,
    setZoomLevel,
    resetImageParams,
    setActiveImage,
  } = useMoodSyncStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const activeImage = images.find((img) => img.id === activeImageId) || images[0];

  const handleSliderDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.round((x / rect.width) * 100);
    setSplitPosition(percentage);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const handleMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
      setSplitPosition(Math.round((x / rect.width) * 100));
    };
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const activeFilterStyle = activeImage ? getCssFilterString(activeImage.appliedParams) : '';

  return (
    <main className="flex-1 h-[calc(100vh-4rem)] bg-[#070A12] flex flex-col overflow-hidden relative">
      {/* 1. Canvas Top Toolbar */}
      <div className="h-12 px-6 border-b border-white/10 glass-panel flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-400 mr-2 flex items-center">
            <Eye className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Mode:
          </span>
          <div className="bg-gray-900/80 p-1 rounded-lg border border-white/10 flex items-center space-x-1">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-all ${
                viewMode === 'split'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Split View (Before/After)</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid Overview ({images.length})</span>
            </button>
          </div>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center space-x-4">
          {viewMode === 'split' && (
            <div className="flex items-center space-x-2 bg-gray-900/60 border border-white/10 px-2.5 py-1 rounded-lg text-xs">
              <button
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                className="p-1 hover:text-indigo-400 text-gray-400 transition-colors"
                title="줌 아웃"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono w-10 text-center font-medium text-gray-300">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                className="p-1 hover:text-indigo-400 text-gray-400 transition-colors"
                title="줌 인"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={resetImageParams}
            className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            title="현재 이미지의 필터 및 보정값 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Adjustments</span>
          </button>
        </div>
      </div>

      {/* 2. Workspace Viewport */}
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center relative">
        {viewMode === 'split' ? (
          /* Split View Mode (Before/After Swipe Slider) */
          activeImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <div
                ref={containerRef}
                onClick={handleSliderDrag}
                style={{ transform: `scale(${zoomLevel / 100})`, transition: 'transform 0.15s ease' }}
                className="relative max-w-full max-h-[calc(100vh-12rem)] rounded-2xl overflow-hidden shadow-2xl border border-white/15 cursor-ew-resize select-none bg-gray-950"
              >
                {/* AFTER Image (Right side - Filter Applied) */}
                <img
                  src={activeImage.originalUrl}
                  alt="After Filter"
                  style={{ filter: activeFilterStyle }}
                  className="block max-h-[70vh] w-auto object-contain pointer-events-none"
                />

                {/* BEFORE Image (Left side - Raw Original) */}
                <div
                  style={{ width: `${splitPosition}%` }}
                  className="absolute top-0 left-0 h-full overflow-hidden border-r-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)]"
                >
                  <img
                    src={activeImage.originalUrl}
                    alt="Before Raw Original"
                    className="block max-h-[70vh] w-auto max-w-none object-contain pointer-events-none"
                    style={{
                      width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                      height: containerRef.current ? `${containerRef.current.clientHeight}px` : '100%'
                    }}
                  />
                  {/* Before Badge */}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[11px] font-bold tracking-wider text-gray-300 shadow-lg">
                    RAW BEFORE
                  </div>
                </div>

                {/* After Badge */}
                <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-md px-3 py-1 rounded-full border border-indigo-400/30 text-[11px] font-bold tracking-wider text-white shadow-lg flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI AFTER ({activeFilterStyle ? 'Filtered' : 'Original'})</span>
                </div>

                {/* Interactive Slider Handle Bar */}
                <div
                  onMouseDown={handleMouseDown}
                  style={{ left: `${splitPosition}%` }}
                  className="absolute top-0 bottom-0 w-1 -ml-0.5 bg-gradient-to-b from-indigo-400 via-pink-500 to-indigo-400 cursor-ew-resize flex items-center justify-center group"
                >
                  <div className="w-8 h-8 rounded-full bg-white text-indigo-900 shadow-xl border-2 border-indigo-500 flex items-center justify-center font-bold text-xs group-hover:scale-125 transition-transform shadow-indigo-500/50">
                    ↔
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">이미지를 선택하거나 좌측 패널에서 업로드하세요.</div>
          )
        ) : (
          /* Grid Overview Mode */
          <div className="w-full h-full overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((img) => {
                const isActive = img.id === activeImageId;
                const filterStyle = getCssFilterString(img.appliedParams);

                return (
                  <div
                    key={img.id}
                    onClick={() => setActiveImage(img.id)}
                    className={`glass-card rounded-2xl overflow-hidden cursor-pointer group relative ${
                      isActive ? 'glass-card-active ring-2 ring-indigo-500' : ''
                    }`}
                  >
                    <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden">
                      <img
                        src={img.thumbnailUrl}
                        alt={img.name}
                        style={{ filter: filterStyle }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {img.isAnchor && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-black px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center">
                          ★ Master Anchor
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-gray-300">
                        {img.width}×{img.height}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white truncate flex-1" title={img.name}>
                          {img.name}
                        </h4>
                        {img.isSynced && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                            Synced
                          </span>
                        )}
                      </div>

                      {/* Color Palette Chips Preview */}
                      <div className="flex items-center space-x-1.5 mt-3">
                        {img.colorPalette.slice(0, 5).map((color, idx) => (
                          <div
                            key={idx}
                            style={{ backgroundColor: color.hex }}
                            className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                            title={`${color.name} (${color.hex})`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Status Helper Bar */}
      <div className="h-8 px-6 bg-gray-950 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 shrink-0">
        <div className="flex items-center space-x-4">
          <span>Active Asset: <strong className="text-gray-200">{activeImage?.name}</strong></span>
          <span>Resolution: <strong className="text-gray-200">{activeImage?.width} × {activeImage?.height} px</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Tip: 중앙 핸들 바를 좌우로 드래그하여 실시간 필터 효과를 비교하세요.</span>
        </div>
      </div>
    </main>
  );
};

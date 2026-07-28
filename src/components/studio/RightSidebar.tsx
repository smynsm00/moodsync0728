import React, { useState, useRef } from 'react';
import { Zap, Sliders, Palette, Code, FileJson, Copy, Check, AlertCircle, Sun, Contrast, Droplets, Thermometer, RotateCcw, Pin, Trash2, Sparkles, GripHorizontal } from 'lucide-react';
import { useMoodSyncStore } from '../../store/useMoodSyncStore';
import { getCssFilterString } from '../../utils/filterEngine';
import { generateJsonDesignTokens, downloadJsonTokens, copyToClipboard } from '../../utils/tokenExtractor';
import confetti from 'canvas-confetti';

import { analyzeMoodWithGemini } from '../../services/supabaseService';

export const RightSidebar: React.FC = () => {
  const {
    images,
    activeImageId,
    anchorImageId,
    savedToneLocks,
    activeSavedToneId,
    userTier,
    isProcessing,
    applyToneLock,
    saveCurrentToneLockSlot,
    applySavedToneLockSlot,
    removeSavedToneLockSlot,
    updateImageParams,
    toggleUserTier,
  } = useMoodSyncStore();

  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'adjust' | 'handoff'>('adjust');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // A영역 (Tone Lock) vs B영역 (Micro-Adjustments) 상하 크기 조절 상태
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [topSectionHeight, setTopSectionHeight] = useState<number>(40); // 기본 40%

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = topSectionHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!sidebarRef.current) return;
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const deltaY = moveEvent.clientY - startY;
      const deltaPercentage = (deltaY / sidebarRect.height) * 100;
      // 최솟값 18%, 최댓값 75%
      const newHeight = Math.max(18, Math.min(75, startHeight + deltaPercentage));
      setTopSectionHeight(newHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleGeminiAiAnalyze = async () => {
    setAiAnalyzing(true);
    setAiAnalysisResult(null);
    const result = await analyzeMoodWithGemini(
      `이 이미지 (${activeImage?.name})의 감성 무드, 색조 특징, 어울리는 필터 밝기/대비/채도 톤 추천을 2줄로 요약해줘.`
    );
    setAiAnalyzing(false);
    if (result.success && result.aiAnalysis) {
      setAiAnalysisResult(result.aiAnalysis);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else {
      setAiAnalysisResult(`⚠️ AI 분석 오류: ${result.error || '응답 실패'}`);
    }
  };

  const activeImage = images.find((img) => img.id === activeImageId) || images[0];
  const params = activeImage?.appliedParams || { brightness: 100, contrast: 100, saturation: 100, temperature: 0, tint: 0, sepia: 0, hueRotate: 0 };
  const cssFilter = activeImage ? getCssFilterString(params) : '';

  const handleCopyHex = async (hex: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    }
  };

  const handleCopyCss = async () => {
    const code = `/* MoodSync Generated CSS Filter for ${activeImage?.name} */\n.moodsync-filter {\n  filter: ${cssFilter};\n}`;
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
    }
  };

  const handleCopyJson = async () => {
    if (activeImage) {
      const json = generateJsonDesignTokens(activeImage);
      const success = await copyToClipboard(json);
      if (success) {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      }
    }
  };

  const handleDownloadTokens = () => {
    if (activeImage) {
      downloadJsonTokens(activeImage);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  return (
    <aside 
      ref={sidebarRef}
      className="w-80 lg:w-96 h-[calc(100vh-4rem)] border-l border-slate-700/80 bg-[#0B0F19] p-3 flex flex-col overflow-hidden shrink-0 select-none"
    >
      {/* 1. Tone Lock Section Card (A영역: Amber/Gold Left Accent - 드래그 높이 조절) */}
      <div 
        style={{ height: `${topSectionHeight}%` }}
        className="bg-[#111827] border border-slate-700/80 border-l-4 border-l-amber-400 rounded-xl overflow-hidden shadow-xl shrink-0 flex flex-col transition-[height] duration-75"
      >
        {/* Card Header Bar */}
        <div className="bg-slate-800/90 px-3 py-2 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-xs font-bold text-white tracking-wide">Tone Lock (A영역)</h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
            ★ Multiple Slots ({savedToneLocks.length})
          </span>
        </div>

        {/* Card Body */}
        <div className="p-3 overflow-y-auto flex-1 space-y-2.5">
          {/* Saved Tone Lock Slots Grid */}
          <div className="space-y-2">
            {savedToneLocks.map((slot) => {
              const isActive = slot.id === activeSavedToneId;

              return (
                <div
                  key={slot.id}
                  onClick={() => applySavedToneLockSlot(slot.id)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 via-indigo-900/40 to-purple-900/40 border-amber-400 ring-1 ring-amber-400/50 shadow-md shadow-amber-500/10'
                      : 'bg-gray-900/70 border-slate-700/60 hover:border-indigo-400/60 hover:bg-gray-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                      <Pin className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400 fill-current animate-bounce' : 'text-gray-500'}`} />
                      <span className={`text-xs font-bold truncate ${isActive ? 'text-amber-200' : 'text-gray-200'}`}>
                        {slot.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                      {isActive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-black">
                          적용중
                        </span>
                      )}
                      {savedToneLocks.length > 1 && (
                        <button
                          onClick={() => removeSavedToneLockSlot(slot.id)}
                          className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                          title="고정값 슬롯 삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slot Parameter Badges */}
                  <div className="flex items-center space-x-1.5 mt-1.5 font-mono text-[10px] text-gray-400">
                    <span className="bg-gray-800 px-1.5 py-0.5 rounded border border-white/10">
                      B:{slot.params.brightness}%
                    </span>
                    <span className="bg-gray-800 px-1.5 py-0.5 rounded border border-white/10">
                      C:{slot.params.contrast}%
                    </span>
                    <span className="bg-gray-800 px-1.5 py-0.5 rounded border border-white/10">
                      Temp:{slot.params.temperature > 0 ? `+${slot.params.temperature}` : slot.params.temperature}
                    </span>
                    <span className="text-[9px] text-gray-500 ml-auto">{slot.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Global Sync CTA */}
          <button
            onClick={applyToneLock}
            disabled={isProcessing || images.length <= 1}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 shadow-md shadow-amber-500/25 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>LAB 매칭 동기화 연산 중...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-black fill-current animate-bounce" />
                <span className="text-black font-extrabold">⚡ 현재 마스터 톤 전체 동기화 ({images.length} Assets)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* A영역 vs B영역 상하 크기 조절 드래그 바 (Interactive Vertical Resize Divider Handle Bar) */}
      <div
        onMouseDown={handleMouseDownResize}
        className="py-1.5 my-0.5 group cursor-row-resize flex items-center justify-center shrink-0 z-30 transition-colors hover:bg-amber-500/20 rounded-lg select-none"
        title="드래그하여 A영역/B영역 상하 크기 조절"
      >
        <div className="w-20 h-1.5 rounded-full bg-slate-700 group-hover:bg-amber-400 transition-all flex items-center justify-center shadow-md">
          <GripHorizontal className="w-3.5 h-3.5 text-slate-400 group-hover:text-black transition-colors" />
        </div>
      </div>

      {/* 2. Micro-Adjustments & Developer Handoff Card (B영역: Violet/Purple Left Accent) */}
      <div className="bg-[#111827] border border-slate-700/80 border-l-4 border-l-purple-500 rounded-xl overflow-hidden shadow-xl flex-1 flex flex-col min-h-0">
        {/* Tab Header Bar */}
        <div className="bg-slate-800/90 p-1.5 border-b border-slate-700/80 flex space-x-1 shrink-0">
          <button
            onClick={() => setActiveTab('adjust')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'adjust'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Micro-Adjustments</span>
          </button>
          <button
            onClick={() => setActiveTab('handoff')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'handoff'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Developer Handoff</span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-3 overflow-y-auto flex-1">
          {activeTab === 'adjust' ? (
            /* TAB 1: Micro-Adjustments Sliders & B 영역 Save Button */
            <div className="space-y-3.5">
              {/* Selected Asset Header & B 영역 Save Slot Button */}
              <div className="space-y-2.5 p-3 rounded-xl bg-gray-900/80 border border-slate-700/70">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span className="truncate">Selected: <strong className="text-white">{activeImage?.name}</strong></span>
                    {activeImage?.id === anchorImageId && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shrink-0">
                        ★ Anchor
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => updateImageParams({ brightness: 100, contrast: 100, saturation: 100, temperature: 0, tint: 0 })}
                    className="text-indigo-400 hover:underline text-[11px] flex items-center shrink-0 ml-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> 리셋
                  </button>
                </div>

                {/* A & B Action Buttons (좌우 2열 배치) */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Button A: 현재보정값 고정 */}
                  <button
                    onClick={() => saveCurrentToneLockSlot()}
                    className="py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 border border-indigo-400/40 text-white hover:scale-[1.02] truncate"
                    title="현재보정값 고정"
                  >
                    <Pin className="w-3.5 h-3.5 text-amber-300 fill-current shrink-0" />
                    <span className="truncate">현재보정값 고정</span>
                  </button>

                  {/* Button B: Gemini AI 무드분석 */}
                  <button
                    onClick={handleGeminiAiAnalyze}
                    disabled={aiAnalyzing}
                    className="py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all bg-slate-800 hover:bg-slate-700 border border-purple-500/40 text-purple-300 hover:text-white truncate disabled:opacity-50"
                    title="Gemini AI 무드분석"
                  >
                    {aiAnalyzing ? (
                      <>
                        <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin shrink-0" />
                        <span className="truncate">분석 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse shrink-0" />
                        <span className="truncate">Gemini AI 무드분석</span>
                      </>
                    )}
                  </button>
                </div>

                {aiAnalysisResult && (
                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs text-purple-200 animate-fade-in whitespace-pre-wrap">
                    <p className="font-bold text-purple-300 mb-1">🤖 Gemini AI 분석 결과:</p>
                    {aiAnalysisResult}
                  </div>
                )}
              </div>

              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center text-gray-200"><Sun className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Brightness (밝기)</span>
                  <span className="font-mono text-indigo-400 font-bold">{params.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={params.brightness}
                  onChange={(e) => updateImageParams({ brightness: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center text-gray-200"><Contrast className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Contrast (대비)</span>
                  <span className="font-mono text-indigo-400 font-bold">{params.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="160"
                  value={params.contrast}
                  onChange={(e) => updateImageParams({ contrast: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center text-gray-200"><Droplets className="w-3.5 h-3.5 mr-1.5 text-pink-400" /> Saturation (채도)</span>
                  <span className="font-mono text-indigo-400 font-bold">{params.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={params.saturation}
                  onChange={(e) => updateImageParams({ saturation: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Temperature */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center text-gray-200"><Thermometer className="w-3.5 h-3.5 mr-1.5 text-orange-400" /> Temperature (색온도)</span>
                  <span className="font-mono text-indigo-400 font-bold">{params.temperature > 0 ? `+${params.temperature}` : params.temperature}</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={params.temperature}
                  onChange={(e) => updateImageParams({ temperature: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Tint */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center text-gray-200"><Palette className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> Tint (틴트/색조)</span>
                  <span className="font-mono text-indigo-400 font-bold">{params.tint > 0 ? `+${params.tint}` : params.tint}</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={params.tint}
                  onChange={(e) => updateImageParams({ tint: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          ) : (
            /* TAB 2: Developer Handoff Suite */
            <div className="space-y-4 animate-fade-in">
              {/* 1. Extracted Color Palette Tokens */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center"><Palette className="w-3.5 h-3.5 mr-1.5 text-pink-400" /> Dominant Color Tokens</span>
                  <span className="text-[10px] text-indigo-400 lowercase font-medium">click to copy hex</span>
                </h3>
                
                <div className="space-y-1.5">
                  {activeImage?.colorPalette.map((token, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopyHex(token.hex)}
                      className="p-2 rounded-xl bg-gray-900/70 border border-slate-700/60 hover:border-indigo-400 flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          style={{ backgroundColor: token.hex }}
                          className="w-7 h-7 rounded-lg shadow-md border border-white/20 shrink-0"
                        />
                        <div>
                          <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors block">
                            {token.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            WCAG: <strong className="text-emerald-400">{token.contrastRatio}</strong>
                          </span>
                        </div>
                      </div>
                      
                      <div className="font-mono text-xs text-gray-300 font-semibold bg-gray-800 px-2 py-0.5 rounded border border-white/10">
                        <span>{copiedHex === token.hex ? '✓ Copied!' : token.hex}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. CSS Filter Code Snippet */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center">
                    <Code className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> CSS Filter Property
                  </h3>
                  <button
                    onClick={handleCopyCss}
                    className="text-xs px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 flex items-center space-x-1 transition-colors"
                  >
                    {copiedCss ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy CSS</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-black/90 border border-slate-700/80 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                  <code>filter: {cssFilter || 'none'};</code>
                </div>
              </div>

              {/* 3. JSON Design Tokens Generator */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-gray-900 to-indigo-950/40 border border-indigo-500/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold text-white flex items-center">
                    <FileJson className="w-4 h-4 mr-1.5 text-amber-400" /> JSON Design Tokens
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                    Tailwind / W3C Ready
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 mb-2.5">
                  Figma Tokens 및 Tailwind config에 연동되는 JSON 토큰을 일괄 추출합니다.
                </p>

                <div className="flex space-x-2">
                  <button
                    onClick={handleDownloadTokens}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                  <button
                    onClick={handleCopyJson}
                    className="py-1.5 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-white/10 font-medium text-xs flex items-center justify-center transition-all"
                    title="JSON 복사"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {userTier === 'free' && (
                  <div 
                    onClick={toggleUserTier} 
                    className="mt-2 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center space-x-2 cursor-pointer hover:bg-amber-500/20 transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[10px] text-amber-300 font-medium">Free 티어에서는 샘플 토큰이 제공됩니다. PRO로 잠금 해제하세요!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

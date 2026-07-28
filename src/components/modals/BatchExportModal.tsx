import React, { useState } from 'react';
import { X, Download, Crown, FileArchive, CheckCircle2, Lock, Layers } from 'lucide-react';
import { useMoodSyncStore } from '../../store/useMoodSyncStore';
import { batchExportZip, type ExportProgress } from '../../utils/exportEngine';
import confetti from 'canvas-confetti';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({ isOpen, onClose }) => {
  const { images, exportConfig, setExportConfig, userTier, toggleUserTier } = useMoodSyncStore();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setIsCompleted(false);
    setProgress({ current: 0, total: images.length, statusText: "초기화 중..." });

    try {
      await batchExportZip(images, exportConfig, userTier, (prog) => {
        setProgress(prog);
      });
      setIsCompleted(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error("Batch export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFormatSelect = (fmt: 'jpg' | 'png' | 'webp' | 'json') => {
    if ((fmt === 'png' || fmt === 'webp') && userTier === 'free') {
      toggleUserTier();
      return;
    }
    setExportConfig({ format: fmt });
  };

  const handleResolutionSelect = (res: '1080p' | 'original') => {
    if (res === 'original' && userTier === 'free') {
      toggleUserTier();
      return;
    }
    setExportConfig({ resolutionMode: res });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#111827] border border-white/15 rounded-2xl shadow-2xl overflow-hidden glass-panel">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 to-transparent">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Batch Export Studio</h3>
              <span className="text-[11px] text-gray-400">총 {images.length}장 이미지 및 토큰 ZIP 패키징</span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* 1. Format Selection */}
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-2.5 flex items-center justify-between">
              <span>Export Format (파일 형식)</span>
              {userTier === 'free' && <span className="text-[10px] text-amber-400 font-normal">PNG/WEBP는 PRO 전용</span>}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'jpg', label: 'JPG', desc: '표준 고품질', locked: false },
                { id: 'png', label: 'PNG', desc: '무손실 원본', locked: userTier === 'free' },
                { id: 'webp', label: 'WEBP', desc: '차세대 고효율', locked: userTier === 'free' },
                { id: 'json', label: 'JSON Only', desc: '토큰 전용', locked: false },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleFormatSelect(item.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all relative ${
                    exportConfig.format === item.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold ring-2 ring-indigo-500/50'
                      : 'bg-gray-900/50 border-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{item.desc}</div>
                  {item.locked && (
                    <div className="absolute top-1 right-1 text-amber-400" title="PRO 전용">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Resolution Mode */}
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-2.5 flex items-center justify-between">
              <span>Resolution Mode (해상도 선택)</span>
              {userTier === 'free' && <span className="text-[10px] text-amber-400 font-normal">원본 해상도는 PRO 전용</span>}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleResolutionSelect('1080p')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  exportConfig.resolutionMode === '1080p'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/50'
                    : 'bg-gray-900/50 border-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>1080p Standard</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded">Free</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">웹/SNS 최적화 (긴 변 기준 최대 1080px)</p>
              </button>

              <button
                onClick={() => handleResolutionSelect('original')}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  exportConfig.resolutionMode === 'original'
                    ? 'bg-amber-500/10 border-amber-500 text-white ring-2 ring-amber-500/50'
                    : 'bg-gray-900/50 border-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Original Full Res</span>
                  {userTier === 'free' ? (
                    <span className="text-[9px] px-1.5 py-0.2 bg-amber-500 text-black font-bold rounded flex items-center">
                      <Crown className="w-2.5 h-2.5 mr-0.5" /> PRO
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">Unlocked</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">업로드된 고해상도 원본 100% 무손실 렌더링</p>
              </button>
            </div>
          </div>

          {/* 3. Quality Slider (if JPG/WEBP) */}
          {exportConfig.format !== 'png' && exportConfig.format !== 'json' && (
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-300 mb-1.5">
                <span>Compression Quality (압축 퀄리티)</span>
                <span className="font-mono text-indigo-400">{Math.round(exportConfig.quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.0"
                step="0.05"
                value={exportConfig.quality}
                onChange={(e) => setExportConfig({ quality: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>용량 최소화 (60%)</span>
                <span>최고 화질 (100%)</span>
              </div>
            </div>
          )}

          {/* 4. Package Contents Preview */}
          <div className="p-3 rounded-xl bg-gray-950 border border-white/10 text-xs space-y-1.5">
            <div className="font-semibold text-gray-300 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              <span>ZIP 패키지 포함 내역:</span>
            </div>
            <ul className="text-[11px] text-gray-400 space-y-1 pl-5 list-disc">
              <li>변환된 보정 이미지 {images.length}장 (<strong className="text-white uppercase">{exportConfig.format}</strong> 포맷)</li>
              <li>W3C 규격 디자인 토큰 JSON 파일 ({images.length}개 개별 + 마스터)</li>
              <li>CSS filter 속성 및 HEX 컬러 팔레트 요약표</li>
            </ul>
          </div>

          {/* Progress Bar during Export */}
          {isExporting && progress && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2 animate-pulse">
              <div className="flex justify-between text-xs font-semibold text-indigo-300">
                <span>{progress.statusText}</span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Completed Success Box */}
          {isCompleted && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center space-x-3 text-emerald-300 animate-fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">🎉 성공적으로 내보냈습니다!</p>
                <p className="text-emerald-400/80 text-[11px] mt-0.5">브라우저 다운로드 폴더의 ZIP 패키지를 확인하세요.</p>
              </div>
            </div>
          )}

          {/* Action CTA Button */}
          <button
            onClick={handleStartExport}
            disabled={isExporting}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white glass-button flex items-center justify-center space-x-2 shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <FileArchive className="w-5 h-5" />
            <span>{isExporting ? "ZIP 패키지 생성 중..." : `🚀 Export All ${images.length} Assets (ZIP)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

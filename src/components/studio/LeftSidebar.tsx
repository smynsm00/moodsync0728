import React, { useRef } from 'react';
import { Upload, Star, Sparkles, Image as ImageIcon, Trash2, CheckCircle } from 'lucide-react';
import { useMoodSyncStore } from '../../store/useMoodSyncStore';

export const LeftSidebar: React.FC = () => {
  const {
    images,
    presets,
    activeImageId,
    anchorImageId,
    selectedPresetId,
    userTier,
    setActiveImage,
    setAnchorImage,
    applyPreset,
    uploadImages,
    removeImage,
  } = useMoodSyncStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      uploadImages(fileArray);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files);
      uploadImages(fileArray);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <aside className="w-72 lg:w-80 h-[calc(100vh-4rem)] border-r border-slate-700/80 bg-[#0B0F19] p-3 space-y-3 flex flex-col overflow-hidden shrink-0">
      {/* 1. Drag & Drop Upload Zone Card (Cyan Left Accent) */}
      <div className="bg-[#111827] border border-slate-700/80 border-l-4 border-l-cyan-400 rounded-xl overflow-hidden shadow-xl shrink-0">
        <div className="bg-slate-800/90 px-3 py-2 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white tracking-wide">이미지 업로드</h2>
          </div>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
            {userTier === 'free' ? 'Free 10장' : 'PRO 300장'}
          </span>
        </div>

        <div className="p-3">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 bg-gray-900/60 hover:bg-cyan-950/20 rounded-lg p-3 text-center cursor-pointer transition-all group relative overflow-hidden"
          >
            <Upload className="w-6 h-6 mx-auto mb-1 text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all" />
            <p className="text-xs font-bold text-gray-200 group-hover:text-white">
              이미지 다중 드래그 & 드롭
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              JPG, PNG, WEBP, HEIC 지원
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* 2. Uploaded Assets List Card (Indigo Left Accent) */}
      <div className="bg-[#111827] border border-slate-700/80 border-l-4 border-l-indigo-500 rounded-xl overflow-hidden shadow-xl max-h-[36%] flex flex-col shrink-0">
        <div className="bg-slate-800/90 px-3 py-2 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold text-white tracking-wide">
              Active Assets ({images.length})
            </h2>
          </div>
          <span className="text-[10px] text-amber-300 font-semibold flex items-center">
            <Star className="w-3 h-3 text-amber-400 fill-current mr-0.5" /> Anchor: 마스터
          </span>
        </div>

        <div className="p-2.5 overflow-y-auto space-y-2 flex-1">
          {images.map((img) => {
            const isActive = img.id === activeImageId;
            const isAnchor = img.id === anchorImageId;

            return (
              <div
                key={img.id}
                onClick={() => setActiveImage(img.id)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-indigo-600/30 border-indigo-400 shadow-md ring-1 ring-indigo-400/40'
                    : 'bg-gray-900/60 border-slate-700/50 hover:bg-gray-800/80 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <div className="relative w-9 h-9 rounded-md overflow-hidden bg-gray-800 shrink-0 border border-white/10">
                    <img
                      src={img.thumbnailUrl}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    {isAnchor && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-black p-0.5 rounded-bl shadow-sm" title="Tone Lock 기준 마스터 이미지">
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-200 truncate" title={img.name}>
                      {img.name}
                    </p>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {img.width}x{img.height}
                      </span>
                      {img.isSynced && (
                        <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center">
                          <CheckCircle className="w-2 h-2 mr-0.5 inline" /> Synced
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                  {!isAnchor && (
                    <button
                      onClick={() => setAnchorImage(img.id)}
                      className="p-1 rounded hover:bg-amber-500/20 text-gray-500 hover:text-amber-400 transition-colors text-[10px]"
                      title="이 이미지를 Tone Lock 마스터 Anchor로 지정"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {images.length > 1 && (
                    <button
                      onClick={() => removeImage(img.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                      title="이미지 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AI Mood Presets Library Card (Pink/Purple Left Accent - ⭐ USER REQUESTED: 2열 이미지 버튼 카드 그리드) */}
      <div className="bg-[#111827] border border-slate-700/80 border-l-4 border-l-pink-500 rounded-xl overflow-hidden shadow-xl flex-1 flex flex-col min-h-0">
        <div className="bg-slate-800/90 px-3 py-2 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h2 className="text-xs font-bold text-white tracking-wide">
              AI Mood Presets
            </h2>
          </div>
          <span className="text-[10px] text-pink-300 font-mono font-semibold">3D LUT Engine</span>
        </div>

        {/* ⭐ 2열 이미지 버튼 카드 그리드 */}
        <div className="p-2.5 overflow-y-auto grid grid-cols-2 gap-2 flex-1">
          {presets.map((preset) => {
            const isSelected = selectedPresetId === preset.id;

            return (
              <div
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`group relative rounded-xl overflow-hidden cursor-pointer border transition-all h-24 flex flex-col justify-end p-2.5 ${
                  isSelected
                    ? 'border-pink-400 ring-2 ring-pink-400/60 shadow-lg shadow-pink-500/20'
                    : 'border-slate-700/70 hover:border-pink-400/80 hover:shadow-md'
                }`}
              >
                {/* 썸네일 그라데이션 비주얼 */}
                <div className={`absolute inset-0 bg-gradient-to-tr ${preset.previewColor} opacity-75 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300`} />
                
                {/* 다크 비네팅 어둡기 레이어 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* 선택 체크 뱃지 */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 bg-pink-500 text-white rounded-full p-0.5 shadow-md">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                )}


                {/* 하단 타이틀 & 설명 */}
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-white tracking-wide truncate group-hover:text-pink-200 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-[9px] text-gray-300 truncate mt-0.5 opacity-90">
                    {preset.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import { X, Sparkles, FolderPlus, Layers } from 'lucide-react';
import { useMoodSyncStore } from '../../store/useMoodSyncStore';
import confetti from 'canvas-confetti';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { createNewProject, isProcessing } = useMoodSyncStore();
  const [projectTitle, setProjectTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    await createNewProject(projectTitle);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#6366F1', '#EC4899', '#F59E0B', '#10B981']
    });
    setProjectTitle('');
    onClose();
  };

  const handleSelectPresetName = (name: string) => {
    setProjectTitle(name);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#0F172A] border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/20 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-transparent flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-600 flex items-center justify-center shadow-lg">
              <FolderPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">새 프로젝트 생성</h2>
              <span className="text-[11px] text-indigo-300">Supabase DB에 신규 워크스페이스를 등록합니다.</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1 text-indigo-400" /> 프로젝트 제목
            </label>
            <input
              type="text"
              required
              placeholder="예: 2026_Autumn_Winter_Lookbook"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-white/15 focus:border-indigo-500 text-sm text-white placeholder-gray-500 font-medium outline-none transition-all shadow-inner"
            />
          </div>

          {/* Quick Suggestions */}
          <div>
            <span className="text-[11px] text-gray-400 font-medium block mb-1.5">추천 카테고리 템플릿:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                '2026_SS_Lookbook',
                'Urban_Streetwear_Vibe',
                'Commercial_Product_2026',
                'High_Fashion_Editorial'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSelectPresetName(suggestion)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-gray-800 hover:bg-indigo-900/60 border border-white/10 hover:border-indigo-400 text-gray-300 hover:text-indigo-200 transition-all font-mono"
                >
                  +{suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isProcessing || !projectTitle.trim()}
              className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-extrabold flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Supabase 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
                  <span>✨ 프로젝트 생성 및 DB 저장</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Sparkles, Download, Layers, CheckCircle2, UserCheck, Plus, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useMoodSyncStore } from '../../store/useMoodSyncStore';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { AuthModal } from '../modals/AuthModal';

interface HeaderProps {
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenExportModal }) => {
  const { 
    profiles,
    projects,
    currentUserId,
    currentProjectId,
    isLoggedIn,
    logout,
    switchProject
  } = useMoodSyncStore();

  const [copiedLink, setCopiedLink] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const currentUser = profiles.find((p) => p.id === currentUserId);
  
  // 로그인한 유저 본인 소유의 프로젝트만 필터링하여 드롭다운에 노출
  const userProjects = projects.filter((p) => p.user_id === currentUserId);
  const displayProjects = userProjects.length > 0 
    ? userProjects 
    : projects.filter((p) => p.id === currentProjectId);

  const handleShare = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <>
      <header className="h-16 px-6 glass-panel border-b border-white/10 flex items-center justify-between sticky top-0 z-50">
        {/* Brand & Left Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-pink-300 bg-clip-text text-transparent">
                MoodSync
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 block -mt-1">
                AI Tone Lock Studio
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-white/15 hidden md:block" />

          {/* User Account Section */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-gray-900/90 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs shadow-md">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs text-gray-400 font-semibold shrink-0">User:</span>

            {isLoggedIn && currentUser ? (
              <>
                {/* 로그인 상태: 오직 로그인한 내 계정명 고정 표시 */}
                <span className="text-white font-bold text-xs">
                  {currentUser.full_name || currentUser.email} ({currentUser.user_tier.toUpperCase()})
                </span>

                {/* 로그아웃 아이콘 버튼 */}
                <button
                  onClick={logout}
                  className="ml-1.5 p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 transition-all flex items-center justify-center"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                {/* 비로그인 상태: '로그인을 해주세요.' 문구 표시 */}
                <span className="text-gray-400 font-medium text-xs">
                  로그인을 해주세요.
                </span>

                {/* 로그인 & 회원가입 아이콘 버튼 */}
                <div className="flex items-center space-x-1 ml-1.5">
                  <button
                    onClick={() => { setAuthModalMode('login'); setIsAuthModalOpen(true); }}
                    className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition-all flex items-center justify-center"
                    title="로그인"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setAuthModalMode('signup'); setIsAuthModalOpen(true); }}
                    className="p-1.5 rounded-lg bg-pink-600/30 hover:bg-pink-600 text-pink-300 hover:text-white border border-pink-500/40 transition-all flex items-center justify-center"
                    title="무료 회원가입"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Project Selector Box */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-900/90 border border-indigo-500/40 px-3 py-1.5 rounded-xl text-xs shadow-md">
            <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs text-gray-400 font-semibold shrink-0">Project:</span>

            <select
              value={currentProjectId}
              onChange={(e) => switchProject(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer border-none max-w-[180px] truncate"
            >
              {displayProjects.map((p) => (
                <option key={p.id} value={p.id} className="bg-gray-900 text-white font-semibold">
                  📂 {p.title}
                </option>
              ))}
            </select>


            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="ml-1 p-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-sm hover:scale-105 flex items-center justify-center"
              title="새 프로젝트 생성"
            >
              <Plus className="w-4 h-4 text-amber-300 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Right Side: Tier Switcher & Batch Export */}
        <div className="flex items-center space-x-4">
          {/* Share Preview Button */}
          <button
            onClick={handleShare}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-all"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Share Link Copied!</span>
              </>
            ) : (
              <span>🔗 Share Preview</span>
            )}
          </button>

          {/* 100% Free Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Free</span>
          </div>

          {/* Batch Export CTA */}
          <button
            onClick={onOpenExportModal}
            className="glass-button px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center space-x-2 shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform"
          >
            <Download className="w-4 h-4" />
            <span>Batch Export ({images.length})</span>
          </button>
        </div>
      </header>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Login & Sign-Up Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};

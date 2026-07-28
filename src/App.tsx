import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { LeftSidebar } from './components/studio/LeftSidebar';
import { CenterCanvas } from './components/studio/CenterCanvas';
import { RightSidebar } from './components/studio/RightSidebar';
import { BatchExportModal } from './components/modals/BatchExportModal';
import { NotificationToast } from './components/common/NotificationToast';
import { useMoodSyncStore } from './store/useMoodSyncStore';

export default function App() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const initSupabaseData = useMoodSyncStore((state) => state.initSupabaseData);

  useEffect(() => {
    initSupabaseData();
  }, [initSupabaseData]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-gray-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Header onOpenExportModal={() => setIsExportModalOpen(true)} />

      {/* 3-Column Studio Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar />
        <CenterCanvas />
        <RightSidebar />
      </div>

      {/* Batch Export Modal & Toast Notifications */}
      <BatchExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
      <NotificationToast />
    </div>
  );
}

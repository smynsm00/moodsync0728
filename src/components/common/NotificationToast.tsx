import React, { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useMoodSyncStore } from '../../store/useMoodSyncStore';

export const NotificationToast: React.FC = () => {
  const { notification, clearNotification } = useMoodSyncStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slide-up">
      <div className="p-4 rounded-2xl glass-panel border border-indigo-500/50 shadow-2xl shadow-indigo-500/20 bg-gradient-to-r from-gray-900/95 via-indigo-950/90 to-gray-900/95 flex items-start space-x-3 text-white">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 animate-spin" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-0.5">
            MoodSync Notification
          </h4>
          <p className="text-xs text-gray-200 leading-relaxed font-medium">
            {notification}
          </p>
        </div>

        <button
          onClick={clearNotification}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

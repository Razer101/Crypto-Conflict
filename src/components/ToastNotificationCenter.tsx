import React from 'react';
import { ToastNotification } from '../types/snapshot';
import { AlertTriangle, TrendingUp, TrendingDown, X, Bell } from 'lucide-react';

interface ToastNotificationCenterProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
  onOpenAlerts: () => void;
}

export const ToastNotificationCenter: React.FC<ToastNotificationCenterProps> = ({
  notifications,
  onDismiss,
  onOpenAlerts,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((toast) => {
        const isBtc = toast.asset === 'BTC';
        const isOil = toast.asset === 'OIL';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-[#0F172A]/95 backdrop-blur-md border border-amber-500/40 rounded-xl p-3.5 shadow-2xl shadow-amber-500/10 text-slate-100 animate-in slide-in-from-bottom-3 duration-200"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider">
                    {toast.title}
                  </span>
                  <button
                    onClick={() => onDismiss(toast.id)}
                    className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-200 mt-1 font-sans leading-relaxed">
                  {toast.message}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                  <span>Threshold breached just now</span>
                  <button
                    onClick={() => {
                      onDismiss(toast.id);
                      onOpenAlerts();
                    }}
                    className="text-amber-400 hover:text-amber-300 font-medium underline"
                  >
                    Manage alerts
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

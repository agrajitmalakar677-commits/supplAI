import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type NotificationType = "success" | "error" | "info";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: NotificationType = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const remove = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] space-y-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-[300px] ${
                n.type === "success" 
                  ? "bg-green-50 border-green-100 text-green-800" 
                  : n.type === "error"
                  ? "bg-red-50 border-red-100 text-red-800"
                  : "bg-blue-50 border-blue-100 text-blue-800"
              }`}
            >
              {n.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <p className="text-sm font-medium flex-1">{n.message}</p>
              <button 
                onClick={() => remove(n.id)}
                className="hover:opacity-70 transition-opacity"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotify = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotify must be used within NotificationProvider");
  return context;
};

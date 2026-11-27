"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      >
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const isSuccess = toast.type === "success";
          return (
            <div
              key={toast.id}
              role={isError ? "alert" : "status"}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-md ${
                isError
                  ? "border-[#B42318] bg-[#FEF3F2] text-[#8F1D14]"
                  : isSuccess
                  ? "border-[#167D8D] bg-[#E8F4F6] text-[#172B40]"
                  : "border-[#DCE4EB] bg-white text-[#172B40]"
              }`}
            >
              {isError ? (
                <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0 text-[#B42318]" size={18} />
              ) : isSuccess ? (
                <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-[#116471]" size={18} />
              ) : (
                <Info aria-hidden="true" className="mt-0.5 shrink-0 text-[#16324F]" size={18} />
              )}
              <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() => dismissToast(toast.id)}
                className="inline-flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-md text-[#526277] hover:bg-black/5"
              >
                <X aria-hidden="true" size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

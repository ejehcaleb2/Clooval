/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useToastStore, ToastItem } from "../../lib/store";

export default function ToastContainer() {
  const navigate = useNavigate();
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none flex flex-col gap-2 p-4 w-full md:max-w-md
                 bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:-translate-x-0 md:right-4 md:bottom-4"
    >
      {toasts.map((toast) => {
        let borderStyle = "border-l-4 border-l-[#111111]";
        let IconElement = Info;
        let iconColor = "text-[#111111]";

        if (toast.type === "success") {
          borderStyle = "border-l-4 border-l-[#27AE60]";
          IconElement = CheckCircle2;
          iconColor = "text-[#27AE60]";
        } else if (toast.type === "error") {
          borderStyle = "border-l-4 border-l-[#E74C3C]";
          IconElement = AlertTriangle;
          iconColor = "text-[#E74C3C]";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white text-[#111111] ${borderStyle} 
                       flex items-start justify-between gap-3 p-4 rounded-lg border border-[#E5E5E3] 
                       shadow-[0_4px_16px_rgba(0,0,0,0.08)] animate-slide-up w-full ${toast.url ? "cursor-pointer hover:bg-[#FBFBFB]" : ""}`}
            role="status"
            aria-live="polite"
            onClick={() => {
              if (toast.url) {
                navigate(toast.url);
                removeToast(toast.id);
              }
            }}
          >
            <div className="flex gap-2.5 items-start">
              <IconElement className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
              <p className="text-sm font-medium pr-2 leading-tight">{toast.message}</p>
            </div>
            <button
              onClick={(event) => {
                event.stopPropagation();
                removeToast(toast.id);
              }}
              className="text-[#999999] hover:text-[#111111] shrink-0 p-0.5 rounded-md hover:bg-[#F7F7F5] transition"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

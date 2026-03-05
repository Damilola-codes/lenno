"use client";

import { AlertCircle, X } from "lucide-react";

type AuthErrorToastProps = {
  message: string;
  onClose: () => void;
};

export default function AuthErrorToast({
  message,
  onClose,
}: AuthErrorToastProps) {
  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-red-700 flex-1 leading-5">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="text-red-500 hover:text-red-600"
        aria-label="Close error message"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

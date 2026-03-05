"use client";

import { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ProfileSectionEditorProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  children: ReactNode;
}

export default function ProfileSectionEditor({
  open,
  title,
  onClose,
  onSave,
  saving = false,
  children,
}: ProfileSectionEditorProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[79] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-[#0a4abf]/20" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-primary-200 bg-white p-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 rounded-full border border-primary-200 flex items-center justify-center text-primary-700 hover:bg-primary-50"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <h3 className="text-sm font-semibold text-primary-900">{title}</h3>

        <div className="mt-3">{children}</div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-primary-200 px-4 py-2 text-sm text-primary-700"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-full bg-[#abff31] px-4 py-2 text-sm font-medium text-primary-900 hover:bg-[#9ae62c] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

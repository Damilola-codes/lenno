"use client";

import Image from "next/image";

type AuthSuccessModalProps = {
  open: boolean;
  title: string;
  message: string;
};

export default function AuthSuccessModal({
  open,
  title,
  message,
}: AuthSuccessModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 w-24 h-24">
          <Image
            src="/successmark.png"
            alt="Success"
            width={96}
            height={96}
            className="w-24 h-24 animate-bounce"
            priority
          />
        </div>
        <h2 className="text-xl font-semibold text-[#0a4abf]">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

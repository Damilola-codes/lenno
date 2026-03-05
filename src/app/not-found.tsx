"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative w-full min-h-[100dvh] overflow-hidden">
      <Image
        src="/404.png"
        alt="404 Not Found"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 object-contain"
      />

      <div className="absolute inset-0 bg-primary-900/20" />

      <div className="relative z-10 flex min-h-[100dvh] items-end justify-center p-4 sm:p-8">
        <div className="mb-2 w-full max-w-md rounded-2xl border border-white/50 bg-white/80 p-3 backdrop-blur-sm sm:mb-4 sm:max-w-lg sm:p-4">
          <p className="mb-3 text-center text-xs font-medium text-primary-900 sm:text-sm">
            The page you visited was not found. It may have been moved, deleted,
            or the URL may be incorrect.
          </p>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
            <button
              onClick={() => router.back()}
              className="w-full flex-1 rounded-full bg-[#abff31] px-4 py-2.5 text-sm font-semibold text-primary-900 hover:bg-[#9ae62c]"
            >
              Go Back
            </button>
            <Link
              href="/"
              className="w-full flex-1 rounded-full bg-[#0a4abf] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#093e9f]"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

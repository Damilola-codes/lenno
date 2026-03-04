import Link from "next/link";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

type SavedUser = {
  uid: string;
  username: string;
};

type HomeNavProps = {
  savedUser: SavedUser | null;
  onGetStarted: () => void;
  onLogout: () => void;
  onDashboard: () => void;
};

export default function HomeNav({
  savedUser,
  onGetStarted,
  onLogout,
  onDashboard,
}: HomeNavProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 px-4 pt-4">
      <div className="max-w-6xl mx-auto rounded-2xl bg-primary-100 border border-primary-200 overflow-hidden">
        <div className="flex items-center justify-between min-h-[78px]">
          <Link
            href="/"
            className="h-[78px] px-4 sm:px-8 bg-[#abff31] flex items-center gap-2 sm:gap-3 shrink-0"
          >
            <span className="text-[#0a4abf] text-3xl sm:text-4xl font-black leading-none">
              L
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-primary-900 tracking-tight">
              Lenno
            </span>
          </Link>

          <div className="flex items-center pr-3 sm:pr-6 gap-2">
            <div className="hidden md:flex items-center gap-7 text-primary-800 text-sm font-medium mr-5">
              <Link
                href="/jobs"
                className="hover:text-primary-900 transition-colors"
              >
                Jobs
              </Link>
              <Link
                href="#"
                className="hover:text-primary-900 transition-colors"
              >
                Companies
              </Link>
              <Link
                href="#"
                className="hover:text-primary-900 transition-colors"
              >
                Advice
              </Link>
              <Link
                href="#"
                className="hover:text-primary-900 transition-colors"
              >
                Community
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-primary-300 bg-white text-primary-900"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </button>

            {savedUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onDashboard}
                  className="rounded-full px-4 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-br from-primary-800 to-primary-900 text-white text-sm font-semibold shadow-md hover:brightness-110 transition"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="hidden lg:inline-flex text-sm text-primary-700 hover:text-primary-900"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onGetStarted}
                className="rounded-full px-4 sm:px-10 py-2.5 sm:py-3 bg-black text-white text-sm font-medium"
              >
                Sign up
              </button>
            )}
          </div>
        </div>

        <div
          className={`${mobileNavOpen ? "block" : "hidden"} md:hidden border-t border-primary-200 bg-white px-4 py-3`}
        >
          <div className="flex flex-col gap-3 text-sm font-medium text-primary-800">
            <Link
              href="/jobs"
              className="hover:text-primary-900"
              onClick={() => setMobileNavOpen(false)}
            >
              Jobs
            </Link>
            <Link
              href="#"
              className="hover:text-primary-900"
              onClick={() => setMobileNavOpen(false)}
            >
              Companies
            </Link>
            <Link
              href="#"
              className="hover:text-primary-900"
              onClick={() => setMobileNavOpen(false)}
            >
              Advice
            </Link>
            <Link
              href="#"
              className="hover:text-primary-900"
              onClick={() => setMobileNavOpen(false)}
            >
              Community
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

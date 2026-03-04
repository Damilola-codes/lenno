import Link from "next/link";
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

type HomeFooterProps = {
  onGetStarted: () => void;
};

export default function HomeFooter({ onGetStarted }: HomeFooterProps) {
  return (
    <footer className="bg-primary-100 px-4 pt-10 pb-6">
      <div className="max-w-6xl mx-auto rounded-2xl border border-primary-200 bg-primary-100 px-6 sm:px-10 py-10 sm:py-12">
        <div className="rounded-2xl bg-[#0a4abf] border border-[#0841a8] px-6 sm:px-8 py-8 sm:py-10">
          <div className="text-center max-w-3xl mx-auto text-white">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              Let Lenno handle the busywork for your team.
            </h2>
            <p className="mt-4 text-blue-100 text-sm sm:text-base leading-relaxed">
              Post jobs faster, find trusted freelancers, and pay in Pi only
              when each step is approved.
            </p>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={onGetStarted}
                className="group relative overflow-hidden rounded-full bg-white text-black px-7 py-3 font-semibold shadow-md transition-all duration-300 hover:shadow-lg"
              >
                <span className="pointer-events-none absolute inset-0 bg-black/90 rotate-45 translate-x-[-140%] translate-y-[140%] transition-transform duration-500 ease-out group-hover:translate-x-[140%] group-hover:translate-y-[-140%]" />
                <span className="relative z-10">Start on Lenno</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#abff31] flex items-center justify-center">
                <span className="text-[#0a4abf] text-3xl font-black leading-none">
                  L
                </span>
              </div>
              <span className="text-2xl font-bold text-primary-900 tracking-tight">
                Lenno
              </span>
            </div>
            <p className="text-primary-600 text-sm leading-relaxed max-w-xs">
              Lenno is a simple job platform where clients hire with confidence
              and freelancers deliver great work.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href="#"
                className="p-2 rounded-full bg-white border border-primary-300 text-primary-800 hover:bg-primary-200 transition-colors"
                aria-label="Global"
              >
                <GlobeAltIcon className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-full bg-white border border-primary-300 text-primary-800 hover:bg-primary-200 transition-colors"
                aria-label="Email"
              >
                <EnvelopeIcon className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-full bg-white border border-primary-300 text-primary-800 hover:bg-primary-200 transition-colors"
                aria-label="Community"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-full bg-white border border-primary-300 text-primary-800 hover:bg-primary-200 transition-colors"
                aria-label="Phone"
              >
                <PhoneIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-primary-900 mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-primary-600">
              <li>
                <Link
                  href="/"
                  className="hover:text-primary-900 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-primary-900 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-primary-900 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-primary-900 transition-colors"
                >
                  Blog Details
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-primary-900 transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary-900 mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-primary-600">
              <li>
                <Link
                  href="#"
                  className="hover:text-primary-900 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-primary-900 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-primary-900 transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-primary-900 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary-900 mb-4">Newsletter</h3>
            <p className="text-sm text-primary-600 leading-relaxed mb-4">
              Get job tips, hiring ideas, and product updates from Lenno.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-full border border-primary-300 bg-white px-4 py-2.5 text-sm text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-[#0a4abf]"
              />
              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-full bg-black text-white border border-primary-300 px-5 py-2.5 font-medium  transition-all duration-300"
              >
                <span className="pointer-events-none absolute inset-0 bg-white/90 rotate-45 translate-x-[-140%] translate-y-[140%] transition-transform duration-800 ease-out group-hover:translate-x-[140%] group-hover:translate-y-[-140%]" />
                <span className="relative z-10">Stay in the Loop</span>
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-primary-600">
          <p>© 2026 Lenno. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/privacy"
              className="hover:text-primary-900 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary-900 transition-colors"
            >
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-primary-900 transition-colors">
              Security
            </Link>
            <Link href="#" className="hover:text-primary-900 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

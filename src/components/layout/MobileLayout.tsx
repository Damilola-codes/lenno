"use client";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  WalletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/library/utils";
import NotificationBell from "@/components/ui/NotificationBell";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { Auth } from "@/library/auth";

interface MobileLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Home", href: "/dashboard", icon: HomeIcon },
  { name: "Browse Jobs", href: "/jobs", icon: MagnifyingGlassIcon },
  { name: "My Proposals", href: "/proposals", icon: DocumentTextIcon },
  { name: "Wallet", href: "/wallet", icon: WalletIcon },
  { name: "Profile", href: "/profile", icon: UserCircleIcon },
  { name: "Privacy", href: "/privacy", icon: ShieldCheckIcon },
  { name: "Terms", href: "/terms", icon: DocumentCheckIcon },
];

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    void Auth.signOut("/auth/signin");
  };

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-primary-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-primary-600 hover:text-primary-900"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <Link href="/dashboard" className="text-xl font-bold text-black">
            Lenno
          </Link>

          <NotificationBell />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col relative transition-all duration-300",
          sidebarCollapsed ? "lg:w-20" : "lg:w-52",
        )}
      >
        <div className="flex flex-col flex-grow bg-[#f7f9fc] border-r border-primary-200">
          <div
            className={cn(
              "flex items-center flex-shrink-0 py-4",
              sidebarCollapsed ? "justify-center px-2" : "px-4",
            )}
          >
            <Link href="/dashboard" className="text-xl font-bold text-black">
              {sidebarCollapsed ? "L" : "Lenno"}
            </Link>
          </div>
          <nav className="flex-1 px-3 pb-4 space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center py-2.5 text-sm font-medium rounded-full transition-all duration-200",
                    sidebarCollapsed
                      ? "justify-center px-2"
                      : "justify-start px-3",
                    isActive
                      ? "bg-gradient-to-r from-[#0a4abf] to-[#2563eb] text-white shadow-sm"
                      : "text-[#6b7280] hover:text-[#1f6f42] hover:bg-[#ecf9ef]",
                  )}
                >
                  <item.icon
                    className={cn("w-4 h-4", !sidebarCollapsed && "mr-2.5")}
                  />
                  {!sidebarCollapsed && item.name}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center py-2.5 text-sm font-medium rounded-full transition-all duration-200 text-[#6b7280] hover:text-[#b6455f] hover:bg-[#fff4f6]",
                sidebarCollapsed ? "justify-center px-2" : "justify-start px-3",
              )}
            >
              <ArrowRightOnRectangleIcon
                className={cn("w-4 h-4", !sidebarCollapsed && "mr-2.5")}
              />
              {!sidebarCollapsed && "Logout"}
            </button>
          </nav>

          {/* Language Selector - Bottom of Sidebar */}
          {!sidebarCollapsed && (
            <div className="px-4 pb-4">
              <LanguageSelector />
            </div>
          )}
        </div>

        <button
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full border border-[#d6deec] bg-white text-slate-500 shadow-sm flex items-center justify-center hover:text-slate-700"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRightIcon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/25"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="relative flex w-full max-w-xs flex-col bg-[#f7f9fc]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200">
              <Link href="/" className="text-xl font-bold text-black">
                Lenno
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-primary-400 hover:text-primary-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2.5 text-sm font-medium rounded-full transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-[#0a4abf] to-[#2563eb] text-white shadow-sm"
                        : "text-[#6b7280] hover:text-[#1f6f42] hover:bg-[#ecf9ef]",
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2.5" />
                    {item.name}
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-full transition-all duration-200 text-[#6b7280] hover:text-[#b6455f] hover:bg-[#fff4f6]"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2.5" />
                Logout
              </button>

              {/* Language Selector in Mobile Menu */}
              <div className="px-0">
                <LanguageSelector />
              </div>
            </nav>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-52",
        )}
      >
        <div className="min-h-screen pb-20 lg:pb-0">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-primary-200">
        <div className="flex">
          {navigation.slice(0, 4).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center px-1 py-3 text-xs font-medium transition-colors duration-200",
                  isActive
                    ? "text-black"
                    : "text-primary-400 hover:text-primary-600",
                )}
              >
                <item.icon className="w-6 h-6 mb-1" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

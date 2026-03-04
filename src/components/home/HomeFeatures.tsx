"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function HomeFeatures() {
  const [featureTab, setFeatureTab] = useState<
    "clients" | "freelancers" | "teams"
  >("clients");

  return (
    <section className="px-4 py-16 bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl border border-[#0841a8] bg-[#0a4abf] text-white p-7 sm:p-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex px-3 py-1 rounded-full bg-[#abff31] text-[#0a4abf] text-xs font-semibold mb-4">
                AI-Powered Job Platform
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
                Explore how Lenno adapts to each side of the marketplace
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white/15 border border-white/20">
              <button
                type="button"
                onClick={() => setFeatureTab("clients")}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition ${
                  featureTab === "clients"
                    ? "bg-[#abff31] text-[#0a4abf]"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Clients
              </button>
              <button
                type="button"
                onClick={() => setFeatureTab("freelancers")}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition ${
                  featureTab === "freelancers"
                    ? "bg-[#abff31] text-[#0a4abf]"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Freelancers
              </button>
              <button
                type="button"
                onClick={() => setFeatureTab("teams")}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition ${
                  featureTab === "teams"
                    ? "bg-[#abff31] text-[#0a4abf]"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Teams
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {featureTab === "clients" ? (
              <motion.div
                key="feature-clients"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6"
              >
                <div className="rounded-2xl bg-white/12 border border-white/20 p-6">
                  <h3 className="text-2xl font-semibold">
                    For Clients: smarter hiring decisions
                  </h3>
                  <p className="text-primary-100 mt-3 leading-relaxed">
                    Lenno&apos;s AI-powered job platform ranks proposals by
                    relevance, highlights delivery risk, and recommends the
                    strongest applicants based on budget, timeline, and skills.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/20 p-6">
                  <p className="text-sm font-semibold text-[#abff31]">
                    What AI does for clients
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-primary-100">
                    <li>
                      • Summarizes every proposal into quick hiring insights
                    </li>
                    <li>• Flags unclear scope before contracts are accepted</li>
                    <li>
                      • Recommends milestone checkpoints for safer delivery
                    </li>
                  </ul>
                </div>
              </motion.div>
            ) : featureTab === "freelancers" ? (
              <motion.div
                key="feature-freelancers"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6"
              >
                <div className="rounded-2xl bg-white/12 border border-white/20 p-6">
                  <h3 className="text-2xl font-semibold">
                    For Freelancers: better applications, faster wins
                  </h3>
                  <p className="text-primary-100 mt-3 leading-relaxed">
                    Lenno helps freelancers craft stronger proposals with
                    AI-assisted pitch guidance, clearer scope mapping, and
                    milestone suggestions that improve acceptance rates.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/20 p-6">
                  <p className="text-sm font-semibold text-[#abff31]">
                    What AI does for freelancers
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-primary-100">
                    <li>• Suggests stronger proposal structure and clarity</li>
                    <li>• Aligns deliverables with client expectations</li>
                    <li>• Tracks progress and next actions in one timeline</li>
                  </ul>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="feature-teams"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6"
              >
                <div className="rounded-2xl bg-white/12 border border-white/20 p-6">
                  <h3 className="text-2xl font-semibold">
                    For Teams: aligned execution at scale
                  </h3>
                  <p className="text-primary-100 mt-3 leading-relaxed">
                    Manage distributed contributors with shared milestones,
                    automatic status summaries, and Pi-native payout flows.
                    Everyone sees the same delivery truth in real time.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/20 p-6">
                  <p className="text-sm font-semibold text-[#abff31]">
                    What AI does for teams
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-primary-100">
                    <li>• Generates status snapshots across all active jobs</li>
                    <li>• Detects blockers early and recommends next steps</li>
                    <li>
                      • Improves delivery confidence with measurable signals
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function HomeApplicationExperience() {
  const [applicationTab, setApplicationTab] = useState<"client" | "freelancer">(
    "client",
  );

  return (
    <section className="px-4 py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-5xl font-bold text-primary-900">
              How Job Applications Look on Lenno
            </h2>
            <p className="mt-3 text-primary-600 max-w-3xl mx-auto">
              A clear two-sided experience: clients get structured candidate
              comparisons, while freelancers see status, milestones, and next
              actions in real time.
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 p-1.5 rounded-full border border-primary-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setApplicationTab("client")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                  applicationTab === "client"
                    ? "bg-[#0a4abf] text-white"
                    : "text-primary-700 hover:bg-primary-100"
                }`}
              >
                Client View
              </button>
              <button
                type="button"
                onClick={() => setApplicationTab("freelancer")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                  applicationTab === "freelancer"
                    ? "bg-[#0a4abf] text-white"
                    : "text-primary-700 hover:bg-primary-100"
                }`}
              >
                Freelancer View
              </button>
            </div>
          </div>

          <div className="relative rounded-3xl border border-primary-200 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat p-4 sm:p-6 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
            <div className="pointer-events-none absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/35 blur-2xl" />
            <div className="relative">
              <AnimatePresence mode="wait">
                {applicationTab === "client" ? (
                  <motion.div
                    key="client-panel"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-3xl border border-primary-200 bg-white/70 backdrop-blur-md p-6 sm:p-7"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-xl font-bold text-primary-900">
                        Client View
                      </h3>
                      <span className="text-xs px-3 py-1 rounded-full bg-[#0a4abf] text-white">
                        14 Applications
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-white border border-primary-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-primary-200">
                              <Image
                                src="https://i.pravatar.cc/80?img=32"
                                alt="Amina profile"
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-primary-900">
                                Amina K. — Product Designer
                              </p>
                              <p className="text-sm text-primary-600">
                                4.9 rating • 32 jobs • 98% completion
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#0a4abf]">
                            $2,100
                          </span>
                        </div>
                        <p className="text-sm text-primary-600 mt-2">
                          Delivery in 7 days with 3 milestone checkpoints.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white border border-primary-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-primary-200">
                              <Image
                                src="https://i.pravatar.cc/80?img=12"
                                alt="Daniel profile"
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-primary-900">
                                Daniel M. — UI/UX Specialist
                              </p>
                              <p className="text-sm text-primary-600">
                                4.8 rating • 18 jobs • 96% completion
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#0a4abf]">
                            $1,850
                          </span>
                        </div>
                        <p className="text-sm text-primary-600 mt-2">
                          Includes rapid revisions and handoff documentation.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white border border-primary-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-primary-200">
                              <Image
                                src="https://i.pravatar.cc/80?img=45"
                                alt="Priya profile"
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-primary-900">
                                Priya S. — Frontend Developer
                              </p>
                              <p className="text-sm text-primary-600">
                                4.9 rating • 24 jobs • 97% completion
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#0a4abf]">
                            $1,920
                          </span>
                        </div>
                        <p className="text-sm text-primary-600 mt-2">
                          Strong React and TypeScript delivery with
                          production-ready code.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white border border-primary-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-primary-200">
                              <Image
                                src="https://i.pravatar.cc/80?img=61"
                                alt="Marco profile"
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-primary-900">
                                Marco T. — Product Strategist
                              </p>
                              <p className="text-sm text-primary-600">
                                4.7 rating • 19 jobs • 95% completion
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#0a4abf]">
                            $2,050
                          </span>
                        </div>
                        <p className="text-sm text-primary-600 mt-2">
                          Experienced in roadmap planning and cross-functional
                          execution.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="freelancer-panel"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-3xl border border-white/20 bg-[#0a4abf]/80 backdrop-blur-md p-6 sm:p-7 text-white"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-xl font-bold">Freelancer View</h3>
                      <span className="text-xs px-3 py-1 rounded-full bg-[#abff31] text-[#0a4abf] font-semibold">
                        Application Active
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                        <p className="font-semibold">Mobile Product Redesign</p>
                        <p className="text-sm text-blue-100 mt-1">
                          Status: Under Review • Budget: 1,900 Pi
                        </p>
                        <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
                          <span className="px-2.5 py-1.5 rounded-full bg-white/15 border border-white/20">
                            Submitted
                          </span>
                          <span className="px-2.5 py-1.5 rounded-full bg-white/15 border border-white/20">
                            Reviewed
                          </span>
                          <span className="px-2.5 py-1.5 rounded-full bg-[#abff31] text-[#0a4abf] font-semibold">
                            Next: Interview
                          </span>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-[#abff31] text-[#0a4abf] p-4">
                        <p className="text-sm font-semibold">
                          Estimated payout: 1,900 Pi after client approval.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

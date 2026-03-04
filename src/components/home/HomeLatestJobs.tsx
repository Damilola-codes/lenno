"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomeLatestJobs() {
  return (
    <section className="px-4 py-14 bg-primary-100">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-10"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-primary-900 tracking-tight">
            <span className="text-[#0a4abf]">Latest</span> Jobs Opportunity
          </h2>
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              className="w-12 h-12 rounded-full border border-primary-400 text-primary-800 flex items-center justify-center hover:bg-white transition"
              aria-label="Previous jobs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="w-12 h-12 rounded-full bg-primary-800 text-white flex items-center justify-center hover:bg-primary-900 transition"
              aria-label="Next jobs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[230px_1fr] gap-8 items-start">
          <div className="bg-primary-100 border-l-2 border-primary-300 pl-4 py-1">
            <ul className="space-y-4 text-primary-600 text-sm sm:text-base">
              <li className="flex items-center justify-between">
                <span>Product Management</span>
                <span className="text-xs px-2 py-0.5 rounded bg-secondary-200 text-secondary-800">
                  34
                </span>
              </li>
              <li className="flex items-center justify-between font-semibold text-[#0a4abf] relative">
                <span className="absolute -left-[18px] w-1 h-6 bg-[#0a4abf] rounded-full" />
                <span>Design</span>
                <span className="text-xs px-2 py-0.5 rounded bg-warning-200 text-warning-800">
                  92
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Development</span>
                <span className="text-xs px-2 py-0.5 rounded bg-secondary-300 text-secondary-900">
                  102
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Marketing</span>
                <span className="text-xs px-2 py-0.5 rounded bg-accent-200 text-accent-900">
                  67
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Customer Service</span>
                <span className="text-xs px-2 py-0.5 rounded bg-primary-800 text-white">
                  78
                </span>
              </li>
            </ul>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex gap-5 min-w-max">
              <article className="w-[290px] rounded-3xl bg-[#0a4abf] text-white p-6 shadow-lg">
                <h3 className="text-3xl font-semibold leading-tight">
                  Product Designer
                </h3>
                <div className="mt-4 flex gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-primary-900/40">
                    Full Time
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary-900/40">
                    Product
                  </span>
                </div>
                <p className="mt-7 text-3xl font-semibold text-[#abff31]">
                  $67-83K USD
                </p>
                <div className="mt-12 pt-4 border-t border-white/20 flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white text-[#f37021] font-bold flex items-center justify-center">
                      G
                    </div>
                    <div>
                      <p className="font-medium">GitLab</p>
                      <p className="text-xs text-primary-200">1001-5000</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#abff31] text-primary-900">
                    16 Jobs
                  </span>
                </div>
              </article>

              <article className="w-[290px] rounded-3xl bg-white text-primary-900 p-6 border border-primary-200">
                <h3 className="text-3xl font-semibold leading-tight">
                  Senior Product Designer
                </h3>
                <div className="mt-4 flex gap-2 text-xs text-primary-600">
                  <span className="px-3 py-1 rounded-full bg-primary-100">
                    Full Time
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary-100">
                    UIX Designer
                  </span>
                </div>
                <p className="mt-7 text-3xl font-semibold">$67-83K USD</p>
                <div className="mt-12 pt-4 border-t border-primary-200 flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7048e8] text-white font-bold flex items-center justify-center">
                      O
                    </div>
                    <div>
                      <p className="font-medium">OpenPhone</p>
                      <p className="text-xs text-primary-500">51-200</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-warning-100 text-warning-800">
                    16 Jobs
                  </span>
                </div>
              </article>

              <article className="w-[290px] rounded-3xl bg-white text-primary-900 p-6 border border-primary-200">
                <h3 className="text-3xl font-semibold leading-tight">
                  Creative Director
                </h3>
                <div className="mt-4 flex gap-2 text-xs text-primary-600">
                  <span className="px-3 py-1 rounded-full bg-primary-100">
                    Full Time
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary-100">
                    Head of Design
                  </span>
                </div>
                <p className="mt-7 text-3xl font-semibold">$88-120K USD</p>
                <div className="mt-12 pt-4 border-t border-primary-200 flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-900 text-white font-bold flex items-center justify-center">
                      GH
                    </div>
                    <div>
                      <p className="font-medium">GitHub</p>
                      <p className="text-xs text-primary-500">1001-5000</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-warning-100 text-warning-800">
                    16 Jobs
                  </span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

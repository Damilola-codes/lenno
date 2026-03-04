"use client";

import { motion } from "framer-motion";

export default function HomePromise() {
  return (
    <section className="px-4 py-16 bg-primary-100">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="rounded-3xl border border-primary-200 bg-white p-8 sm:p-10"
        >
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="px-3 py-1 rounded-full bg-[#0a4abf] text-white text-xs font-semibold">
              Built for Delivery
            </span>
            <span className="px-3 py-1 rounded-full bg-[#abff31] text-[#0a4abf] text-xs font-semibold">
              Pi Payments
            </span>
            <span className="px-3 py-1 rounded-full bg-primary-900 text-white text-xs font-semibold">
              99.9% Service Assurance
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold text-primary-900 leading-tight">
            One simple place for clients to hire and freelancers to deliver.
          </h2>
          <p className="mt-4 text-primary-600 text-base sm:text-lg max-w-4xl leading-relaxed">
            Clients post jobs, review applications, and release Pi after each
            step is approved. Freelancers apply, deliver clearly defined work,
            and get paid in Pi on time. Lenno keeps both sides aligned with
            clear updates, transparent reviews, and step-by-step approvals.
          </p>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4">
              <p className="text-sm font-semibold text-primary-900">
                Step-by-step Payments
              </p>
              <p className="text-sm text-primary-600 mt-1">
                Protect clients and freelancers with clear, approval-based
                payout checkpoints.
              </p>
            </div>
            <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4">
              <p className="text-sm font-semibold text-primary-900">
                Verified Talent
              </p>
              <p className="text-sm text-primary-600 mt-1">
                Connect clients with identity-checked freelancers and trusted
                delivery records.
              </p>
            </div>
            <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4">
              <p className="text-sm font-semibold text-primary-900">
                Pi-Native Payment
              </p>
              <p className="text-sm text-primary-600 mt-1">
                Send and receive Pi with clear payment tracking.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

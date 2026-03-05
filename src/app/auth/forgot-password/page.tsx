"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-primary-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-primary-900">
          Forgot password
        </h1>
        <p className="mt-2 text-sm text-primary-700">
          Enter the email linked to your account and we&apos;ll send a reset
          link.
        </p>

        {submitted ? (
          <div className="mt-5 rounded-xl border border-[#b7dfc4] bg-[#f3fcf6] px-4 py-3 text-sm text-[#2d8a53]">
            If this email exists, a reset link has been sent.
          </div>
        ) : (
          <form
            className="mt-5 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <label className="block">
              <span className="mb-1 block text-xs text-primary-600">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-primary-200 px-3 py-2.5 text-sm text-primary-900 placeholder:text-primary-400 outline-none focus:ring-2 focus:ring-[#0a4abf]"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#0a4abf] py-2.5 text-sm font-medium text-white hover:brightness-110"
            >
              Send reset link
            </button>
          </form>
        )}

        <div className="mt-4 text-sm">
          <Link href="/auth/signin" className="text-[#0a4abf] hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

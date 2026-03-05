"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const invalidToken = !token;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (invalidToken) {
      setError("Invalid reset link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        setError(data.error || "Unable to reset password right now.");
        return;
      }

      setMessage(data.message || "Password updated successfully.");
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Unable to reset password right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-primary-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-primary-900">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-primary-700">
          Choose a new password for your account.
        </p>

        {success ? (
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-[#b7dfc4] bg-[#f3fcf6] px-4 py-3 text-sm text-[#2d8a53]">
              {message}
            </div>
            <Link
              href="/auth/signin"
              className="inline-flex rounded-lg bg-[#0a4abf] px-4 py-2 text-sm font-medium text-white"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1 block text-xs text-primary-600">
                New password
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-primary-200 px-3 py-2.5 text-sm text-primary-900 placeholder:text-primary-400 outline-none focus:ring-2 focus:ring-[#0a4abf]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs text-primary-600">
                Confirm password
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat new password"
                className="w-full rounded-lg border border-primary-200 px-3 py-2.5 text-sm text-primary-900 placeholder:text-primary-400 outline-none focus:ring-2 focus:ring-[#0a4abf]"
              />
            </label>

            <button
              type="submit"
              disabled={loading || invalidToken}
              className="w-full rounded-lg bg-[#0a4abf] py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>

            {invalidToken ? (
              <p className="text-xs text-red-500">
                Invalid or missing token in reset link.
              </p>
            ) : null}
            {error ? <p className="text-xs text-red-500">{error}</p> : null}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white px-4 py-10">
          <div className="mx-auto max-w-md rounded-2xl border border-primary-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-primary-900">
              Reset password
            </h1>
            <p className="mt-2 text-sm text-primary-700">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

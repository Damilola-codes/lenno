"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { Auth } from "@/library/auth";
import { normalizeApiError } from "@/library/utils";
import AuthVisualCarousel from "@/components/auth/AuthVisualCarousel";
import AuthErrorToast from "@/components/ui/AuthErrorToast";
import AuthSuccessModal from "@/components/ui/AuthSuccessModal";

export default function SigninPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | "">("");
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(timeout);
  }, [error]);

  const handleSignIn = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError("Enter your email or phone number and password.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(normalizeApiError(data.error) || "Sign in failed");
        return;
      }

      Auth.setSession({
        id: data.id,
        username: data.username,
        email: data.email,
        userType: data.userType,
        isVerified: data.isVerified ?? false,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
      });

      setSuccessOpen(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setError("");
    setOauthLoading(provider);

    try {
      await signIn(provider, {
        callbackUrl: "/auth/oauth-complete",
        redirect: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth sign-in failed");
      setOauthLoading("");
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-primary-50 to-white p-2 sm:p-3 lg:h-screen lg:overflow-hidden">
      <AuthErrorToast message={error} onClose={() => setError("")} />
      <AuthSuccessModal
        open={successOpen}
        title="Signed in successfully"
        message="Taking you to your dashboard..."
      />

      <div className="max-w-6xl min-h-[calc(100vh-1rem)] lg:h-full mx-auto grid lg:grid-cols-2 gap-3 items-stretch border border-gray-300 rounded-2xl p-2 bg-white/70">
        <AuthVisualCarousel />

        <div className="rounded-2xl bg-white p-4 sm:p-6 flex flex-col justify-center overflow-y-auto">
          <div className="max-w-[420px] w-full mx-auto">
            <h1 className="text-3xl sm:text-4xl font-semibold mb-5 sm:mb-6">
              Welcome back!
            </h1>

            <div className="space-y-2.5">
              <label className="block">
                <span className="mb-1 block text-xs text-gray-600">
                  Email or phone number
                </span>
                <input
                  type="text"
                  placeholder="Email or phone number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#0a4abf]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-gray-600">
                  Password
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#0a4abf]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </label>

              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#0a4abf] font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="w-full rounded-lg bg-[#0a4abf] text-white py-2.5 text-sm font-medium hover:brightness-110 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="pt-2 pb-1 flex items-center gap-3 text-sm text-gray-400">
                <div className="h-px flex-1 bg-gray-200" />
                <span>or</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <p className="text-sm text-center text-gray-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-[#0a4abf] font-medium"
                >
                  Create one
                </Link>
              </p>

              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={oauthLoading !== ""}
                className="w-full rounded-lg border border-primary-200 py-2.5 text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-primary-50"
              >
                <Image
                  src="/google.png"
                  alt="Google"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
                {oauthLoading === "google"
                  ? "Connecting..."
                  : "Continue with Google"}
              </button>
              <button
                type="button"
                onClick={() => handleOAuth("apple")}
                disabled={oauthLoading !== ""}
                className="w-full rounded-lg border border-primary-200 py-2.5 text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-primary-50"
              >
                <Image
                  src="/apple.png"
                  alt="Apple"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
                {oauthLoading === "apple"
                  ? "Connecting..."
                  : "Continue with Apple"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

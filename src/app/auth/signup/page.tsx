"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Auth } from "@/library/auth";
import { normalizeApiError } from "@/library/utils";

export default function SignupPage() {
  const router = useRouter();
  const [countryCode, setCountryCode] = useState("+62");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const emailPrefix =
        email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") || "user";
      const generatedUsername = `${emailPrefix}${Date.now().toString().slice(-5)}`;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          username: generatedUsername,
          firstName: "Lenno",
          lastName: "User",
          userType: "FREELANCER",
          phoneNumber: `${countryCode}${phoneNumber}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(normalizeApiError(data.error) || "Registration failed");
        return;
      }

      // Store session locally for client
      Auth.setSession({
        id: data.id,
        username: data.username,
        email: data.email,
        userType: data.userType,
        isVerified: false,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-5 items-stretch">
        <div className="relative rounded-2xl overflow-hidden min-h-[520px] lg:min-h-[700px]">
          <Image
            src="/heroman.png"
            alt="Auth visual"
            fill
            priority
            quality={100}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute top-4 left-4 w-9 h-9 rounded-md bg-white text-black flex items-center justify-center text-xl font-semibold">
            “
          </div>
          <div className="absolute bottom-7 left-6 right-6 text-white">
            <p className="text-2xl font-semibold leading-tight">
              The 66chat&apos;s flexibility is truly remarkable. It effortlessly
              adapts to a wide range of research methodologies and study
              designs.
            </p>
            <p className="mt-4 text-lg font-medium">
              Pablo Escanor - UX Researcher
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-[420px] w-full mx-auto">
            <h1 className="text-4xl font-bold text-black mb-8">
              Welcome back!
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 px-3 py-3">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-700 outline-none"
                >
                  <option value="+62">Indonesia (+62)</option>
                  <option value="+1">United States (+1)</option>
                  <option value="+44">United Kingdom (+44)</option>
                  <option value="+234">Nigeria (+234)</option>
                </select>
              </div>

              <input
                type="tel"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 pr-10 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black"
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

              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="w-full rounded-lg bg-black text-white py-3 text-sm font-medium disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating
                    account...
                  </span>
                ) : (
                  "Create account"
                )}
              </button>

              <div className="pt-4 pb-2 flex items-center gap-3 text-sm text-gray-400">
                <div className="h-px flex-1 bg-gray-200" />
                <span>or</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <p className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-[#b14cff]">
                  Sign in
                </Link>
              </p>

              <button
                type="button"
                className="w-full rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
              >
                <span className="text-[#DB4437]">G</span>
                Continue with Google
              </button>
              <button
                type="button"
                className="w-full rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
              >
                <span className="text-black"></span>
                Continue with Apple
              </button>
              <button
                type="button"
                className="w-full rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
              >
                <span className="text-[#1DA1F2]">𝕏</span>
                Continue with Twitter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

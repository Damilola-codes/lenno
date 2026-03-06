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

export default function SignupPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid" | "error"
  >("idle");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [userType, setUserType] = useState<"CLIENT" | "FREELANCER">(
    "FREELANCER",
  );
  const [step, setStep] = useState<1 | 2>(1);
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

  useEffect(() => {
    if (step !== 2) return;

    const normalized = username.trim().toLowerCase();
    if (!normalized) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
      setUsernameStatus("invalid");
      setUsernameMessage(
        "Use 3-20 characters: lowercase letters, numbers, and underscores only.",
      );
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setUsernameStatus("checking");
        setUsernameMessage("Checking username...");

        const response = await fetch(
          `/api/auth/check-user?username=${encodeURIComponent(normalized)}`,
          { cache: "no-store" },
        );

        const data = (await response.json()) as {
          available?: boolean;
          reason?: string;
        };

        if (cancelled) return;

        if (!response.ok) {
          if (response.status === 400) {
            setUsernameStatus("invalid");
            setUsernameMessage(
              data.reason ||
                "Use 3-20 characters: lowercase letters, numbers, and underscores only.",
            );
            return;
          }

          setUsernameStatus("error");
          setUsernameMessage("Unable to check username right now.");
          return;
        }

        if (data.available) {
          setUsernameStatus("available");
          setUsernameMessage("Username is available.");
          return;
        }

        setUsernameStatus("taken");
        setUsernameMessage(data.reason || "Username is already taken.");
      } catch {
        if (cancelled) return;
        setUsernameStatus("error");
        setUsernameMessage("Unable to check username right now.");
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [step, username]);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      setError(
        "Username must be 3-20 characters and use only lowercase letters, numbers, and underscores.",
      );
      return;
    }

    if (usernameStatus === "checking") {
      setError("Please wait while we check username availability.");
      return;
    }

    if (usernameStatus === "taken") {
      setError("That username is already taken. Choose another one.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const trimmedIdentifier = identifier.trim();
      const isEmail = trimmedIdentifier.includes("@");
      const normalizedDigits = trimmedIdentifier.replace(/\D/g, "");
      const fullPhone = normalizedDigits;
      const emailPrefix =
        (isEmail
          ? trimmedIdentifier.split("@")[0]
          : `phone_${fullPhone}`
        ).replace(/[^a-zA-Z0-9_]/g, "") || "user";
      const fallbackUsername = isEmail
        ? `${emailPrefix}${Date.now().toString().slice(-5)}`
        : `ph_${fullPhone}`;
      const emailForRegister = isEmail
        ? trimmedIdentifier
        : `${emailPrefix}${Date.now().toString().slice(-4)}@lenno.local`;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForRegister,
          password,
          username: normalizedUsername || fallbackUsername,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          userType,
          phoneNumber: normalizedDigits,
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

      setSuccessOpen(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    const trimmedIdentifier = identifier.trim();
    const isEmail = trimmedIdentifier.includes("@");
    const hasPhoneDigits = trimmedIdentifier.replace(/\D/g, "").length > 0;

    if (!trimmedIdentifier || !password.trim()) {
      setError("Enter your email or phone number and password to continue.");
      return;
    }

    if (!isEmail && !hasPhoneDigits) {
      setError("Enter a valid email or phone number.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setStep(2);
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
        title="Account created successfully"
        message="Welcome to Lenno. Redirecting to your dashboard..."
      />

      <div className="max-w-6xl min-h-[calc(100vh-1rem)] lg:h-full mx-auto grid lg:grid-cols-2 gap-3 items-stretch border border-gray-300 rounded-2xl p-2 bg-white/70">
        <AuthVisualCarousel />

        <div className="rounded-2xl bg-white p-4 sm:p-6 flex flex-col justify-center overflow-y-auto">
          <div className="max-w-[420px] w-full mx-auto py-1">
            <h1 className="text-3xl sm:text-4xl font-semibold mb-5 sm:mb-6">
              Join <span className="text-[#0abf0d]">Lenno</span> and start
              building your future.
            </h1>

            <p className="text-xs text-green-400 font-medium mb-3">
              {step === 1
                ? "Step 1 of 2: Login details"
                : "Step 2 of 2: Profile details"}
            </p>

            <div className="space-y-2.5">
              {step === 1 ? (
                <>
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

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full rounded-lg bg-[#0a4abf] text-white py-2.5 text-sm font-medium hover:brightness-110"
                  >
                    Next
                  </button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="mb-1 block text-xs text-gray-600">
                        First name <span className="text-red-500">*</span>
                      </span>
                      <input
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#0a4abf]"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-gray-600">
                        Last name <span className="text-red-500">*</span>
                      </span>
                      <input
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#0a4abf]"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-xs text-gray-600">
                      Username <span className="text-red-500">*</span> (min 3)
                    </span>
                    <input
                      type="text"
                      placeholder="username"
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, "")
                            .slice(0, 20),
                        )
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#0a4abf]"
                    />
                    {usernameMessage ? (
                      <p
                        className={`mt-1 text-xs ${
                          usernameStatus === "available"
                            ? "text-green-600"
                            : usernameStatus === "taken" ||
                                usernameStatus === "invalid" ||
                                usernameStatus === "error"
                              ? "text-red-500"
                              : "text-gray-500"
                        }`}
                      >
                        {usernameMessage}
                      </p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs text-gray-600">
                      Role <span className="text-red-500">*</span>
                    </span>
                    <div className="rounded-lg border border-gray-200 px-3 py-2.5">
                      <select
                        value={userType}
                        onChange={(e) =>
                          setUserType(e.target.value as "CLIENT" | "FREELANCER")
                        }
                        className="w-full bg-transparent text-sm text-gray-700 outline-none"
                      >
                        <option value="FREELANCER">Freelancer</option>
                        <option value="CLIENT">Client</option>
                      </select>
                    </div>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full rounded-lg border border-gray-300 text-gray-700 py-2.5 text-sm font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={
                        loading ||
                        usernameStatus === "checking" ||
                        usernameStatus === "taken" ||
                        usernameStatus === "invalid"
                      }
                      className="w-full rounded-lg bg-[#0a4abf] text-white py-2.5 text-sm font-medium hover:brightness-110 disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </span>
                      ) : (
                        "Create account"
                      )}
                    </button>
                  </div>
                </>
              )}

              <div className="pt-2 pb-1 flex items-center gap-3 text-sm text-gray-400">
                <div className="h-px flex-1 bg-gray-200" />
                <span>or</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <p className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="text-[#0a4abf] font-medium"
                >
                  Sign in
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

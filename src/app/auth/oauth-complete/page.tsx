"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuthSuccessModal from "@/components/ui/AuthSuccessModal";
import AuthErrorToast from "@/components/ui/AuthErrorToast";
import { Auth } from "@/library/auth";

type OauthUser = {
  id: string;
  username: string;
  email: string;
  userType: "CLIENT" | "FREELANCER" | "USER";
  isVerified: boolean;
  firstName: string;
  lastName: string;
};

export default function OauthCompletePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingUser, setPendingUser] = useState<OauthUser | null>(null);
  const [savingRole, setSavingRole] = useState(false);

  const finishLogin = useCallback(
    (user: OauthUser) => {
      Auth.setSession({
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType as "CLIENT" | "FREELANCER",
        isVerified: user.isVerified,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      setSuccessOpen(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    },
    [router],
  );

  const handleRoleSelect = async (userType: "CLIENT" | "FREELANCER") => {
    setSavingRole(true);
    setError("");

    try {
      const res = await fetch("/api/auth/oauth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save role.");
        return;
      }

      setPendingUser(null);
      finishLogin(data.user as OauthUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save role.");
    } finally {
      setSavingRole(false);
    }
  };

  useEffect(() => {
    const completeOauth = async () => {
      try {
        const res = await fetch("/api/auth/oauth/session", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "OAuth login failed.");
          return;
        }

        const oauthUser = data.user as OauthUser;
        if (data.requiresRoleSelection || oauthUser.userType === "USER") {
          setPendingUser(oauthUser);
          return;
        }

        finishLogin(oauthUser);
      } catch (err) {
        setError(err instanceof Error ? err.message : "OAuth login failed.");
      } finally {
        setLoading(false);
      }
    };

    completeOauth();
  }, [finishLogin]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-primary-50 to-white p-4">
      <AuthErrorToast message={error} onClose={() => setError("")} />
      <AuthSuccessModal
        open={successOpen}
        title="OAuth sign-in successful"
        message="Taking you to your dashboard..."
      />

      {pendingUser ? (
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-xl">
          <h2 className="text-xl font-semibold text-[#0a4abf]">
            Choose your role
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Select how you want to use Lenno with this Google account.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleSelect("FREELANCER")}
              disabled={savingRole}
              className="rounded-lg bg-[#0a4abf] text-white py-2.5 text-sm font-medium disabled:opacity-60"
            >
              Freelancer
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect("CLIENT")}
              disabled={savingRole}
              className="rounded-lg border border-gray-300 text-gray-700 py-2.5 text-sm font-medium disabled:opacity-60"
            >
              Client
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-700 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {loading ? "Completing sign-in..." : "Redirecting..."}
        </div>
      )}
    </div>
  );
}

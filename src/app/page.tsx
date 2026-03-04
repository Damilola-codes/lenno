"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HomeNav from "@/components/home/HomeNav";
import HomeHero from "@/components/home/HomeHero";
import HomeFooter from "@/components/home/HomeFooter";
import HomeLatestJobs from "@/components/home/HomeLatestJobs";
import HomeFeatures from "@/components/home/HomeFeatures";
import HomePromise from "@/components/home/HomePromise";
import HomeFaq from "@/components/home/HomeFaq";
import HomeApplicationExperience from "@/components/home/HomeApplicationExperience";
import HomeCta from "@/components/home/HomeCta";
// SDK and debug removed — homepage is now generic

export default function HomePage() {
  const router = useRouter();
  const [savedUser, setSavedUser] = useState<{
    uid: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    // Check for existing authenticated user in localStorage
    const item = localStorage.getItem("auth-user");
    if (item) {
      try {
        setSavedUser(JSON.parse(item));
      } catch (err) {
        console.error("Error parsing saved auth user:", err);
        localStorage.removeItem("auth-user");
      }
    }
  }, []);

  const handleGetStarted = () => {
    if (savedUser) {
      router.push("/dashboard");
    } else {
      router.push("/auth/signup");
    }
  };
  const handleBrowseJobs = () => {
    router.push("/jobs");
  };

  const handleLogout = () => {
    localStorage.removeItem("auth-user");
    setSavedUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Debug Info removed */}

      <HomeNav
        savedUser={savedUser}
        onGetStarted={handleGetStarted}
        onLogout={handleLogout}
        onDashboard={() => router.push("/dashboard")}
      />

      <HomeHero onBrowseJobs={handleBrowseJobs} />

      <HomeLatestJobs />

      <HomeFeatures />

      <HomePromise />

      <HomeApplicationExperience />

      <HomeCta
        onGetStarted={handleGetStarted}
        onBrowseJobs={handleBrowseJobs}
      />

      <HomeFaq />

      <HomeFooter onGetStarted={handleGetStarted} />
    </div>
  );
}

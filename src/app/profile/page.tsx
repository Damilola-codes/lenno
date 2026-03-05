"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  BriefcaseIcon,
  MapPinIcon,
  PencilSquareIcon,
  ShareIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import MobileLayout from "@/components/layout/MobileLayout";
import { Auth } from "@/library/auth";
import ServiceSelector from "@/components/profile/ServiceSelector";
import ProfileSectionEditor from "@/components/profile/ProfileSectionEditor";

type ProfileUserType = "CLIENT" | "FREELANCER" | "USER";
type AvailabilityPref =
  | "Open to fixed contracts"
  | "Open to hourly contracts"
  | "Open to hourly and fixed contracts";
type PricingPref = "Project-based" | "Hourly-based" | "Both";

interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

interface ProjectEntry {
  title: string;
  role: string;
  category: string;
  status: string;
  link: string;
}

interface TestimonialEntry {
  clientName: string;
  company: string;
  rating: number;
  feedback: string;
}

interface ApiSkill {
  id: string;
  name: string;
}

interface ApiProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  userType: ProfileUserType;
  createdAt: string;
  averageRating?: number | null;
  totalReviews?: number;
  _count?: {
    contracts?: number;
    proposals?: number;
  };
  profile?: {
    title?: string | null;
    description?: string | null;
    hourlyRate?: number | null;
    avatar?: string | null;
    location?: string | null;
    skills?: ApiSkill[];
  } | null;
}

interface ProfileViewModel {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  title: string;
  description: string;
  avatar: string;
  location?: string;
  skills: string[];
  hourlyRate?: number;
  averageRating: number;
  totalReviews: number;
  completedJobs: number;
  amountMade: number;
  availability: AvailabilityPref;
  preferredPricing: PricingPref;
  education: EducationEntry[];
  projects: ProjectEntry[];
  testimonials: TestimonialEntry[];
  connects: number;
  profileCompletion: number;
  createdAt: string;
}

interface EditForm {
  firstName: string;
  lastName: string;
  title: string;
  location: string;
  hourlyRate: string;
  description: string;
  services: string[];
  avatar: string;
  availability: AvailabilityPref;
  preferredPricing: PricingPref;
  education: EducationEntry[];
  projects: ProjectEntry[];
  testimonials: TestimonialEntry[];
}

interface LocalProfileEdits {
  firstName?: string;
  lastName?: string;
  title?: string;
  location?: string;
  hourlyRate?: number;
  description?: string;
  skills?: string[];
  avatar?: string;
  availability?: AvailabilityPref;
  preferredPricing?: PricingPref;
  education?: EducationEntry[];
  projects?: ProjectEntry[];
  testimonials?: TestimonialEntry[];
}

type SectionEditKey =
  | "services"
  | "workPreferences"
  | "education"
  | "projects"
  | "testimonials";

function valueAsString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function sanitizeEducationEntries(entries: unknown): EducationEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const raw = entry as Record<string, unknown>;
      return {
        institution: valueAsString(raw.institution),
        degree: valueAsString(raw.degree),
        field: valueAsString(raw.field),
        year: valueAsString(raw.year),
      };
    })
    .filter((entry): entry is EducationEntry => Boolean(entry))
    .slice(0, 10);
}

function sanitizeProjectEntries(entries: unknown): ProjectEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (typeof entry === "string") {
        return {
          title: entry.trim(),
          role: "",
          category: "",
          status: "",
          link: "",
        };
      }

      if (!entry || typeof entry !== "object") return null;
      const raw = entry as Record<string, unknown>;
      return {
        title: valueAsString(raw.title),
        role: valueAsString(raw.role),
        category: valueAsString(raw.category),
        status: valueAsString(raw.status),
        link: valueAsString(raw.link),
      };
    })
    .filter((entry): entry is ProjectEntry => Boolean(entry))
    .slice(0, 10);
}

function sanitizeTestimonialEntries(entries: unknown): TestimonialEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const raw = entry as Record<string, unknown>;
      const parsedRating = Number(raw.rating);
      return {
        clientName: valueAsString(raw.clientName),
        company: valueAsString(raw.company),
        rating:
          Number.isFinite(parsedRating) && parsedRating > 0
            ? Math.max(1, Math.min(5, parsedRating))
            : 5,
        feedback: valueAsString(raw.feedback),
      };
    })
    .filter((entry): entry is TestimonialEntry => Boolean(entry))
    .slice(0, 10);
}

const DEFAULT_AVATARS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=LennoAlpha",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=LennoBeta",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=LennoGamma",
];

const EMPTY_EDUCATION: EducationEntry = {
  institution: "",
  degree: "",
  field: "",
  year: "",
};

const EMPTY_PROJECT: ProjectEntry = {
  title: "",
  role: "",
  category: "",
  status: "",
  link: "",
};

const EMPTY_TESTIMONIAL: TestimonialEntry = {
  clientName: "",
  company: "",
  rating: 5,
  feedback: "",
};

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatCompactAmount(value: number) {
  const normalized = Math.max(0, value);
  if (normalized >= 1_000_000) return `${Math.floor(normalized / 1_000_000)}M`;
  if (normalized >= 1_000) return `${Math.floor(normalized / 1_000)}K`;
  return normalized.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatCompactCurrency(value: number) {
  return `$${formatCompactAmount(value)}`;
}

function pickDefaultAvatar(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1)
    hash += seed.charCodeAt(index);
  return DEFAULT_AVATARS[Math.abs(hash) % DEFAULT_AVATARS.length];
}

function localProfileKey(userId: string) {
  return `profile_local_edits_${userId}`;
}

function connectsKey(userId: string) {
  return `lenno_connects_${userId}`;
}

function completionBonusKey(userId: string) {
  return `profile_completion_bonus_${userId}`;
}

function readLocalEdits(userId: string): LocalProfileEdits {
  try {
    const raw = window.localStorage.getItem(localProfileKey(userId));
    if (!raw) return {};
    return JSON.parse(raw) as LocalProfileEdits;
  } catch {
    return {};
  }
}

function writeLocalEdits(userId: string, edits: LocalProfileEdits) {
  try {
    window.localStorage.setItem(localProfileKey(userId), JSON.stringify(edits));
  } catch {
    return;
  }
}

function deriveAvailability(hourlyRate?: number): AvailabilityPref {
  return hourlyRate && hourlyRate > 0
    ? "Open to hourly and fixed contracts"
    : "Open to fixed contracts";
}

function derivePricing(hourlyRate?: number): PricingPref {
  return hourlyRate && hourlyRate > 0 ? "Both" : "Project-based";
}

function cycleAvailability(current: AvailabilityPref): AvailabilityPref {
  if (current === "Open to fixed contracts") {
    return "Open to hourly contracts";
  }
  if (current === "Open to hourly contracts") {
    return "Open to hourly and fixed contracts";
  }
  return "Open to fixed contracts";
}

function pricingFromAvailability(availability: AvailabilityPref): PricingPref {
  if (availability === "Open to fixed contracts") return "Project-based";
  if (availability === "Open to hourly contracts") return "Hourly-based";
  return "Both";
}

function calculateProfileCompletion(model: ProfileViewModel): number {
  const checks = [
    model.firstName.trim().length > 0,
    model.lastName.trim().length > 0,
    model.title.trim().length > 0,
    model.description.trim().length >= 40,
    Boolean(model.location?.trim()),
    Boolean(model.hourlyRate && model.hourlyRate > 0),
    model.skills.length >= 3,
    model.education.length >= 1,
    model.projects.length >= 1,
    model.testimonials.length >= 1,
    Boolean(model.avatar),
    Boolean(model.availability) && Boolean(model.preferredPricing),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function toProfileViewModel(
  data: Partial<ApiProfile>,
  amountMade: number,
): ProfileViewModel {
  const firstName = (data.firstName || "").trim() || "Freelancer";
  const lastName = (data.lastName || "").trim() || "User";
  const fullName = `${firstName} ${lastName}`.trim();
  const skills = (data.profile?.skills || [])
    .map((item) => item.name)
    .filter(Boolean);
  const hourlyRate = data.profile?.hourlyRate ?? undefined;
  const totalReviews = Number(data.totalReviews || 0);
  const rawRating = Number(data.averageRating || 0);
  const normalizedRating =
    Number.isFinite(rawRating) && rawRating > 0
      ? Math.max(1, Math.min(5, rawRating))
      : 0;

  const model: ProfileViewModel = {
    id: data.id || "local",
    firstName,
    lastName,
    fullName,
    username: data.username || "member",
    title: data.profile?.title?.trim() || "",
    description: data.profile?.description?.trim() || "",
    avatar:
      data.profile?.avatar || pickDefaultAvatar(data.username || fullName),
    location: data.profile?.location || undefined,
    skills: skills.slice(0, 10),
    hourlyRate,
    averageRating: totalReviews > 0 ? Number(normalizedRating.toFixed(1)) : 0,
    totalReviews,
    completedJobs: data._count?.contracts || 0,
    amountMade,
    availability: deriveAvailability(hourlyRate),
    preferredPricing: derivePricing(hourlyRate),
    education: [],
    projects: [],
    testimonials: [],
    connects: 0,
    profileCompletion: 0,
    createdAt: data.createdAt || new Date().toISOString(),
  };

  model.profileCompletion = calculateProfileCompletion(model);
  return model;
}

function applyLocalEdits(
  base: ProfileViewModel,
  edits: LocalProfileEdits,
): ProfileViewModel {
  const firstName = edits.firstName ?? base.firstName;
  const lastName = edits.lastName ?? base.lastName;
  const merged: ProfileViewModel = {
    ...base,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    title: edits.title ?? base.title,
    description: edits.description ?? base.description,
    location: edits.location ?? base.location,
    hourlyRate: edits.hourlyRate ?? base.hourlyRate,
    avatar: edits.avatar ?? base.avatar,
    skills:
      edits.skills && edits.skills.length
        ? edits.skills.slice(0, 10)
        : base.skills,
    availability: edits.availability ?? base.availability,
    preferredPricing: edits.preferredPricing ?? base.preferredPricing,
    education: edits.education
      ? sanitizeEducationEntries(edits.education)
      : sanitizeEducationEntries(base.education),
    projects: edits.projects
      ? sanitizeProjectEntries(edits.projects)
      : sanitizeProjectEntries(base.projects),
    testimonials: edits.testimonials
      ? sanitizeTestimonialEntries(edits.testimonials)
      : sanitizeTestimonialEntries(base.testimonials),
  };
  return { ...merged, profileCompletion: calculateProfileCompletion(merged) };
}

function readConnects(userId: string): number {
  try {
    const rawWalletStats = window.localStorage.getItem(
      `wallet_stats_${userId}`,
    );
    if (rawWalletStats) {
      const parsed = JSON.parse(rawWalletStats) as { neoPoints?: number };
      const fromWallet = Number(parsed.neoPoints || 0);
      if (fromWallet > 0) return fromWallet;
    }

    const raw = window.localStorage.getItem(connectsKey(userId));
    if (!raw) return 0;
    return Number(raw || 0);
  } catch {
    return 0;
  }
}

function persistConnects(userId: string, value: number) {
  const normalized = Math.max(0, Math.floor(value));
  try {
    window.localStorage.setItem(connectsKey(userId), String(normalized));
  } catch {
    return;
  }

  try {
    const rawWalletStats = window.localStorage.getItem(
      `wallet_stats_${userId}`,
    );
    if (rawWalletStats) {
      const parsed = JSON.parse(rawWalletStats) as Record<string, unknown>;
      parsed.neoPoints = normalized;
      window.localStorage.setItem(
        `wallet_stats_${userId}`,
        JSON.stringify(parsed),
      );
      return;
    }

    window.localStorage.setItem(
      `wallet_stats_${userId}`,
      JSON.stringify({
        neoPoints: normalized,
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
      }),
    );
  } catch {
    return;
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeSectionEdit, setActiveSectionEdit] =
    useState<SectionEditKey | null>(null);
  const [form, setForm] = useState<EditForm>({
    firstName: "",
    lastName: "",
    title: "",
    location: "",
    hourlyRate: "",
    description: "",
    services: [],
    avatar: DEFAULT_AVATARS[0],
    availability: "Open to fixed contracts",
    preferredPricing: "Project-based",
    education: [],
    projects: [],
    testimonials: [],
  });

  const setFormFromProfile = (model: ProfileViewModel) => {
    setForm({
      firstName: model.firstName,
      lastName: model.lastName,
      title: model.title,
      location: model.location || "",
      hourlyRate: model.hourlyRate ? String(model.hourlyRate) : "",
      description: model.description,
      services: model.skills,
      avatar: model.avatar,
      availability: model.availability,
      preferredPricing: model.preferredPricing,
      education: sanitizeEducationEntries(model.education),
      projects: sanitizeProjectEntries(model.projects),
      testimonials: sanitizeTestimonialEntries(model.testimonials),
    });
  };

  const loadProfile = useCallback(async () => {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
      window.location.href = "/auth/signup";
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [profileResponse, statsResponse] = await Promise.all([
        fetch("/api/profile", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/dashboard/stats?range=year&userId=${currentUser.id}`, {
          method: "GET",
          cache: "no-store",
        }),
      ]);

      let amountMade = 0;
      if (statsResponse.ok) {
        const statsData = (await statsResponse.json()) as {
          totalEarnings?: number;
        };
        amountMade = Number(statsData.totalEarnings || 0);
      }

      if (!amountMade) {
        try {
          const rawWalletStats = window.localStorage.getItem(
            `wallet_stats_${currentUser.id}`,
          );
          if (rawWalletStats) {
            const parsed = JSON.parse(rawWalletStats) as {
              totalEarned?: number;
            };
            amountMade = Number(parsed.totalEarned || 0);
          }
        } catch {
          return;
        }
      }

      let model: ProfileViewModel;
      if (profileResponse.ok) {
        const apiData = (await profileResponse.json()) as ApiProfile;
        model = toProfileViewModel(apiData, amountMade);
      } else {
        const fallbackName = (currentUser.username || "member_user").split("_");
        model = toProfileViewModel(
          {
            id: currentUser.id,
            firstName: fallbackName[0] || "Freelancer",
            lastName: fallbackName[1] || "User",
            username: currentUser.username,
            email: currentUser.email || "member@lenno.app",
            userType: "FREELANCER",
            createdAt: new Date().toISOString(),
          },
          amountMade,
        );
      }

      model = applyLocalEdits(model, readLocalEdits(currentUser.id));
      model = {
        ...model,
        education: sanitizeEducationEntries(model.education),
        projects: sanitizeProjectEntries(model.projects),
        testimonials: sanitizeTestimonialEntries(model.testimonials),
      };
      model.connects = readConnects(currentUser.id);

      const rewardKey = completionBonusKey(currentUser.id);
      const alreadyRewarded = window.localStorage.getItem(rewardKey) === "true";
      if (model.profileCompletion === 100 && !alreadyRewarded) {
        model.connects += 100;
        persistConnects(currentUser.id, model.connects);
        window.localStorage.setItem(rewardKey, "true");
      }

      setProfile(model);
      setFormFromProfile(model);

      const sessionUser = Auth.getCurrentUser();
      if (sessionUser) {
        const nextSessionUser = {
          ...sessionUser,
          profile: {
            ...(sessionUser.profile || {
              id: `profile_${sessionUser.id}`,
              userId: sessionUser.id,
            }),
            avatar: model.avatar,
          },
        };
        Auth.setSession(nextSessionUser, Auth.getToken() || undefined);
        window.localStorage.setItem(
          `lenno_global_avatar_${sessionUser.id}`,
          model.avatar,
        );
      }
    } catch {
      setError("Unable to sync profile data right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
      window.location.href = "/auth/signup";
      return;
    }
    Auth.setSession(currentUser, Auth.getToken() || undefined);
    loadProfile();
  }, [loadProfile]);

  const memberSince = useMemo(() => {
    if (!profile) return "-";
    return new Date(profile.createdAt).getFullYear();
  }, [profile]);

  const needsNameSetup = useMemo(() => {
    if (!profile) return false;
    const invalidFirst =
      !profile.firstName || profile.firstName.toLowerCase() === "freelancer";
    const invalidLast =
      !profile.lastName || profile.lastName.toLowerCase() === "user";
    const combined = `${profile.firstName} ${profile.lastName}`
      .trim()
      .toLowerCase();
    return (
      invalidFirst || invalidLast || combined === profile.username.toLowerCase()
    );
  }, [profile]);

  const isNewUser = useMemo(() => {
    if (!profile) return false;
    return (
      profile.completedJobs === 0 &&
      profile.totalReviews === 0 &&
      profile.amountMade === 0
    );
  }, [profile]);

  const toggleWorkPreference = () => {
    if (!profile) return;
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;

    const nextAvailability = cycleAvailability(profile.availability);
    const nextPreferredPricing = pricingFromAvailability(nextAvailability);
    const nextModel = {
      ...profile,
      availability: nextAvailability,
      preferredPricing: nextPreferredPricing,
    };
    nextModel.profileCompletion = calculateProfileCompletion(nextModel);

    setProfile(nextModel);
    setForm((prev) => ({
      ...prev,
      availability: nextAvailability,
      preferredPricing: nextPreferredPricing,
    }));

    writeLocalEdits(currentUser.id, {
      ...readLocalEdits(currentUser.id),
      availability: nextAvailability,
      preferredPricing: nextPreferredPricing,
    });
    setSuccessMessage(`Work preference updated: ${nextAvailability}.`);
  };

  const saveProfile = async () => {
    if (!profile) return;
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;

    const parsedRate = Number(form.hourlyRate);
    const hourlyRate =
      Number.isFinite(parsedRate) && parsedRate > 0 ? parsedRate : undefined;

    const education = sanitizeEducationEntries(form.education)
      .filter(
        (item) =>
          item.institution.trim() ||
          item.degree.trim() ||
          item.field.trim() ||
          item.year.trim(),
      )
      .slice(0, 10);
    const projects = sanitizeProjectEntries(form.projects)
      .filter(
        (item) =>
          item.title.trim() ||
          item.role.trim() ||
          item.category.trim() ||
          item.status.trim() ||
          item.link.trim(),
      )
      .slice(0, 10);
    const testimonials = sanitizeTestimonialEntries(form.testimonials)
      .filter((item) => item.clientName.trim() || item.feedback.trim())
      .slice(0, 10);

    let nextModel: ProfileViewModel = {
      ...profile,
      firstName: form.firstName.trim() || profile.firstName,
      lastName: form.lastName.trim() || profile.lastName,
      fullName:
        `${form.firstName.trim() || profile.firstName} ${form.lastName.trim() || profile.lastName}`.trim(),
      title: form.title.trim() || profile.title,
      description: form.description.trim() || profile.description,
      location: form.location.trim() || undefined,
      hourlyRate,
      avatar: form.avatar.trim() || profile.avatar,
      skills: form.services.slice(0, 10),
      availability: form.availability,
      preferredPricing: form.preferredPricing,
      education,
      projects,
      testimonials,
    };

    nextModel = {
      ...nextModel,
      profileCompletion: calculateProfileCompletion(nextModel),
    };

    const localEdits: LocalProfileEdits = {
      firstName: nextModel.firstName,
      lastName: nextModel.lastName,
      title: nextModel.title,
      description: nextModel.description,
      location: nextModel.location,
      hourlyRate: nextModel.hourlyRate,
      avatar: nextModel.avatar,
      skills: nextModel.skills,
      availability: nextModel.availability,
      preferredPricing: nextModel.preferredPricing,
      education: nextModel.education,
      projects: nextModel.projects,
      testimonials: nextModel.testimonials,
    };

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: nextModel.title,
          description: nextModel.description,
          hourlyRate: nextModel.hourlyRate,
          avatar: nextModel.avatar,
          location: nextModel.location,
          skills: nextModel.skills,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Session expired or unauthorized. Please sign in again to sync profile with backend.",
          );
        }
        throw new Error(data.error || "Failed to save profile");
      }

      writeLocalEdits(currentUser.id, localEdits);

      const rewardKey = completionBonusKey(currentUser.id);
      const alreadyRewarded = window.localStorage.getItem(rewardKey) === "true";
      let saveMessage = "Profile saved successfully.";

      if (nextModel.profileCompletion === 100 && !alreadyRewarded) {
        nextModel = { ...nextModel, connects: nextModel.connects + 100 };
        persistConnects(currentUser.id, nextModel.connects);
        window.localStorage.setItem(rewardKey, "true");
        saveMessage =
          "Profile saved successfully. You earned 100 Lenno Connects for completing your profile.";
      } else {
        persistConnects(currentUser.id, nextModel.connects);
      }

      setProfile(nextModel);
      setFormFromProfile(nextModel);
      setEditMode(false);
      setSuccessMessage(saveMessage);

      const refreshedUser = Auth.getCurrentUser();
      if (refreshedUser) {
        const nextSessionUser = {
          ...refreshedUser,
          firstName: nextModel.firstName,
          lastName: nextModel.lastName,
          profile: {
            ...(refreshedUser.profile || {
              id: `profile_${refreshedUser.id}`,
              userId: refreshedUser.id,
            }),
            avatar: nextModel.avatar,
          },
        };
        Auth.setSession(nextSessionUser, Auth.getToken() || undefined);
        window.localStorage.setItem(
          `lenno_global_avatar_${refreshedUser.id}`,
          nextModel.avatar,
        );
      }

      return true;
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save profile",
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveSectionEdit = async () => {
    const ok = await saveProfile();
    if (ok) setActiveSectionEdit(null);
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-[#eef3f6] px-3 py-4 sm:px-4 sm:py-6">
          <div className="mx-auto max-w-[420px] animate-pulse rounded-[30px] border border-primary-200 bg-white p-4">
            <div className="h-16 w-16 rounded-full bg-primary-100" />
            <div className="mt-4 h-7 w-2/3 rounded bg-primary-100" />
            <div className="mt-2 h-4 w-1/2 rounded bg-primary-100" />
            <div className="mt-6 h-16 rounded-2xl bg-primary-100" />
            <div className="mt-4 h-10 rounded-full bg-primary-100" />
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!profile) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-[#eef3f6] px-3 py-4 sm:px-4 sm:py-6">
          <div className="mx-auto max-w-[420px] rounded-3xl border border-primary-200 bg-white p-5 text-sm text-primary-700">
            Profile unavailable. {error || "Please try again."}
          </div>
        </div>
      </MobileLayout>
    );
  }

  const earnedText = formatCompactCurrency(profile.amountMade);
  const rateText = profile.hourlyRate
    ? `${formatCurrency(profile.hourlyRate)}/hr`
    : "N/A";
  const visibleSkills = profile.skills.slice(0, 2);
  const extraSkillsCount = Math.max(
    0,
    profile.skills.length - visibleSkills.length,
  );

  return (
    <MobileLayout>
      <div className="min-h-screen bg-[#eef3f6] px-3 py-4 sm:px-4 sm:py-6">
        <div className="mx-auto max-w-[420px] space-y-3">
          {isNewUser && (
            <div className="rounded-3xl border border-primary-200 bg-white p-4 text-sm text-primary-700">
              <h3 className="font-semibold text-primary-900">
                Welcome to Lenno
              </h3>
              <p className="mt-1">
                Complete your freelancer profile to build trust and start
                winning projects faster.
              </p>
              <p className="mt-2 text-xs text-primary-600">
                Profile completion: {profile.profileCompletion}% • Reach 100% to
                earn 100 Lenno Connects.
              </p>
            </div>
          )}

          <div className="rounded-[30px] border border-primary-200 bg-gradient-to-b from-[#edf4fa] to-[#cde5ff] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-primary-100 bg-primary-100 sm:h-20 sm:w-20">
                <Image
                  src={profile.avatar}
                  alt={profile.fullName}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="h-10 w-10 rounded-full border border-primary-100 bg-white/70 flex items-center justify-center text-primary-900 hover:bg-white"
                  onClick={() => {
                    if (editMode) {
                      setEditMode(false);
                      setFormFromProfile(profile);
                    } else {
                      setEditMode(true);
                    }
                  }}
                >
                  {editMode ? (
                    <XMarkIcon className="h-5 w-5" />
                  ) : (
                    <PencilSquareIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  className="h-10 w-10 rounded-full border border-primary-100 bg-white/70 flex items-center justify-center text-primary-900 hover:bg-white"
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: `${profile.fullName} • Lenno`,
                          text: `Check out ${profile.fullName}'s freelancer profile on Lenno`,
                          url: window.location.href,
                        })
                        .catch(() => undefined);
                    }
                  }}
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h1 className="text-2xl font-semibold leading-tight text-primary-900 sm:text-3xl">
                {profile.fullName}
              </h1>
              <p className="mt-1 text-base text-primary-700 sm:text-lg">
                {profile.title || "Add a professional title"}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {visibleSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-primary-100 bg-white/50 px-3 py-1 text-xs text-primary-800 sm:text-sm"
                >
                  {skill}
                </span>
              ))}
              {extraSkillsCount > 0 && (
                <span className="rounded-full border border-primary-100 bg-white/50 px-3 py-1 text-xs text-primary-800 sm:text-sm">
                  +{extraSkillsCount}
                </span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 items-stretch">
              <div className="px-1 flex flex-col items-start gap-1">
                <p className="h-7 text-xs text-primary-700 sm:text-sm flex items-center">
                  Rating
                </p>
                <p className="h-8 flex items-center justify-center gap-1 text-lg font-semibold text-primary-900 sm:text-xl">
                  <StarIcon className="h-4 w-4 text-[#f4c400] sm:h-5 sm:w-5" />
                  {profile.totalReviews > 0
                    ? profile.averageRating.toFixed(1)
                    : "New"}
                </p>
                <p className="text-[11px] text-primary-600">
                  {profile.totalReviews > 0
                    ? `${profile.totalReviews} review${profile.totalReviews === 1 ? "" : "s"}`
                    : "No reviews yet"}
                </p>
              </div>
              <div className="border-l border-r border-primary-200 px-1 flex flex-col items-start gap-1">
                <p className="h-7 text-xs text-primary-700 sm:text-sm flex items-center">
                  Earned
                </p>
                <p className="h-8 flex items-center font-semibold text-primary-900 whitespace-nowrap text-xl sm:text-2xl">
                  {earnedText}
                </p>
              </div>
              <div className="px-1 flex flex-col items-start gap-1">
                <p className="h-7 text-xs text-primary-700 sm:text-sm flex items-center">
                  Rate
                </p>
                <p className="h-8 flex items-center font-semibold text-primary-900 whitespace-nowrap text-xl sm:text-2xl">
                  {rateText}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <button
                onClick={() => {
                  if (profile.connects > 0) {
                    window.location.href = "/jobs";
                  } else {
                    window.location.href = "/wallet";
                  }
                }}
                className="flex-1 rounded-full border border-primary-100 bg-white/40 px-4 py-2.5 text-sm font-medium text-primary-900 hover:bg-white/60"
              >
                {profile.connects > 0
                  ? "Start applying"
                  : "Buy connects to apply"}
              </button>
              <button
                onClick={toggleWorkPreference}
                className="h-11 w-11 rounded-full border border-primary-100 bg-white/70 flex items-center justify-center"
                title="Toggle work preference"
              >
                <BriefcaseIcon className="h-5 w-5 text-primary-800" />
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-primary-200 bg-white p-4 text-sm text-primary-700">
            <h3 className="text-sm font-semibold text-primary-900">
              Lenno Connects
            </h3>
            <p className="mt-1 text-2xl font-semibold text-primary-900">
              {profile.connects.toLocaleString("en-US")}
            </p>
            <p className="mt-1 text-xs text-primary-600">
              You need connects to submit proposals and apply for jobs.
            </p>
            {profile.connects <= 0 && (
              <p className="mt-1 text-xs text-primary-700">
                No connects left. Buy connects to continue applying.
              </p>
            )}
            <button
              onClick={() => {
                window.location.href = "/wallet";
              }}
              className="mt-3 rounded-full bg-[#abff31] px-4 py-2 text-xs font-semibold text-primary-900 hover:bg-[#9ae62c]"
            >
              Buy Lenno Connects
            </button>
          </div>

          {needsNameSetup && (
            <div className="rounded-3xl border border-primary-200 bg-white p-4 text-sm text-primary-700">
              <h3 className="font-semibold text-primary-900">
                Complete your name
              </h3>
              <p className="mt-1 text-xs text-primary-600">
                Your profile is still using username fallback. Add first and
                last name from edit mode.
              </p>
            </div>
          )}

          <div className="rounded-3xl border border-primary-200 bg-white p-4 text-sm text-primary-700">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <BriefcaseIcon className="h-4 w-4" /> Freelancer profile
              </span>
              {profile.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" /> {profile.location}
                </span>
              )}
              <span>Completed jobs: {profile.completedJobs}</span>
              <span>Member since {memberSince}</span>
            </div>
            {profile.description ? (
              <p className="mt-3 leading-relaxed text-primary-800">
                {profile.description}
              </p>
            ) : (
              <p className="mt-3 leading-relaxed text-primary-600">
                Add a short bio about your expertise, services, and the types
                of projects you want to work on.
              </p>
            )}
            <p className="mt-2 text-xs text-primary-600">
              Profile completion: {profile.profileCompletion}%
            </p>
            {error && <p className="mt-2 text-xs text-primary-500">{error}</p>}
          </div>

          <div className="rounded-3xl border border-primary-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-primary-900">
                Services
              </h3>
              <button
                onClick={() => setActiveSectionEdit("services")}
                className="text-xs text-primary-700 underline"
              >
                Edit
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.skills.length > 0 ? (
                profile.skills.map((skill) => (
                  <span
                    key={`service-${skill}`}
                    className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs text-primary-800"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-xs text-primary-600">
                  No services yet. Add your top services in edit mode.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-primary-200 bg-white p-4 text-sm text-primary-700">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-primary-900">
                Work Preferences
              </h3>
              <button
                onClick={() => setActiveSectionEdit("workPreferences")}
                className="text-xs text-primary-700 underline"
              >
                Edit
              </button>
            </div>
            <p className="mt-2">{profile.availability}</p>
            <p className="mt-1">
              Preferred pricing: {profile.preferredPricing}
            </p>
            <p className="mt-1 text-xs text-primary-600">
              Tap the briefcase button in the header to quickly cycle
              availability.
            </p>
            <p className="mt-1">Recent reviews: {profile.totalReviews}</p>
          </div>

          <div className="rounded-3xl border border-primary-200 bg-white p-4 text-sm text-primary-700">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-primary-900">
                Education
              </h3>
              <button
                onClick={() => setActiveSectionEdit("education")}
                className="text-xs text-primary-700 underline"
              >
                Edit
              </button>
            </div>
            {profile.education.length > 0 ? (
              <div className="mt-2 space-y-2">
                {profile.education.map((item, index) => (
                  <div
                    key={`education-${index}`}
                    className="rounded-xl border border-primary-200 p-2"
                  >
                    <p className="font-medium text-primary-900">
                      {item.degree || "Degree"}
                    </p>
                    <p className="text-xs text-primary-700">
                      {item.institution || "Institution"}
                    </p>
                    <p className="text-xs text-primary-600">
                      {item.field} • {item.year}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-primary-600">
                Add your education details to strengthen trust.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-primary-200 bg-white p-4 text-sm text-primary-700">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-primary-900">
                Projects
              </h3>
              <button
                onClick={() => setActiveSectionEdit("projects")}
                className="text-xs text-primary-700 underline"
              >
                Edit
              </button>
            </div>
            {profile.projects.length > 0 ? (
              <div className="mt-2 space-y-2">
                {profile.projects.map((item, index) => (
                  <div
                    key={`project-${index}`}
                    className="rounded-xl border border-primary-200 p-2"
                  >
                    <p className="font-medium text-primary-900">
                      {item.title || "Project"}
                    </p>
                    <p className="text-xs text-primary-700">
                      Role: {item.role || "-"}
                    </p>
                    <p className="text-xs text-primary-600">
                      {item.category || "-"} • {item.status || "-"}
                    </p>
                    {typeof item.link === "string" &&
                      item.link.trim().length > 0 && (
                        <p className="text-xs text-primary-600 truncate">
                          {item.link}
                        </p>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-primary-600">
                Showcase project data to help clients evaluate your fit.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-primary-200 bg-white p-4 text-sm text-primary-700">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-primary-900">
                Testimonials
              </h3>
              <button
                onClick={() => setActiveSectionEdit("testimonials")}
                className="text-xs text-primary-700 underline"
              >
                Edit
              </button>
            </div>
            {profile.testimonials.length > 0 ? (
              <div className="mt-2 space-y-2">
                {profile.testimonials.map((item, index) => (
                  <div
                    key={`testimonial-${index}`}
                    className="rounded-xl border border-primary-200 p-2"
                  >
                    <p className="font-medium text-primary-900">
                      {item.clientName || "Client"}
                    </p>
                    <p className="text-xs text-primary-700">
                      {item.company || "Company"} • {item.rating}/5
                    </p>
                    <p className="text-xs text-primary-600">
                      {item.feedback || ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-primary-600">
                Add testimonial records from completed collaborations.
              </p>
            )}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-[#0a4abf]/20"
            onClick={() => setSuccessMessage("")}
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-primary-200 bg-white p-5">
            <button
              onClick={() => setSuccessMessage("")}
              className="absolute right-4 top-4 h-8 w-8 rounded-full border border-primary-200 flex items-center justify-center text-primary-700 hover:bg-primary-50"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <p className="text-xs uppercase tracking-wide text-primary-500">
              Success
            </p>
            <h3 className="mt-1 text-xl font-semibold text-primary-900">
              Profile Updated
            </h3>
            <p className="mt-2 text-sm text-primary-700">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage("")}
              className="mt-4 w-full rounded-full bg-[#abff31] px-4 py-2 text-sm font-medium text-primary-900 hover:bg-[#9ae62c]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {editMode && (
        <div className="fixed inset-0 z-[79] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-[#0a4abf]/20"
            onClick={() => {
              setEditMode(false);
              setFormFromProfile(profile);
            }}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-primary-200 bg-white p-4">
            <button
              onClick={() => {
                setEditMode(false);
                setFormFromProfile(profile);
              }}
              className="absolute right-4 top-4 h-8 w-8 rounded-full border border-primary-200 flex items-center justify-center text-primary-700 hover:bg-primary-50"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <h3 className="text-sm font-semibold text-primary-900">
              Edit freelancer profile
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs text-primary-600">First name</label>
                <input
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      firstName: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-primary-600">Last name</label>
                <input
                  value={form.lastName}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      lastName: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
                />
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-xs text-primary-600">
                Professional title
              </label>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
              />
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-xs text-primary-600">Location</label>
              <input
                value={form.location}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, location: event.target.value }))
                }
                className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
              />
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-xs text-primary-600">
                Hourly rate (USD)
              </label>
              <input
                type="number"
                min={0}
                value={form.hourlyRate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    hourlyRate: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
              />
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-xs text-primary-600">
                Services (max 10)
              </label>
              <ServiceSelector
                selected={form.services}
                onChange={(next) =>
                  setForm((prev) => ({ ...prev, services: next.slice(0, 10) }))
                }
                maxServices={10}
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs text-primary-600">Availability</label>
                <select
                  value={form.availability}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      availability: event.target.value as AvailabilityPref,
                    }))
                  }
                  className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
                >
                  <option>Open to fixed contracts</option>
                  <option>Open to hourly contracts</option>
                  <option>Open to hourly and fixed contracts</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-primary-600">
                  Preferred pricing
                </label>
                <select
                  value={form.preferredPricing}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      preferredPricing: event.target.value as PricingPref,
                    }))
                  }
                  className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
                >
                  <option>Project-based</option>
                  <option>Hourly-based</option>
                  <option>Both</option>
                </select>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-xs text-primary-600">Bio</label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                className="w-full min-h-[88px] rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
              />
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-primary-600">
                  Education (max 10)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (form.education.length >= 10) return;
                    setForm((prev) => ({
                      ...prev,
                      education: [...prev.education, { ...EMPTY_EDUCATION }],
                    }));
                  }}
                  className="text-xs text-primary-700 underline"
                >
                  Add education
                </button>
              </div>
              <div className="space-y-2">
                {form.education.map((entry, index) => (
                  <div
                    key={`education-edit-${index}`}
                    className="rounded-xl border border-primary-200 p-2 space-y-2"
                  >
                    <input
                      value={entry.institution}
                      onChange={(event) => {
                        const next = [...form.education];
                        next[index] = {
                          ...next[index],
                          institution: event.target.value,
                        };
                        setForm((prev) => ({ ...prev, education: next }));
                      }}
                      placeholder="Institution"
                      className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={entry.degree}
                        onChange={(event) => {
                          const next = [...form.education];
                          next[index] = {
                            ...next[index],
                            degree: event.target.value,
                          };
                          setForm((prev) => ({ ...prev, education: next }));
                        }}
                        placeholder="Degree"
                        className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                      />
                      <input
                        value={entry.field}
                        onChange={(event) => {
                          const next = [...form.education];
                          next[index] = {
                            ...next[index],
                            field: event.target.value,
                          };
                          setForm((prev) => ({ ...prev, education: next }));
                        }}
                        placeholder="Field"
                        className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        value={entry.year}
                        onChange={(event) => {
                          const next = [...form.education];
                          next[index] = {
                            ...next[index],
                            year: event.target.value,
                          };
                          setForm((prev) => ({ ...prev, education: next }));
                        }}
                        placeholder="Year"
                        className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = form.education.filter(
                            (_, itemIndex) => itemIndex !== index,
                          );
                          setForm((prev) => ({ ...prev, education: next }));
                        }}
                        className="text-xs text-primary-700 underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-primary-600">Projects</label>
                <button
                  type="button"
                  onClick={() => {
                    if (form.projects.length >= 10) return;
                    setForm((prev) => ({
                      ...prev,
                      projects: [...prev.projects, { ...EMPTY_PROJECT }],
                    }));
                  }}
                  className="text-xs text-primary-700 underline"
                >
                  Add project
                </button>
              </div>
              <div className="space-y-2">
                {form.projects.map((entry, index) => (
                  <div
                    key={`project-edit-${index}`}
                    className="rounded-xl border border-primary-200 p-2 space-y-2"
                  >
                    <input
                      value={entry.title}
                      onChange={(event) => {
                        const next = [...form.projects];
                        next[index] = {
                          ...next[index],
                          title: event.target.value,
                        };
                        setForm((prev) => ({ ...prev, projects: next }));
                      }}
                      placeholder="Project title"
                      className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={entry.role}
                        onChange={(event) => {
                          const next = [...form.projects];
                          next[index] = {
                            ...next[index],
                            role: event.target.value,
                          };
                          setForm((prev) => ({ ...prev, projects: next }));
                        }}
                        placeholder="Role"
                        className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                      />
                      <input
                        value={entry.category}
                        onChange={(event) => {
                          const next = [...form.projects];
                          next[index] = {
                            ...next[index],
                            category: event.target.value,
                          };
                          setForm((prev) => ({ ...prev, projects: next }));
                        }}
                        placeholder="Category"
                        className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={entry.status}
                        onChange={(event) => {
                          const next = [...form.projects];
                          next[index] = {
                            ...next[index],
                            status: event.target.value,
                          };
                          setForm((prev) => ({ ...prev, projects: next }));
                        }}
                        placeholder="Status"
                        className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                      />
                      <input
                        value={entry.link}
                        onChange={(event) => {
                          const next = [...form.projects];
                          next[index] = {
                            ...next[index],
                            link: event.target.value,
                          };
                          setForm((prev) => ({ ...prev, projects: next }));
                        }}
                        placeholder="Link"
                        className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = form.projects.filter(
                          (_, itemIndex) => itemIndex !== index,
                        );
                        setForm((prev) => ({ ...prev, projects: next }));
                      }}
                      className="text-xs text-primary-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-primary-600">Testimonials</label>
                <button
                  type="button"
                  onClick={() => {
                    if (form.testimonials.length >= 10) return;
                    setForm((prev) => ({
                      ...prev,
                      testimonials: [
                        ...prev.testimonials,
                        { ...EMPTY_TESTIMONIAL },
                      ],
                    }));
                  }}
                  className="text-xs text-primary-700 underline"
                >
                  Add testimonial
                </button>
              </div>
              <div className="space-y-2">
                {form.testimonials.map((entry, index) => (
                  <div
                    key={`testimonial-edit-${index}`}
                    className="rounded-xl border border-primary-200 p-2 space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={entry.clientName}
                        onChange={(event) => {
                          const next = [...form.testimonials];
                          next[index] = {
                            ...next[index],
                            clientName: event.target.value,
                          };
                          setForm((prev) => ({ ...prev, testimonials: next }));
                        }}
                        placeholder="Client name"
                        className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                      />
                      <input
                        value={entry.company}
                        onChange={(event) => {
                          const next = [...form.testimonials];
                          next[index] = {
                            ...next[index],
                            company: event.target.value,
                          };
                          setForm((prev) => ({ ...prev, testimonials: next }));
                        }}
                        placeholder="Company"
                        className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={entry.rating}
                        onChange={(event) => {
                          const next = [...form.testimonials];
                          next[index] = {
                            ...next[index],
                            rating: Math.max(
                              1,
                              Math.min(5, Number(event.target.value || 5)),
                            ),
                          };
                          setForm((prev) => ({ ...prev, testimonials: next }));
                        }}
                        placeholder="Rating 1-5"
                        className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                      />
                    </div>
                    <textarea
                      value={entry.feedback}
                      onChange={(event) => {
                        const next = [...form.testimonials];
                        next[index] = {
                          ...next[index],
                          feedback: event.target.value,
                        };
                        setForm((prev) => ({ ...prev, testimonials: next }));
                      }}
                      placeholder="Feedback"
                      className="w-full min-h-[60px] rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = form.testimonials.filter(
                          (_, itemIndex) => itemIndex !== index,
                        );
                        setForm((prev) => ({ ...prev, testimonials: next }));
                      }}
                      className="text-xs text-primary-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-xs text-primary-600">
                Avatar defaults
              </label>
              <div className="flex items-center gap-2">
                {DEFAULT_AVATARS.map((avatarUrl) => (
                  <button
                    key={avatarUrl}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, avatar: avatarUrl }))
                    }
                    className={`h-12 w-12 overflow-hidden rounded-full border ${
                      form.avatar === avatarUrl
                        ? "border-[#abff31]"
                        : "border-primary-200"
                    }`}
                  >
                    <Image
                      src={avatarUrl}
                      alt="default avatar"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-xs text-primary-600">
                Avatar URL (optional)
              </label>
              <input
                value={form.avatar}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, avatar: event.target.value }))
                }
                className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormFromProfile(profile);
                }}
                className="rounded-full border border-primary-200 px-4 py-2 text-sm text-primary-700"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="rounded-full bg-[#abff31] px-4 py-2 text-sm font-medium text-primary-900 hover:bg-[#9ae62c] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProfileSectionEditor
        open={activeSectionEdit !== null}
        title={
          activeSectionEdit === "services"
            ? "Edit services"
            : activeSectionEdit === "workPreferences"
              ? "Edit work preferences"
              : activeSectionEdit === "education"
                ? "Edit education"
                : activeSectionEdit === "projects"
                  ? "Edit projects"
                  : "Edit testimonials"
        }
        onClose={() => setActiveSectionEdit(null)}
        onSave={saveSectionEdit}
        saving={saving}
      >
        {activeSectionEdit === "services" && (
          <div className="space-y-2">
            <label className="text-xs text-primary-600">
              Services (max 10)
            </label>
            <ServiceSelector
              selected={form.services}
              onChange={(next) =>
                setForm((prev) => ({ ...prev, services: next.slice(0, 10) }))
              }
              maxServices={10}
            />
          </div>
        )}

        {activeSectionEdit === "workPreferences" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-primary-600">Availability</label>
              <select
                value={form.availability}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    availability: event.target.value as AvailabilityPref,
                  }))
                }
                className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
              >
                <option>Open to fixed contracts</option>
                <option>Open to hourly contracts</option>
                <option>Open to hourly and fixed contracts</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-primary-600">
                Preferred pricing
              </label>
              <select
                value={form.preferredPricing}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    preferredPricing: event.target.value as PricingPref,
                  }))
                }
                className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
              >
                <option>Project-based</option>
                <option>Hourly-based</option>
                <option>Both</option>
              </select>
            </div>
          </div>
        )}

        {activeSectionEdit === "education" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-primary-600">
                Education (max 10)
              </label>
              <button
                type="button"
                onClick={() => {
                  if (form.education.length >= 10) return;
                  setForm((prev) => ({
                    ...prev,
                    education: [...prev.education, { ...EMPTY_EDUCATION }],
                  }));
                }}
                className="text-xs text-primary-700 underline"
              >
                Add education
              </button>
            </div>
            <div className="space-y-2">
              {form.education.map((entry, index) => (
                <div
                  key={`education-section-${index}`}
                  className="rounded-xl border border-primary-200 p-2 space-y-2"
                >
                  <input
                    value={entry.institution}
                    onChange={(event) => {
                      const next = [...form.education];
                      next[index] = {
                        ...next[index],
                        institution: event.target.value,
                      };
                      setForm((prev) => ({ ...prev, education: next }));
                    }}
                    placeholder="Institution"
                    className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={entry.degree}
                      onChange={(event) => {
                        const next = [...form.education];
                        next[index] = {
                          ...next[index],
                          degree: event.target.value,
                        };
                        setForm((prev) => ({ ...prev, education: next }));
                      }}
                      placeholder="Degree"
                      className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                    />
                    <input
                      value={entry.field}
                      onChange={(event) => {
                        const next = [...form.education];
                        next[index] = {
                          ...next[index],
                          field: event.target.value,
                        };
                        setForm((prev) => ({ ...prev, education: next }));
                      }}
                      placeholder="Field"
                      className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={entry.year}
                      onChange={(event) => {
                        const next = [...form.education];
                        next[index] = {
                          ...next[index],
                          year: event.target.value,
                        };
                        setForm((prev) => ({ ...prev, education: next }));
                      }}
                      placeholder="Year"
                      className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = form.education.filter(
                          (_, itemIndex) => itemIndex !== index,
                        );
                        setForm((prev) => ({ ...prev, education: next }));
                      }}
                      className="text-xs text-primary-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSectionEdit === "projects" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-primary-600">Projects</label>
              <button
                type="button"
                onClick={() => {
                  if (form.projects.length >= 10) return;
                  setForm((prev) => ({
                    ...prev,
                    projects: [...prev.projects, { ...EMPTY_PROJECT }],
                  }));
                }}
                className="text-xs text-primary-700 underline"
              >
                Add project
              </button>
            </div>
            <div className="space-y-2">
              {form.projects.map((entry, index) => (
                <div
                  key={`project-section-${index}`}
                  className="rounded-xl border border-primary-200 p-2 space-y-2"
                >
                  <input
                    value={entry.title}
                    onChange={(event) => {
                      const next = [...form.projects];
                      next[index] = {
                        ...next[index],
                        title: event.target.value,
                      };
                      setForm((prev) => ({ ...prev, projects: next }));
                    }}
                    placeholder="Project title"
                    className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={entry.role}
                      onChange={(event) => {
                        const next = [...form.projects];
                        next[index] = {
                          ...next[index],
                          role: event.target.value,
                        };
                        setForm((prev) => ({ ...prev, projects: next }));
                      }}
                      placeholder="Role"
                      className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                    />
                    <input
                      value={entry.category}
                      onChange={(event) => {
                        const next = [...form.projects];
                        next[index] = {
                          ...next[index],
                          category: event.target.value,
                        };
                        setForm((prev) => ({ ...prev, projects: next }));
                      }}
                      placeholder="Category"
                      className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={entry.status}
                      onChange={(event) => {
                        const next = [...form.projects];
                        next[index] = {
                          ...next[index],
                          status: event.target.value,
                        };
                        setForm((prev) => ({ ...prev, projects: next }));
                      }}
                      placeholder="Status"
                      className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                    />
                    <input
                      value={entry.link}
                      onChange={(event) => {
                        const next = [...form.projects];
                        next[index] = {
                          ...next[index],
                          link: event.target.value,
                        };
                        setForm((prev) => ({ ...prev, projects: next }));
                      }}
                      placeholder="Link"
                      className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = form.projects.filter(
                        (_, itemIndex) => itemIndex !== index,
                      );
                      setForm((prev) => ({ ...prev, projects: next }));
                    }}
                    className="text-xs text-primary-700 underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSectionEdit === "testimonials" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-primary-600">Testimonials</label>
              <button
                type="button"
                onClick={() => {
                  if (form.testimonials.length >= 10) return;
                  setForm((prev) => ({
                    ...prev,
                    testimonials: [
                      ...prev.testimonials,
                      { ...EMPTY_TESTIMONIAL },
                    ],
                  }));
                }}
                className="text-xs text-primary-700 underline"
              >
                Add testimonial
              </button>
            </div>
            <div className="space-y-2">
              {form.testimonials.map((entry, index) => (
                <div
                  key={`testimonial-section-${index}`}
                  className="rounded-xl border border-primary-200 p-2 space-y-2"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={entry.clientName}
                      onChange={(event) => {
                        const next = [...form.testimonials];
                        next[index] = {
                          ...next[index],
                          clientName: event.target.value,
                        };
                        setForm((prev) => ({ ...prev, testimonials: next }));
                      }}
                      placeholder="Client name"
                      className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                    />
                    <input
                      value={entry.company}
                      onChange={(event) => {
                        const next = [...form.testimonials];
                        next[index] = {
                          ...next[index],
                          company: event.target.value,
                        };
                        setForm((prev) => ({ ...prev, testimonials: next }));
                      }}
                      placeholder="Company"
                      className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                    />
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={entry.rating}
                    onChange={(event) => {
                      const next = [...form.testimonials];
                      next[index] = {
                        ...next[index],
                        rating: Math.max(
                          1,
                          Math.min(5, Number(event.target.value || 5)),
                        ),
                      };
                      setForm((prev) => ({ ...prev, testimonials: next }));
                    }}
                    placeholder="Rating 1-5"
                    className="w-full rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                  />
                  <textarea
                    value={entry.feedback}
                    onChange={(event) => {
                      const next = [...form.testimonials];
                      next[index] = {
                        ...next[index],
                        feedback: event.target.value,
                      };
                      setForm((prev) => ({ ...prev, testimonials: next }));
                    }}
                    placeholder="Feedback"
                    className="w-full min-h-[60px] rounded-lg border border-primary-200 px-2 py-1.5 text-xs text-primary-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = form.testimonials.filter(
                        (_, itemIndex) => itemIndex !== index,
                      );
                      setForm((prev) => ({ ...prev, testimonials: next }));
                    }}
                    className="text-xs text-primary-700 underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </ProfileSectionEditor>
    </MobileLayout>
  );
}

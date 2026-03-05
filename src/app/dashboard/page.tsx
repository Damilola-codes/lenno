"use client";
import { useState, useEffect, useCallback, type FormEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BriefcaseIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart3,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  User,
  LogOut,
  TrendingUp,
  Calendar,
  Briefcase,
  Plus,
  ChevronRight,
} from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import NotificationBell from "@/components/ui/NotificationBell";
import { Auth, type User as AuthUser } from "@/library/auth";
import { addNotification } from "../../library/notifications";

interface DashboardStats {
  totalEarnings: number;
  pendingPayments: number;
  completedJobs: number;
  activeProjects: number;
  totalJobs: number;
  acceptedProposals: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
}

interface WalletLocalStats {
  balance?: number;
  pendingBalance?: number;
  totalEarned?: number;
  totalSpent?: number;
  neoPoints?: number;
}

interface RecentActivity {
  id: string;
  type:
    | "job_completed"
    | "payment_received"
    | "proposal_accepted"
    | "job_posted"
    | "milestone_completed";
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  status?: string;
}

type TimeRange = "week" | "month" | "year";

interface ActionFeedback {
  type: "success" | "error";
  message: string;
}

interface InvoiceForm {
  clientName: string;
  projectTitle: string;
  amount: string;
}

interface ProgressForm {
  projectTitle: string;
  update: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(
    null,
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<InvoiceForm>({
    clientName: "",
    projectTitle: "",
    amount: "",
  });
  const [progressForm, setProgressForm] = useState<ProgressForm>({
    projectTitle: "",
    update: "",
  });

  const mergeDashboardWithWalletStats = (
    nextStats: DashboardStats,
    userId: string,
  ): DashboardStats => {
    try {
      const rawWalletStats = window.localStorage.getItem(
        `wallet_stats_${userId}`,
      );
      if (!rawWalletStats) return nextStats;

      const walletStats = JSON.parse(rawWalletStats) as WalletLocalStats;
      const walletEarned = Number(
        walletStats.totalEarned ?? nextStats.totalEarnings,
      );
      const walletPending = Number(
        walletStats.pendingBalance ?? nextStats.pendingPayments,
      );

      return {
        ...nextStats,
        totalEarnings: Number.isFinite(walletEarned)
          ? Number(walletEarned.toFixed(2))
          : nextStats.totalEarnings,
        pendingPayments: Number.isFinite(walletPending)
          ? Number(walletPending.toFixed(2))
          : nextStats.pendingPayments,
      };
    } catch {
      return nextStats;
    }
  };

  const runNavigationAction = (label: string, href: string) => {
    try {
      setActionFeedback({ type: "success", message: `${label} opened.` });
      void addNotification({
        type: "info",
        title: `${label} opened`,
        message: `You opened ${label.toLowerCase()}.`,
      });
      setTimeout(() => {
        window.location.href = href;
      }, 180);
    } catch {
      setActionFeedback({
        type: "error",
        message: `Unable to open ${label.toLowerCase()} right now.`,
      });
      void addNotification({
        type: "error",
        title: `${label} failed`,
        message: `Unable to open ${label.toLowerCase()} right now.`,
      });
    }
  };

  const handleQuickAction = (
    actionLabel:
      | "Find Jobs"
      | "New Proposal"
      | "Update Profile"
      | "Client Messages"
      | "Request Payment"
      | "Log Progress",
  ) => {
    if (actionLabel === "Find Jobs") {
      runNavigationAction("Find jobs", "/jobs");
      return;
    }

    if (actionLabel === "New Proposal") {
      runNavigationAction("Proposals", "/proposals");
      return;
    }

    if (actionLabel === "Update Profile") {
      runNavigationAction("Profile", "/profile");
      return;
    }

    if (actionLabel === "Client Messages") {
      setActionFeedback({
        type: "error",
        message:
          "Client Messages is coming soon in a future development update.",
      });
      void addNotification({
        type: "info",
        title: "Client Messages",
        message:
          "Client Messages is coming soon in a future development update.",
      });
      return;
    }

    if (actionLabel === "Request Payment") {
      setInvoiceModalOpen(true);
      setActionFeedback(null);
      return;
    }

    setProgressModalOpen(true);
    setActionFeedback(null);
  };

  const submitInvoiceRequest = async () => {
    const amountValue = Number(invoiceForm.amount);
    if (
      !invoiceForm.clientName.trim() ||
      !invoiceForm.projectTitle.trim() ||
      !Number.isFinite(amountValue) ||
      amountValue <= 0
    ) {
      setActionFeedback({
        type: "error",
        message: "Invoice failed. Enter client, project, and a valid amount.",
      });
      return;
    }

    try {
      const payload = {
        clientName: invoiceForm.clientName.trim(),
        projectTitle: invoiceForm.projectTitle.trim(),
        amount: Number(amountValue.toFixed(2)),
      };

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit invoice request");
      }

      setInvoiceModalOpen(false);
      setInvoiceForm({ clientName: "", projectTitle: "", amount: "" });
      setActionFeedback({
        type: "success",
        message: "Invoice request submitted successfully.",
      });
      void addNotification({
        type: "success",
        title: "Invoice submitted",
        message: `Invoice request for ${payload.clientName} was submitted.`,
      });
    } catch {
      setActionFeedback({
        type: "error",
        message: "Unable to submit invoice right now.",
      });
      void addNotification({
        type: "error",
        title: "Invoice failed",
        message: "Unable to submit invoice right now.",
      });
    }
  };

  const submitProgressLog = async () => {
    if (!progressForm.projectTitle.trim() || !progressForm.update.trim()) {
      setActionFeedback({
        type: "error",
        message: "Progress log failed. Add project title and update details.",
      });
      return;
    }

    try {
      const payload = {
        projectTitle: progressForm.projectTitle.trim(),
        update: progressForm.update.trim(),
      };

      const response = await fetch("/api/progress-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save progress log");
      }

      setProgressModalOpen(false);
      setProgressForm({ projectTitle: "", update: "" });
      setActionFeedback({
        type: "success",
        message: "Progress logged successfully.",
      });
      void addNotification({
        type: "success",
        title: "Progress logged",
        message: `Progress update saved for ${payload.projectTitle}.`,
      });
    } catch {
      setActionFeedback({
        type: "error",
        message: "Unable to log progress right now.",
      });
      void addNotification({
        type: "error",
        title: "Progress log failed",
        message: "Unable to log progress right now.",
      });
    }
  };

  const handleDashboardSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = dashboardSearch.trim();
    if (!query) return;
    window.location.href = `/jobs?search=${encodeURIComponent(query)}`;
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, use the current user ID or demo data
      const userId = currentUser?.id || "demo-user-id";

      // Fetch stats
      let statsResponse = await fetch(
        `/api/dashboard/stats?range=${timeRange}&userId=${userId}`,
      );

      if (statsResponse.status === 404 && userId !== "demo-user-id") {
        statsResponse = await fetch(
          `/api/dashboard/stats?range=${timeRange}&userId=demo-user-id`,
        );
      }

      if (!statsResponse.ok) {
        if (statsResponse.status === 400) {
          throw new Error("Invalid request. Please check your account status.");
        } else if (statsResponse.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        } else if (statsResponse.status === 403) {
          throw new Error(
            "Access denied. You may not have permission to view this data.",
          );
        } else if (statsResponse.status >= 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(`Error: ${statsResponse.status}`);
        }
      }

      const statsData = (await statsResponse.json()) as DashboardStats;
      const syncedStats = mergeDashboardWithWalletStats(statsData, userId);
      setStats(syncedStats);

      // Fetch recent activity (mock data for now)
      setRecentActivity([
        {
          id: "1",
          type: "payment_received",
          title: "Payment Received",
          description: "Logo Design Project - Final Payment",
          amount: 150,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: "completed",
        },
        {
          id: "2",
          type: "proposal_accepted",
          title: "Proposal Accepted",
          description: "Mobile App Development - iOS & Android",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          type: "milestone_completed",
          title: "Milestone Completed",
          description: "Website Redesign - Phase 1",
          amount: 75,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, timeRange]);

  useEffect(() => {
    // Check if user is authenticated
    const user = Auth.getCurrentUser();
    if (!user) {
      // Redirect to auth if not authenticated
      window.location.href = "/auth/signup";
      return;
    }
    setCurrentUser(user);
    fetchDashboardData();
  }, [fetchDashboardData]); // Include fetchDashboardData dependency

  useEffect(() => {
    if (!currentUser) {
      setAvatarUrl(null);
      return;
    }

    try {
      const fromSession = currentUser.profile?.avatar;
      const fromLocalEditsRaw = window.localStorage.getItem(
        `profile_local_edits_${currentUser.id}`,
      );
      const fromLocalEdits = fromLocalEditsRaw
        ? (JSON.parse(fromLocalEditsRaw) as { avatar?: string }).avatar
        : undefined;
      const fromGlobalKey = window.localStorage.getItem(
        `lenno_global_avatar_${currentUser.id}`,
      );

      const resolvedAvatar =
        (fromLocalEdits && fromLocalEdits.trim()) ||
        (fromGlobalKey && fromGlobalKey.trim()) ||
        (fromSession && fromSession.trim()) ||
        "";

      setAvatarUrl(resolvedAvatar || null);
    } catch {
      setAvatarUrl(currentUser.profile?.avatar || null);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!actionFeedback) return;
    const timeout = setTimeout(() => setActionFeedback(null), 2600);
    return () => clearTimeout(timeout);
  }, [actionFeedback]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
    // Optionally fetch new data immediately
    // fetchDashboardData() // Uncomment if you want immediate fetch
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "payment_received":
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case "proposal_accepted":
        return <CheckCircle className="w-4 h-4 text-secondary-600" />;
      case "job_completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "job_posted":
        return <FileText className="w-4 h-4 text-primary-600" />;
      case "milestone_completed":
        return <CheckCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-primary-400" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="px-4 py-6 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-primary-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-primary-200 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-primary-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MobileLayout>
        <div className="px-4 py-6 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center p-8">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-error-600" />
            </div>
            <h2 className="text-xl font-semibold text-primary-900 mb-2">
              Dashboard Error
            </h2>
            <p className="text-primary-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={fetchDashboardData}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Retrying..." : "Try Again"}
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  if (currentUser?.userType === "FREELANCER") {
    const freelancerStats = [
      {
        label: "Total Earnings",
        value: `$${stats?.totalEarnings?.toFixed(2) || "0.00"}`,
        icon: DollarSign,
      },
      {
        label: "Pending Payments",
        value: `$${stats?.pendingPayments?.toFixed(2) || "0.00"}`,
        icon: Clock,
      },
      {
        label: "Completed Jobs",
        value: `${stats?.completedJobs || 0}`,
        icon: CheckCircle,
      },
      {
        label: "Active Projects",
        value: `${stats?.activeProjects || 0}`,
        icon: Briefcase,
      },
      {
        label: "Accepted Proposals",
        value: `${stats?.acceptedProposals || 0}`,
        icon: FileText,
      },
    ];

    const taskBoards = [
      {
        title: "Proposal Tasks",
        color: "bg-[#2f8edc]",
        count: 2,
        items: [
          {
            title: "Send follow-up on Product Designer proposal",
            description:
              "Share timeline clarification and portfolio examples to strengthen your bid.",
            date: "25 March",
            assignee: "PD",
            assigneeClass: "bg-[#e5ddff] text-[#5b5680]",
          },
          {
            title: "Prepare intro video for Mobile App job",
            description:
              "Record a concise 60-second pitch and attach it to proposal.",
            date: "10 April",
            assignee: "MA",
            assigneeClass: "bg-[#d9f1df] text-[#4b6353]",
          },
        ],
      },
      {
        title: "Project Tasks",
        color: "bg-[#28b6d4]",
        count: 2,
        items: [
          {
            title: "Deliver homepage redesign milestone",
            description:
              "Finalize responsive tweaks and submit assets for client review.",
            date: "15 March",
            assignee: "UI",
            assigneeClass: "bg-[#cfe9f5] text-[#3d6071]",
          },
          {
            title: "Upload sprint update and blockers",
            description:
              "Post progress summary in workspace before standup call.",
            date: "19 April",
            assignee: "SP",
            assigneeClass: "bg-[#f8d8e3] text-[#6b5563]",
          },
        ],
      },
      {
        title: "Payment Tasks",
        color: "bg-[#19b364]",
        count: 2,
        items: [
          {
            title: "Send invoice for Logo Design final delivery",
            description:
              "Attach source files and confirm payment terms before sending.",
            date: "17 April",
            assignee: "IV",
            assigneeClass: "bg-[#cfe9f5] text-[#3d6071]",
          },
          {
            title: "Follow up pending milestone release",
            description:
              "Message client and confirm release date for milestone 2.",
            date: "22 April",
            assignee: "PM",
            assigneeClass: "bg-[#e5ddff] text-[#5b5680]",
          },
        ],
      },
    ];

    const totalTaskCount = taskBoards.reduce(
      (count, board) => count + board.items.length,
      0,
    );

    const recentActivityColumns = [
      {
        title: "Applied Jobs",
        icon: BriefcaseIcon,
        items: [
          {
            avatar: "▶",
            avatarClass: "bg-[#e9ddff] text-[#7a3cff]",
            title: "UI/UX Designer",
            subtitle: "PixelFoundry Studio",
            badge: "Interview stage",
            badgeClass: "border-[#b8dfff] bg-[#e9f5ff] text-[#2f8edc]",
          },
          {
            avatar: "✹",
            avatarClass: "bg-[#ffe8d3] text-[#ff8a00]",
            title: "Mobile Developer",
            subtitle: "Nova Product Labs",
            badge: "Submitted",
            badgeClass: "border-[#d8dde6] bg-white text-[#6f7787]",
          },
          {
            avatar: "◉",
            avatarClass: "bg-[#dff0ff] text-[#2f8edc]",
            title: "Brand Designer",
            subtitle: "Wavelength Creative Co.",
            badge: "Awaiting response",
            badgeClass: "border-[#d8dde6] bg-white text-[#6f7787]",
          },
          {
            avatar: "▭",
            avatarClass: "bg-[#ffdfe5] text-[#e14b67]",
            title: "Marketing Designer",
            subtitle: "Orbit Commerce",
            badge: "Shortlisted",
            badgeClass: "border-[#e4c3ff] bg-[#f5ebff] text-[#9a58d0]",
          },
        ],
      },
      {
        title: "Active Projects",
        icon: ClipboardDocumentListIcon,
        items: [
          {
            avatar: "SL",
            avatarClass: "bg-[#c8f0d9] text-[#22303a]",
            title: "Landing Page Revamp",
            subtitle: "Aster Digital",
            badge: "In progress",
            badgeClass: "border-[#9de4b7] bg-[#e8f9f0] text-[#18a565]",
          },
          {
            avatar: "DA",
            avatarClass: "bg-[#f4dcc6] text-[#22303a]",
            title: "Design System Audit",
            subtitle: "Northwind Apps",
            badge: "Review",
            badgeClass: "border-[#ffd1ad] bg-[#fff2e8] text-[#dd7f2b]",
          },
          {
            avatar: "SL",
            avatarClass: "bg-[#f4eddc] text-[#22303a]",
            title: "E-commerce Banner Set",
            subtitle: "Wavelength Creative Co.",
            badge: "In progress",
            badgeClass: "border-[#9de4b7] bg-[#e8f9f0] text-[#18a565]",
          },
          {
            avatar: "HJ",
            avatarClass: "bg-[#f8d8e3] text-[#22303a]",
            title: "Analytics Dashboard UI",
            subtitle: "BluePeak Solutions",
            badge: "Blocked",
            badgeClass: "border-[#f3c2ca] bg-[#fff1f4] text-[#c74662]",
          },
        ],
      },
      {
        title: "Client Messages",
        icon: EnvelopeIcon,
        items: [
          {
            avatar: "SL",
            avatarClass: "bg-[#dec5f9] text-[#22303a]",
            title: "Riri Rora",
            subtitle: "Asked for updated timeline",
            badge: "1 unread",
            badgeClass: "border-[#d8dde6] bg-white text-[#6f7787]",
          },
          {
            avatar: "SL",
            avatarClass: "bg-[#f8d8e3] text-[#22303a]",
            title: "Jesse James",
            subtitle: "Sent feedback on draft",
            badge: "Replied",
            badgeClass: "border-[#d8dde6] bg-white text-[#6f7787]",
          },
          {
            avatar: "SL",
            avatarClass: "bg-[#bfe9e6] text-[#22303a]",
            title: "Sam Dan",
            subtitle: "Requested invoice copy",
            badge: "2 unread",
            badgeClass: "border-[#b8dfff] bg-[#e9f5ff] text-[#2f8edc]",
          },
          {
            avatar: "SL",
            avatarClass: "bg-[#c8d8f8] text-[#22303a]",
            title: "Harrison James",
            subtitle: "Approved milestone 1",
            badge: "Completed",
            badgeClass: "border-[#d8dde6] bg-white text-[#6f7787]",
          },
        ],
      },
    ];

    return (
      <MobileLayout>
        <div className="px-4 lg:px-6 py-4 space-y-4 bg-[#eef3fb] min-h-screen">
          {actionFeedback && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                actionFeedback.type === "success"
                  ? "border-[#b7dfc4] bg-[#f3fcf6] text-[#2d8a53]"
                  : "border-[#f1c9d0] bg-[#fff4f6] text-[#b6455f]"
              }`}
            >
              {actionFeedback.message}
            </div>
          )}

          <div className="rounded-3xl bg-gradient-to-r from-[#0a4abf] to-[#2563eb] p-4 lg:p-6 text-white shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Account avatar"
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full border border-white/30 object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-sm font-semibold">
                      {(
                        currentUser.firstName?.[0] ||
                        currentUser.username?.[0] ||
                        "L"
                      ).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-3 py-1.5 text-sm">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>
                    {currentDateTime.toLocaleDateString([], {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>

                <form
                  onSubmit={handleDashboardSearch}
                  className="hidden lg:flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 flex-1 max-w-[56%]"
                >
                  <MagnifyingGlassIcon className="w-4 h-4 text-white/90" />
                  <input
                    type="search"
                    value={dashboardSearch}
                    onChange={(e) => setDashboardSearch(e.target.value)}
                    placeholder="Search jobs, projects, clients or messages"
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/70 outline-none"
                  />
                </form>

                <div className="inline-flex items-center gap-2">
                  <div className="rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-3 py-1.5 text-sm text-white/90">
                    {currentDateTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="hidden lg:flex h-10 w-10 rounded-full border border-white/25 bg-white backdrop-blur-md items-center justify-center">
                    <NotificationBell />
                  </div>
                </div>
              </div>

              <div>
                <h1 className="text-xl lg:text-2xl font-medium">
                  Welcome, {currentUser.firstName || currentUser.username}.
                  Let&apos;s move your freelance work forward.
                </h1>
                <p className="text-white/80 mt-1 text-sm">
                  Track proposals, projects, payments, and client updates in one
                  place.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row items-end lg:justify-end">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full lg:w-auto lg:ml-auto lg:flex lg:justify-end items-end lg:gap-5 lg:overflow-x-auto no-scrollbar pb-1 pt-2 lg:pt-8">
                  {[
                    { label: "Find Jobs", icon: BriefcaseIcon },
                    { label: "New Proposal", icon: ClipboardDocumentListIcon },
                    { label: "Update Profile", icon: UserPlusIcon },
                    { label: "Client Messages", icon: EnvelopeIcon },
                    { label: "Request Payment", icon: UsersIcon },
                    { label: "Log Progress", icon: PencilSquareIcon },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={() =>
                        handleQuickAction(
                          action.label as
                            | "Find Jobs"
                            | "New Proposal"
                            | "Update Profile"
                            | "Client Messages"
                            | "Request Payment"
                            | "Log Progress",
                        )
                      }
                      className="p-0 flex flex-col items-center gap-2 cursor-pointer"
                    >
                      <span className="h-12 w-12 rounded-full border border-white/25 bg-white/10 backdrop-blur-md flex items-center justify-center">
                        <action.icon className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] text-center leading-tight">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {invoiceModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <button
                className="absolute inset-0 bg-[#0a4abf]/30"
                onClick={() => setInvoiceModalOpen(false)}
              />
              <div className="relative w-full max-w-md rounded-3xl border border-primary-200 bg-white p-4">
                <h3 className="text-lg font-semibold text-primary-900">
                  Request Payment (Invoice)
                </h3>
                <p className="mt-1 text-xs text-primary-600">
                  Create an invoice request for your client.
                </p>

                <div className="mt-3 space-y-3">
                  <input
                    value={invoiceForm.clientName}
                    onChange={(event) =>
                      setInvoiceForm((prev) => ({
                        ...prev,
                        clientName: event.target.value,
                      }))
                    }
                    placeholder="Client name"
                    className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none"
                  />
                  <input
                    value={invoiceForm.projectTitle}
                    onChange={(event) =>
                      setInvoiceForm((prev) => ({
                        ...prev,
                        projectTitle: event.target.value,
                      }))
                    }
                    placeholder="Project title"
                    className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none"
                  />
                  <input
                    type="number"
                    min={1}
                    value={invoiceForm.amount}
                    onChange={(event) =>
                      setInvoiceForm((prev) => ({
                        ...prev,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="Amount"
                    className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none"
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInvoiceModalOpen(false)}
                    className="rounded-full border border-primary-200 px-4 py-2 text-sm text-primary-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitInvoiceRequest}
                    className="rounded-full bg-[#abff31] px-4 py-2 text-sm font-medium text-primary-900 hover:bg-[#9ae62c]"
                  >
                    Submit invoice
                  </button>
                </div>
              </div>
            </div>
          )}

          {progressModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <button
                className="absolute inset-0 bg-[#0a4abf]/30"
                onClick={() => setProgressModalOpen(false)}
              />
              <div className="relative w-full max-w-md rounded-3xl border border-primary-200 bg-white p-4">
                <h3 className="text-lg font-semibold text-primary-900">
                  Log Progress
                </h3>
                <p className="mt-1 text-xs text-primary-600">
                  Save your project progress update.
                </p>

                <div className="mt-3 space-y-3">
                  <input
                    value={progressForm.projectTitle}
                    onChange={(event) =>
                      setProgressForm((prev) => ({
                        ...prev,
                        projectTitle: event.target.value,
                      }))
                    }
                    placeholder="Project title"
                    className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none"
                  />
                  <textarea
                    value={progressForm.update}
                    onChange={(event) =>
                      setProgressForm((prev) => ({
                        ...prev,
                        update: event.target.value,
                      }))
                    }
                    placeholder="Progress update"
                    className="w-full min-h-[90px] rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none"
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setProgressModalOpen(false)}
                    className="rounded-full border border-primary-200 px-4 py-2 text-sm text-primary-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitProgressLog}
                    className="rounded-full bg-[#abff31] px-4 py-2 text-sm font-medium text-primary-900 hover:bg-[#9ae62c]"
                  >
                    Save progress
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            {freelancerStats.map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <p className="text-3xl font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#dfe8f5] rounded-2xl p-1 pb-4">
            <h2 className="text-2xl font-medium text-slate-800 px-2 pb-5 pt-2">
              Recent Activity
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
              {recentActivityColumns.map((column) => (
                <div
                  key={column.title}
                  className="bg-[#f3f6fb] rounded-3xl border border-[#d8e2f1] p-2 pb-4"
                >
                  <div className="flex items-center justify-between rounded-full bg-[#f7f9fc] border border-[#dce5f1] px-4 py-2">
                    <div className="inline-flex items-center gap-2 text-slate-800">
                      <column.icon className="w-5 h-5 text-slate-600" />
                      <h3 className="text-lg font-medium text-slate-800 leading-none">
                        {column.title}
                      </h3>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="mt-3 space-y-2">
                    {column.items.map((item) => (
                      <div
                        key={`${column.title}-${item.title}-${item.subtitle}`}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-10 w-10 rounded-sm flex items-center justify-center text-base font-medium ${item.avatarClass}`}
                          >
                            {item.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-md font-medium text-slate-800 truncate leading-none">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate mt-1 leading-none">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-2 pl-2 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-medium whitespace-nowrap ${item.badgeClass}`}
                          >
                            {item.badge}
                          </span>
                          <button className="text-slate-500 hover:text-slate-700">
                            <EllipsisVerticalIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#e9f7ee] rounded-2xl border border-[#c8e8d3] p-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-2xl font-semibold text-slate-800">
                My Tasks
              </h2>
              <span className="inline-flex items-center rounded-full border border-[#b7dfc4] bg-[#f3fcf6] px-3 py-1 text-xs font-medium text-[#2d8a53]">
                {totalTaskCount} active tasks
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {taskBoards.map((group) => (
                <div
                  key={group.title}
                  className="bg-[#f4fbf6] rounded-3xl border border-[#cfead9] p-2"
                >
                  <div className="flex items-center justify-between rounded-full bg-[#f8fdf9] border border-[#d8efdf] px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${group.color}`}
                      />
                      <h3 className="font-medium text-slate-800">
                        {group.title}
                      </h3>
                      <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-[#e2f4e8] px-1.5 text-xs text-[#2d8a53]">
                        {group.count}
                      </span>
                    </div>
                    <button className="h-6 w-6 rounded-full bg-white border border-[#cde7d7] flex items-center justify-center text-[#2d8a53] hover:text-[#1f6f42]">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {group.items.map((task) => (
                      <div
                        key={`${group.title}-${task.title}`}
                        className="rounded-2xl border border-[#d9ebdf] bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900 leading-snug">
                            {task.title}
                          </p>
                          <button className="text-slate-400 hover:text-slate-600">
                            <EllipsisVerticalIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          {task.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between border-t border-[#e7f2eb] pt-2.5">
                          <div className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                            <CalendarDaysIcon className="w-4 h-4 text-slate-500" />
                            <span>{task.date}</span>
                          </div>
                          <span
                            className={`h-7 w-7 rounded-full text-xs font-medium flex items-center justify-center ${task.assigneeClass}`}
                          >
                            {task.assignee}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header with Welcome */}
        <div className="space-y-4">
          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl p-6 border border-secondary-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary-600 to-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {currentUser?.username?.[0]?.toUpperCase() ?? "L"}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Welcome to Lenno, @{currentUser?.username}! 👋
                </h2>
                <p className="text-sm text-gray-600">
                  {currentUser?.userType === "CLIENT"
                    ? "Ready to find amazing talent?"
                    : "Ready to earn with your skills?"}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {currentUser?.userType === "CLIENT" ? (
                <>
                  <Button
                    size="sm"
                    className="accent-gradient text-white hover:opacity-90"
                    onClick={() => (window.location.href = "/jobs")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Post a Job
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/proposals")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Proposals
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    className="accent-gradient text-white hover:opacity-90"
                    onClick={() => (window.location.href = "/jobs")}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Find Jobs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/profile")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Complete Profile
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Beta Waitlist Notice */}
          <div className="bg-gradient-to-r from-accent-50 to-warning-50 rounded-xl p-6 border border-accent-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-warning-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🚀 Welcome to Lenno Beta!
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  You&apos;re among the first users to experience our freelance
                  marketplace. We&apos;re currently in beta testing phase, and
                  your feedback is invaluable!
                </p>
                <div className="bg-white rounded-lg p-4 border border-accent-200 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    What&apos;s Coming Soon:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Full payment integration</li>
                    <li>• Advanced matching algorithms</li>
                    <li>• Milestone-based project management</li>
                    <li>• Reputation system</li>
                    <li>• Multi-language support</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-accent-500 to-warning-500 text-white hover:opacity-90"
                    onClick={() =>
                      window.open("https://forms.gle/beta-feedback", "_blank")
                    }
                  >
                    Share Feedback
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open("https://t.me/lenno_community", "_blank")
                    }
                  >
                    Join Community
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">
                Your Analytics
              </h1>
              <p className="text-sm text-primary-600 mt-1">
                {currentUser?.userType === "CLIENT"
                  ? "Track your project performance"
                  : "Monitor your freelance progress"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-primary-400" />
              <button
                onClick={() => Auth.signOut()}
                aria-label="Sign out"
                className="w-10 h-10 bg-green-600 rounded-md flex items-center justify-center text-white hover:bg-green-700"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex space-x-1 bg-primary-100 rounded-xl p-1">
            {[
              { key: "week" as TimeRange, label: "Week" },
              { key: "month" as TimeRange, label: "Month" },
              { key: "year" as TimeRange, label: "Year" },
            ].map((range) => (
              <button
                key={range.key}
                onClick={() => handleTimeRangeChange(range.key)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  timeRange === range.key
                    ? "bg-white text-primary-900 shadow-sm"
                    : "text-primary-600 hover:text-primary-900"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card className="text-center">
                <div className="space-y-2">
                  <FileText className="w-8 h-8 text-secondary-600 mx-auto" />
                  <div className="text-2xl font-bold text-primary-900">
                    {stats?.totalJobs || 0}
                  </div>
                  <div className="text-sm text-primary-600">Jobs Posted</div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="text-center">
                <div className="space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                  <div className="text-2xl font-bold text-primary-900">
                    {stats?.acceptedProposals || 0}
                  </div>
                  <div className="text-sm text-primary-600">Proposals</div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="text-center">
                <div className="space-y-2">
                  <User className="w-8 h-8 text-primary-600 mx-auto" />
                  <div className="text-2xl font-bold text-primary-900">
                    {stats?.activeProjects || 0}
                  </div>
                  <div className="text-sm text-primary-600">Active</div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="text-center">
                <div className="space-y-2">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto" />
                  <div className="text-2xl font-bold text-primary-900">
                    {"$" + (stats?.totalEarnings?.toFixed(2) || "0.00")}
                  </div>
                  <div className="text-sm text-primary-600">Spent</div>
                </div>
              </Card>
            </motion.div>
          </>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-900">
                Recent Activity
              </h3>
              <Calendar className="w-6 h-6 text-primary-400" />
            </div>

            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors duration-200"
                  >
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-primary-900 truncate">
                          {activity.title}
                        </p>
                        {activity.amount && (
                          <span className="text-sm font-semibold text-green-600">
                            {"$" + activity.amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-primary-600 truncate">
                          {activity.description}
                        </p>
                        <span className="text-xs text-primary-400">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                  <p className="text-sm text-primary-600">No recent activity</p>
                </div>
              )}
            </div>

            {recentActivity.length > 0 && (
              <div className="mt-4 pt-4 border-t border-primary-200">
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-4"
        >
          <>
            <Button
              onClick={() => (window.location.href = "/jobs/post")}
              className="h-12"
            >
              Post a Job
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/proposals")}
              className="h-12"
            >
              View Proposals
            </Button>
          </>
        </motion.div>
      </div>
    </MobileLayout>
  );
}

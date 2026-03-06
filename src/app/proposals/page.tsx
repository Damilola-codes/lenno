"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ClockIcon,
  MapPinIcon,
  PencilSquareIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import MobileLayout from "@/components/layout/MobileLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { formatCurrency, formatTimeAgo, truncateText } from "@/library/utils";

type ProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED";

interface JobOption {
  id: string;
  title: string;
  budget: number;
  isHourly: boolean;
  duration?: string;
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
    profile?: { location?: string };
  };
  skills: Array<{ id: string; name: string }>;
}

interface ProposalRecord {
  id: string;
  coverLetter: string;
  proposedRate: number;
  duration?: string | null;
  status: ProposalStatus;
  createdAt: string;
  job: JobOption;
}

const proposalCardColors = [
  "bg-[#f6e0cf]",
  "bg-[#d0efe8]",
  "bg-[#e2dcf8]",
  "bg-[#d7eaf8]",
  "bg-[#f2dcef]",
  "bg-[#e8edf3]",
];

export default function ProposalsPage() {
  const searchParams = useSearchParams();
  const selectedJobIdFromUrl = searchParams.get("jobId");

  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [duration, setDuration] = useState("");
  const [editingProposalId, setEditingProposalId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedJob = useMemo(
    () => jobs.find((item) => item.id === selectedJobId) || null,
    [jobs, selectedJobId],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [jobsResponse, proposalsResponse] = await Promise.all([
        fetch("/api/jobs?limit=24", { cache: "no-store" }),
        fetch("/api/proposals?mine=1", {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      if (jobsResponse.ok) {
        const jobsData = (await jobsResponse.json()) as { jobs?: JobOption[] };
        setJobs(Array.isArray(jobsData.jobs) ? jobsData.jobs : []);
      }

      if (proposalsResponse.ok) {
        const proposalData = (await proposalsResponse.json()) as {
          proposals?: ProposalRecord[];
        };
        setProposals(
          Array.isArray(proposalData.proposals) ? proposalData.proposals : [],
        );
      }
    } catch {
      setError("Unable to load proposal data right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedJobIdFromUrl || jobs.length === 0) return;
    const exists = jobs.some((item) => item.id === selectedJobIdFromUrl);
    if (exists) {
      setSelectedJobId(selectedJobIdFromUrl);
      const preset = jobs.find((item) => item.id === selectedJobIdFromUrl);
      if (preset) {
        setProposedRate(String(preset.budget));
      }
    }
  }, [selectedJobIdFromUrl, jobs]);

  const proposalCounts = useMemo(() => {
    return {
      submitted: proposals.length,
      accepted: proposals.filter((item) => item.status === "ACCEPTED").length,
      pending: proposals.filter((item) => item.status === "PENDING").length,
      rejected: proposals.filter((item) => item.status === "REJECTED").length,
    };
  }, [proposals]);

  const handleSelectJob = (job: JobOption) => {
    if (editingProposalId) {
      setEditingProposalId(null);
      setCoverLetter("");
      setDuration("");
    }
    setSelectedJobId(job.id);
    setProposedRate(String(job.budget));
    setSuccess("");
    setError("");
  };

  const handleStartEdit = (proposal: ProposalRecord) => {
    setEditingProposalId(proposal.id);
    setSelectedJobId(proposal.job.id);
    setCoverLetter(proposal.coverLetter);
    setProposedRate(String(proposal.proposedRate));
    setDuration(proposal.duration || "");
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingProposalId(null);
    setCoverLetter("");
    setDuration("");
    if (selectedJob) {
      setProposedRate(String(selectedJob.budget));
    }
    setError("");
  };

  const handleSubmitProposal = async () => {
    if (!selectedJobId) {
      setError("Select a job to apply for.");
      return;
    }

    const rate = Number(proposedRate);
    if (!Number.isFinite(rate) || rate <= 0) {
      setError("Enter a valid proposed rate.");
      return;
    }

    if (coverLetter.trim().length < 50) {
      setError("Proposal message must be at least 50 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        editingProposalId
          ? `/api/proposals/${editingProposalId}`
          : `/api/jobs/${selectedJobId}/proposals`,
        {
          method: editingProposalId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            coverLetter: coverLetter.trim(),
            proposedRate: rate,
            duration: duration.trim() || undefined,
          }),
        },
      );

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "Unable to submit proposal.");
        return;
      }

      setSuccess(
        editingProposalId
          ? "Proposal updated successfully."
          : "Proposal submitted successfully.",
      );
      setEditingProposalId(null);
      setCoverLetter("");
      setDuration("");
      await loadData();
    } catch {
      setError("Unable to submit proposal right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadgeClass = (status: ProposalStatus) => {
    if (status === "ACCEPTED")
      return "bg-[#ecf9ef] border-[#cde9d4] text-[#2e7b4d]";
    if (status === "REJECTED")
      return "bg-[#fff1f2] border-[#fecdd3] text-[#be123c]";
    return "bg-[#eef3ff] border-[#dbe7ff] text-[#0a4abf]";
  };

  return (
    <MobileLayout>
      <div className="px-3 sm:px-4 lg:px-6 py-4 bg-[#f5f7fb] min-h-screen">
        <div className="max-w-[1300px] mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary-900">
              Proposals
            </h1>
            <div className="inline-flex items-center gap-2 text-sm text-primary-700">
              <span className="rounded-full border border-primary-200 bg-white px-3 py-1">
                Submitted: {proposalCounts.submitted}
              </span>
              <span className="rounded-full border border-[#cde9d4] bg-[#ecf9ef] px-3 py-1 text-[#2e7b4d]">
                Accepted: {proposalCounts.accepted}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,1fr] gap-4">
            <div className="rounded-3xl border border-primary-200 bg-white p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <PencilSquareIcon className="w-5 h-5 text-[#0a4abf]" />
                <h2 className="text-lg font-semibold text-primary-900">
                  {editingProposalId
                    ? "Edit pending proposal"
                    : "Write proposal for job application"}
                </h2>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-primary-600">Select job</label>
                <select
                  value={selectedJobId}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    setSelectedJobId(nextId);
                    const nextJob = jobs.find((item) => item.id === nextId);
                    if (nextJob) setProposedRate(String(nextJob.budget));
                  }}
                  disabled={Boolean(editingProposalId)}
                  className="ios-input-safe w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
                >
                  <option value="">Choose a job</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-primary-600">
                    Proposed rate (
                    {selectedJob?.isHourly ? "per hour" : "total"})
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={proposedRate}
                    onChange={(event) => setProposedRate(event.target.value)}
                    className="ios-input-safe w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-primary-600">Duration</label>
                  <input
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    className="ios-input-safe w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
                    placeholder="e.g. 2 weeks"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-primary-600">
                  Proposal message
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(event) => setCoverLetter(event.target.value)}
                  className="ios-input-safe w-full min-h-[130px] rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
                  placeholder="Write a tailored proposal explaining your approach and why you're a strong fit."
                />
                <p className="text-xs text-primary-500">
                  {coverLetter.length}/1000
                </p>
              </div>

              {error && <p className="text-xs text-[#be123c]">{error}</p>}
              {success && <p className="text-xs text-[#2e7b4d]">{success}</p>}

              <Button
                onClick={handleSubmitProposal}
                className="rounded-full bg-[#0a4abf] text-white hover:bg-[#093e9f]"
                disabled={submitting || loading}
              >
                {submitting
                  ? editingProposalId
                    ? "Saving..."
                    : "Submitting..."
                  : editingProposalId
                    ? "Save changes"
                    : "Submit proposal"}
              </Button>
              {editingProposalId && (
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="rounded-full"
                >
                  Cancel edit
                </Button>
              )}
            </div>

            <div className="rounded-3xl border border-primary-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary-900">
                  Open jobs to apply
                </h2>
                <Link
                  href="/jobs"
                  className="text-sm text-[#0a4abf] underline underline-offset-4"
                >
                  Browse all
                </Link>
              </div>

              <div className="mt-3 space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {jobs.length === 0 ? (
                  <p className="text-sm text-primary-600">
                    No open jobs available right now.
                  </p>
                ) : (
                  jobs.slice(0, 8).map((job, index) => (
                    <Card
                      key={job.id}
                      className="p-2 overflow-hidden border border-primary-200"
                    >
                      <div
                        className={`p-4 rounded-2xl ${proposalCardColors[index % proposalCardColors.length]}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-primary-700">
                            {formatTimeAgo(job.createdAt)}
                          </span>
                          <span className="h-10 w-10 rounded-full bg-[#0a4abf] text-white text-sm font-semibold flex items-center justify-center">
                            {(job.client.firstName?.[0] || "C").toUpperCase()}
                          </span>
                        </div>

                        <p className="mt-4 text-sm text-primary-700">
                          {job.client.firstName || "Client"}
                        </p>
                        <h3 className="text-2xl font-semibold text-primary-900 leading-tight mt-1">
                          {truncateText(job.title, 38)}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {job.skills.slice(0, 4).map((skill) => (
                            <span
                              key={`${job.id}-${skill.id}`}
                              className="inline-flex items-center rounded-full border border-primary-300 px-2.5 py-1 text-xs text-primary-700"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary-700">
                          <MapPinIcon className="w-4 h-4" />
                          <span>
                            {job.client.profile?.location || "Remote"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 flex items-end justify-between">
                        <p className="text-2xl font-bold text-primary-900">
                          {formatCurrency(job.budget)}
                          <span className="text-sm font-medium text-primary-600">
                            {job.isHourly ? "/hr" : ""}
                          </span>
                        </p>
                        <Button
                          size="sm"
                          className="rounded-full bg-[#abff31] text-primary-900 hover:bg-[#9ae62c]"
                          onClick={() => handleSelectJob(job)}
                        >
                          Apply
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-primary-200 bg-white p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-primary-900">
              My submitted proposals
            </h2>

            {loading ? (
              <p className="mt-3 text-sm text-primary-600">
                Loading proposals...
              </p>
            ) : proposals.length === 0 ? (
              <p className="mt-3 text-sm text-primary-600">
                No proposals submitted yet. Pick a job above and send your first
                application.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {proposals.map((proposal, index) => (
                  <Card
                    key={proposal.id}
                    className="p-2 overflow-hidden border border-primary-200"
                  >
                    <div
                      className={`p-4 rounded-2xl ${proposalCardColors[index % proposalCardColors.length]}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-primary-700">
                          <ClockIcon className="mr-1 h-3.5 w-3.5" />
                          {formatTimeAgo(proposal.createdAt)}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
                            proposal.status,
                          )}`}
                        >
                          {proposal.status}
                        </span>
                      </div>

                      <p className="mt-4 text-sm text-primary-700">
                        {proposal.job.client.firstName || "Client"}
                      </p>
                      <h3 className="text-2xl font-semibold text-primary-900 leading-tight mt-1">
                        {truncateText(proposal.job.title, 38)}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {proposal.job.skills.slice(0, 3).map((skill) => (
                          <span
                            key={`${proposal.id}-${skill.id}`}
                            className="inline-flex items-center rounded-full border border-primary-300 px-2.5 py-1 text-xs text-primary-700"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>

                      <p className="mt-3 text-xs text-primary-700 leading-relaxed">
                        {truncateText(proposal.coverLetter, 140)}
                      </p>

                      <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary-700">
                        <MapPinIcon className="w-4 h-4" />
                        <span>
                          {proposal.job.client.profile?.location || "Remote"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-xl font-bold text-primary-900">
                          {formatCurrency(proposal.proposedRate)}
                          <span className="text-sm font-medium text-primary-600">
                            {proposal.job.isHourly ? "/hr" : ""}
                          </span>
                        </p>
                        <p className="text-xs text-primary-600">
                          {proposal.duration || "Duration not specified"}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-primary-700">
                        <StarIcon className="h-4 w-4" />
                        {proposal.status === "ACCEPTED"
                          ? "Accepted"
                          : proposal.status === "REJECTED"
                            ? "Closed"
                            : "In review"}
                      </span>
                      {proposal.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => handleStartEdit(proposal)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 sm:gap-3 text-sm">
            <Link
              href="/jobs"
              className="text-[#0a4abf] font-medium underline underline-offset-4"
            >
              Search for jobs
            </Link>
            <span className="text-primary-300 hidden sm:inline">|</span>
            <Link
              href="/profile"
              className="text-[#2e7b4d] font-medium underline underline-offset-4"
            >
              Manage your profile
            </Link>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

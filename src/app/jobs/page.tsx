"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { motion } from "framer-motion";
import {
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import MobileLayout from "@/components/layout/MobileLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  cn,
  formatCurrency,
  formatTimeAgo,
  truncateText,
} from "@/library/utils";
import JobDetailsView, {
  type JobDetailsData,
  type JobSideCard,
} from "@/components/jobs/JobDetailsView";

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  isHourly: boolean;
  duration?: string;
  createdAt: string;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED";
  client: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profile?: {
      avatar?: string;
      location?: string;
    };
  };
  skills: Array<{
    id: string;
    name: string;
  }>;
  _count: {
    proposals: number;
  };
}

type SortBy = "latest" | "budget-high" | "budget-low";

const workScheduleOptions = [
  { value: "full-time", label: "Full time" },
  { value: "part-time", label: "Part time" },
  { value: "internship", label: "Internship" },
  { value: "project-work", label: "Project work" },
  { value: "volunteering", label: "Volunteering" },
];

const employmentTypeOptions = [
  { value: "freelance", label: "Freelance" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
  { value: "permanent", label: "Permanent" },
];

const cardColorSets = [
  "bg-[#f6e0cf]",
  "bg-[#d0efe8]",
  "bg-[#e2dcf8]",
  "bg-[#d7eaf8]",
  "bg-[#f2dcef]",
  "bg-[#e8edf3]",
];

const dummyJobs: Job[] = [
  {
    id: "dummy-1",
    title: "Senior UI/UX Designer",
    description:
      "Design user flows, wireframes, and final UI components for a fintech dashboard project.",
    budget: 250,
    isHourly: true,
    duration: "Part time",
    createdAt: "2026-03-04T12:00:00.000Z",
    status: "OPEN",
    client: {
      id: "client-1",
      firstName: "Amazon",
      lastName: "Team",
      username: "amazon",
      profile: { location: "San Francisco, CA" },
    },
    skills: [
      { id: "s-1", name: "Part time" },
      { id: "s-2", name: "Senior level" },
      { id: "s-3", name: "Remote" },
      { id: "s-4", name: "Project work" },
    ],
    _count: { proposals: 18 },
  },
  {
    id: "dummy-2",
    title: "Junior UI/UX Designer",
    description:
      "Assist with design QA, responsive layouts, and component updates for a product redesign.",
    budget: 150,
    isHourly: true,
    duration: "Full time",
    createdAt: "2026-03-03T08:30:00.000Z",
    status: "OPEN",
    client: {
      id: "client-2",
      firstName: "Google",
      lastName: "Studio",
      username: "google",
      profile: { location: "California, CA" },
    },
    skills: [
      { id: "s-5", name: "Full time" },
      { id: "s-6", name: "Junior level" },
      { id: "s-7", name: "Remote" },
      { id: "s-8", name: "Flexible" },
    ],
    _count: { proposals: 25 },
  },
  {
    id: "dummy-3",
    title: "Senior Motion Designer",
    description:
      "Create campaign motion assets and short-form product animations for social and web.",
    budget: 260,
    isHourly: true,
    duration: "Part time",
    createdAt: "2026-03-02T14:15:00.000Z",
    status: "OPEN",
    client: {
      id: "client-3",
      firstName: "Dribbble",
      lastName: "Agency",
      username: "dribbble",
      profile: { location: "New York, NY" },
    },
    skills: [
      { id: "s-9", name: "Part time" },
      { id: "s-10", name: "Senior level" },
      { id: "s-11", name: "Full day" },
      { id: "s-12", name: "Shift work" },
    ],
    _count: { proposals: 12 },
  },
  {
    id: "dummy-4",
    title: "UX Designer",
    description:
      "Run usability audits and improve conversion funnels for a SaaS onboarding flow.",
    budget: 220,
    isHourly: true,
    duration: "Contract",
    createdAt: "2026-03-01T16:40:00.000Z",
    status: "OPEN",
    client: {
      id: "client-4",
      firstName: "Twitter",
      lastName: "Labs",
      username: "twitter",
      profile: { location: "Austin, TX" },
    },
    skills: [
      { id: "s-13", name: "Contract" },
      { id: "s-14", name: "Mid level" },
      { id: "s-15", name: "Remote" },
    ],
    _count: { proposals: 9 },
  },
  {
    id: "dummy-5",
    title: "Graphic Designer",
    description:
      "Design social media templates and branding collateral for a travel startup.",
    budget: 190,
    isHourly: true,
    duration: "Temporary",
    createdAt: "2026-02-28T10:00:00.000Z",
    status: "OPEN",
    client: {
      id: "client-5",
      firstName: "Airbnb",
      lastName: "Creative",
      username: "airbnb",
      profile: { location: "Los Angeles, CA" },
    },
    skills: [
      { id: "s-16", name: "Temporary" },
      { id: "s-17", name: "Project work" },
      { id: "s-18", name: "Remote" },
    ],
    _count: { proposals: 14 },
  },
  {
    id: "dummy-6",
    title: "Graphic Designer",
    description:
      "Produce ad creatives and campaign assets for product launch and retention campaigns.",
    budget: 210,
    isHourly: true,
    duration: "Full time",
    createdAt: "2026-02-27T09:00:00.000Z",
    status: "OPEN",
    client: {
      id: "client-6",
      firstName: "Apple",
      lastName: "Marketing",
      username: "apple",
      profile: { location: "Seattle, WA" },
    },
    skills: [
      { id: "s-19", name: "Full time" },
      { id: "s-20", name: "Design" },
      { id: "s-21", name: "Remote" },
    ],
    _count: { proposals: 20 },
  },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("latest");
  const [salaryPoints, setSalaryPoints] = useState({ a: 1200, b: 2000 });
  const [filters, setFilters] = useState({
    jobType: "all",
    skills: [] as string[],
    workSchedule: [] as string[],
    employmentType: [] as string[],
  });

  const activeFilterCount =
    (filters.jobType !== "all" ? 1 : 0) +
    filters.workSchedule.length +
    filters.employmentType.length;

  const salaryMin = Math.min(salaryPoints.a, salaryPoints.b);
  const salaryMax = Math.max(salaryPoints.a, salaryPoints.b);

  const toggleMultiSelectFilter = (
    filterName: "workSchedule" | "employmentType",
    value: string,
  ) => {
    setFilters((prev) => {
      const currentValues = prev[filterName];
      const exists = currentValues.includes(value);

      return {
        ...prev,
        [filterName]: exists
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const inferWorkSchedule = (job: Job): string => {
    const normalizedText =
      `${job.duration || ""} ${job.description}`.toLowerCase();

    if (
      normalizedText.includes("full time") ||
      normalizedText.includes("full-time")
    ) {
      return "full-time";
    }

    if (
      normalizedText.includes("part time") ||
      normalizedText.includes("part-time")
    ) {
      return "part-time";
    }

    if (normalizedText.includes("intern")) {
      return "internship";
    }

    if (normalizedText.includes("volunteer")) {
      return "volunteering";
    }

    if (
      normalizedText.includes("project") ||
      normalizedText.includes("contract")
    ) {
      return "project-work";
    }

    return job.isHourly ? "part-time" : "full-time";
  };

  const inferEmploymentType = (job: Job): string => {
    const normalizedText =
      `${job.duration || ""} ${job.description}`.toLowerCase();

    if (normalizedText.includes("permanent")) return "permanent";
    if (
      normalizedText.includes("temporary") ||
      normalizedText.includes("temp")
    ) {
      return "temporary";
    }
    if (normalizedText.includes("contract")) return "contract";

    return "freelance";
  };

  const fetchJobs = useCallback(
    async (searchTerm: string = "") => {
      try {
        if (jobs.length === 0) {
          setLoading(true);
        } else {
          setSearchLoading(true);
        }

        const queryParams = new URLSearchParams({
          page: "1",
          limit: "24",
          ...(searchTerm && { search: searchTerm }),
          minBudget: String(salaryMin),
          maxBudget: String(salaryMax),
          ...(filters.jobType !== "all" && { jobType: filters.jobType }),
          ...(filters.skills.length > 0 && {
            skills: filters.skills.join(","),
          }),
        });

        const response = await fetch(`/api/jobs?${queryParams}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch jobs");
        }

        const jobsData = data.jobs || [];
        setJobs(jobsData.length > 0 ? jobsData : dummyJobs);
        setFetchError(null);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs(dummyJobs);
        setFetchError(null);
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [filters, jobs.length, salaryMin, salaryMax],
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const sortedFilteredJobs = useMemo(() => {
    const filteredJobs = jobs.filter((job) => {
      if (
        filters.workSchedule.length > 0 &&
        !filters.workSchedule.includes(inferWorkSchedule(job))
      ) {
        return false;
      }

      if (
        filters.employmentType.length > 0 &&
        !filters.employmentType.includes(inferEmploymentType(job))
      ) {
        return false;
      }

      return true;
    });

    const sortedJobs = [...filteredJobs];

    if (sortBy === "budget-high") {
      sortedJobs.sort(
        (firstJob, secondJob) => secondJob.budget - firstJob.budget,
      );
    }

    if (sortBy === "budget-low") {
      sortedJobs.sort(
        (firstJob, secondJob) => firstJob.budget - secondJob.budget,
      );
    }

    if (sortBy === "latest") {
      sortedJobs.sort(
        (firstJob, secondJob) =>
          new Date(secondJob.createdAt).getTime() -
          new Date(firstJob.createdAt).getTime(),
      );
    }

    return sortedJobs;
  }, [jobs, filters.workSchedule, filters.employmentType, sortBy]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchJobs(searchQuery.trim());
  };

  const clearFilters = () => {
    setFilters({
      jobType: "all",
      skills: [],
      workSchedule: [],
      employmentType: [],
    });
    setSearchQuery("");
    setSortBy("latest");
    setSalaryPoints({ a: 1200, b: 2000 });
  };

  const applyFilters = () => {
    setShowFilters(false);
    fetchJobs(searchQuery.trim());
  };

  const noResultMessage =
    activeFilterCount > 0 || searchQuery.trim().length > 0
      ? "No jobs match your current filters. Try broadening your search criteria."
      : "There are no open jobs at the moment. Check back soon for new opportunities.";

  const formatSalaryDisplay = `$${salaryMin}-$${salaryMax}`;

  const buildSideCard = useCallback((job: Job): JobSideCard => {
    return {
      id: job.id,
      title: job.title,
      company: job.client.firstName || "Client",
      location: job.client.profile?.location || "Remote",
      tags: job.skills.slice(0, 3).map((skill) => skill.name),
      postedText: formatTimeAgo(job.createdAt),
      applicantsText: `${job._count.proposals} Applicants`,
    };
  }, []);

  const selectedJobDetails = useMemo<JobDetailsData | null>(() => {
    if (!selectedJob) return null;

    const similarJobs = sortedFilteredJobs
      .filter((job) => job.id !== selectedJob.id)
      .slice(0, 3)
      .map(buildSideCard);

    const otherJobsFromCompany = sortedFilteredJobs
      .filter(
        (job) =>
          job.client.firstName === selectedJob.client.firstName &&
          job.id !== selectedJob.id,
      )
      .slice(0, 2)
      .map(buildSideCard);

    return {
      id: selectedJob.id,
      title: selectedJob.title,
      company:
        `${selectedJob.client.firstName} ${selectedJob.client.lastName}`.trim(),
      location: selectedJob.client.profile?.location || "Remote",
      tags: selectedJob.skills.length
        ? selectedJob.skills.slice(0, 4).map((skill) => skill.name)
        : [selectedJob.isHourly ? "Hourly" : "Fixed", "Remote"],
      about:
        selectedJob.description ||
        "This role focuses on delivering high-quality work, collaborating with stakeholders, and shipping measurable outcomes.",
      qualifications: [
        "At least 2+ years of relevant practical experience.",
        "Strong communication and collaboration skills.",
        "Ability to deliver quality work on timeline.",
        "Experience with modern product workflows and tools.",
      ],
      responsibilities: [
        "Work closely with stakeholders to define clear deliverables.",
        "Execute tasks and provide progress updates consistently.",
        "Ensure quality through iteration and feedback loops.",
        "Document outcomes and handoff assets where required.",
      ],
      attachments: [
        { id: "att-1", name: "Role_Brief.pdf", subtitle: "Job brief" },
        { id: "att-2", name: "Requirements.pdf", subtitle: "Requirements" },
        { id: "att-3", name: "Scope.pdf", subtitle: "Scope and deliverables" },
      ],
      similarJobs,
      otherJobsFromCompany,
    };
  }, [selectedJob, sortedFilteredJobs, buildSideCard]);

  return (
    <MobileLayout>
      <div className="px-4 lg:px-6 py-4 space-y-4 bg-[#f5f7fb] min-h-screen">
        <form
          onSubmit={handleSearch}
          className="rounded-xl bg-gradient-to-r from-[#0a4abf] via-[#0f5cd8] to-[#1c7be6] text-white p-3 lg:p-4"
        >
          <div className="flex items-stretch overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-3 px-3 py-2 border-r border-white/20 min-w-[220px] lg:min-w-[300px]">
              <div className="h-9 p-2 w-9 rounded-full border border-white/25 flex items-center justify-center">
                <MagnifyingGlassIcon className="w-5 h-5 text-white/80" />
              </div>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Designer"
                className="w-full bg-transparent text-sm placeholder:text-white/70 outline-none"
              />
              <ChevronDownIcon className="w-4 h-4 text-white/70" />
            </div>

            <div className="flex items-center gap-3 px-3 py-2 border-r border-white/20 text-white/80 min-w-[200px] lg:min-w-[240px]">
              <div className="h-9 w-9 rounded-full border border-white/25 flex items-center justify-center">
                <MapPinIcon className="w-5 h-5" />
              </div>
              <span className="text-sm">Work location</span>
              <ChevronDownIcon className="w-4 h-4 ml-auto" />
            </div>

            <div className="flex items-center gap-3 px-3 py-2 border-r border-white/20 text-white/80 min-w-[190px] lg:min-w-[220px]">
              <div className="h-9 w-9 rounded-full border border-white/25 flex items-center justify-center">
                <BriefcaseIcon className="w-5 h-5" />
              </div>
              <span className="text-sm">Experience</span>
              <ChevronDownIcon className="w-4 h-4 ml-auto" />
            </div>

            <div className="flex flex-col justify-center px-3 py-2 min-w-[260px] lg:min-w-[320px]">
              <div className="flex items-center justify-between text-sm text-white/90">
                <span>Salary range</span>
                <span>{formatSalaryDisplay}</span>
              </div>
              <div className="mt-2">
                <div className="relative h-8">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-white/30" />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-[#9de86f]"
                    style={{
                      left: `${((salaryMin - 100) / (5000 - 100)) * 100}%`,
                      width: `${((salaryMax - salaryMin) / (5000 - 100)) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={100}
                    max={5000}
                    value={salaryPoints.a}
                    onChange={(event) =>
                      setSalaryPoints((prev) => ({
                        ...prev,
                        a: Number(event.target.value),
                      }))
                    }
                    className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto accent-[#9de86f]"
                  />
                  <input
                    type="range"
                    min={100}
                    max={5000}
                    value={salaryPoints.b}
                    onChange={(event) =>
                      setSalaryPoints((prev) => ({
                        ...prev,
                        b: Number(event.target.value),
                      }))
                    }
                    className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto accent-[#67b8ff]"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-white/90 mt-1">
                  <span>${salaryMin}</span>
                  <span>${salaryMax}</span>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between lg:hidden">
          <h1 className="text-2xl font-bold text-primary-900">Browse Jobs</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(true)}
            className="rounded-full border-[#0a4abf] bg-[#0a4abf] text-white hover:bg-[#093e9f] hover:text-white"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#abff31] px-1.5 text-[11px] font-semibold text-primary-900">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-4">
          <div className="hidden lg:block space-y-4">
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-primary-900">Filters</h3>
                <ChevronDownIcon className="w-4 h-4 text-primary-500 -rotate-90" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary-700">
                    Work schedule
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {workScheduleOptions.map((option) => (
                      <label
                        key={option.value}
                        className="inline-flex items-center gap-2 text-sm text-primary-700"
                      >
                        <input
                          type="checkbox"
                          checked={filters.workSchedule.includes(option.value)}
                          onChange={() =>
                            toggleMultiSelectFilter(
                              "workSchedule",
                              option.value,
                            )
                          }
                          className="h-4 w-4 rounded border-primary-300 accent-[#92d66c]"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary-700">
                    Employment type
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {employmentTypeOptions.map((option) => (
                      <label
                        key={option.value}
                        className="inline-flex items-center gap-2 text-sm text-primary-700"
                      >
                        <input
                          type="checkbox"
                          checked={filters.employmentType.includes(
                            option.value,
                          )}
                          onChange={() =>
                            toggleMultiSelectFilter(
                              "employmentType",
                              option.value,
                            )
                          }
                          className="h-4 w-4 rounded border-primary-300 accent-[#92d66c]"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex pt-6 gap-2">
                <Button
                  onClick={applyFilters}
                  size="md"
                  className="bg-blue-700 px-12 rounded-full hover:bg-blue-800"
                >
                  Apply
                </Button>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="bg-green-400 border-none px-4 rounded-full hover:bg-green-500"
                >
                  Clear
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className="text-xl sm:text-2xl lg:text-5xl font-medium text-primary-900 leading-tight">
                  Recommended jobs
                </h2>
                <span className="inline-flex items-center rounded-full border border-primary-200 bg-white px-3 py-1 text-sm text-primary-700">
                  {sortedFilteredJobs.length}
                </span>
              </div>

              <div className="flex w-full sm:w-auto items-center gap-2 justify-end">
                <span className="text-sm text-primary-500 hidden sm:inline">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortBy)}
                  className="min-w-0 flex-1 sm:flex-none rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm text-primary-800 outline-none"
                >
                  <option value="latest">Last updated</option>
                  <option value="budget-high">Budget: high to low</option>
                  <option value="budget-low">Budget: low to high</option>
                </select>
                <button className="h-9 w-9 rounded-xl border border-primary-200 bg-white flex items-center justify-center text-primary-700">
                  <AdjustmentsHorizontalIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {fetchError ? (
              <Card className="text-center py-12">
                <p className="text-error-700 font-semibold">
                  Unable to load jobs
                </p>
                <p className="text-primary-600 mt-2">{fetchError}</p>
                <Button
                  className="mt-4 bg-blue-700 px-10 rounded-full"
                  onClick={() => fetchJobs(searchQuery.trim())}
                  disabled={searchLoading}
                >
                  Retry
                </Button>
              </Card>
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="animate-pulse p-8 space-y-3">
                    <div className="h-4 bg-primary-200 rounded w-1/3" />
                    <div className="h-8 bg-primary-200 rounded w-2/3" />
                    <div className="h-20 bg-primary-200 rounded" />
                    <div className="h-10 bg-primary-200 rounded" />
                  </Card>
                ))}
              </div>
            ) : sortedFilteredJobs.length === 0 ? (
              <Card className="text-center py-12 px-6">
                <MagnifyingGlassIcon className="w-10 h-10 mx-auto text-primary-400" />
                <h3 className="text-xl font-semibold text-primary-900 mt-3">
                  No results found
                </h3>
                <p className="text-primary-600 mt-2">{noResultMessage}</p>
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="px-8 rounded-full bg-blue-700 border-none text-white hover:bg-blue-800"
                  >
                    Reset filters
                  </Button>
                  <Button
                    onClick={() => fetchJobs("")}
                    className="px-8 rounded-full bg-green-400 text-black hover:bg-green-500"
                  >
                    Refresh jobs
                  </Button>
                </div>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
              >
                {sortedFilteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="p-2 overflow-hidden border border-primary-200">
                      <div
                        className={cn(
                          "p-4 rounded-2xl",
                          cardColorSets[index % cardColorSets.length],
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-primary-700">
                            {formatTimeAgo(job.createdAt)}
                          </span>
                          <button className="h-8 w-8 rounded-full bg-white/80 flex items-center justify-center text-primary-700">
                            <BookmarkIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-2">
                          <p className="text-sm text-primary-700">
                            {job.client.firstName || "Client"}
                          </p>
                          <span className="h-10 w-10 rounded-full bg-[#0a4abf] text-white text-sm font-semibold flex items-center justify-center">
                            {(job.client.firstName?.[0] || "C").toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-3xl font-semibold text-primary-900 leading-tight mt-1">
                          {truncateText(job.title, 38)}
                        </h3>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill.id}
                              className="inline-flex items-center rounded-full border border-primary-300 px-2.5 py-1 text-xs text-primary-700"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {job.skills.length === 0 && (
                            <span className="inline-flex items-center rounded-full border border-primary-300 px-2.5 py-1 text-xs text-primary-700">
                              {job.isHourly ? "Hourly" : "Fixed"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary-900">
                            {formatCurrency(job.budget)}
                            <span className="text-sm font-medium text-primary-600">
                              {job.isHourly ? "/hr" : ""}
                            </span>
                          </p>
                          <div className="inline-flex items-center gap-1 text-sm text-primary-600 mt-1">
                            <MapPinIcon className="w-4 h-4" />
                            <span>
                              {job.client.profile?.location || "Remote"}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="rounded-full"
                          onClick={() => setSelectedJob(job)}
                        >
                          Details
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end">
            <div
              className="fixed inset-0 bg-[#0a4abf]/20"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full bg-white rounded-t-2xl p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary-900">
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 text-primary-400 hover:text-primary-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary-700">
                      Work schedule
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {workScheduleOptions.map((option) => (
                        <label
                          key={option.value}
                          className="inline-flex items-center gap-2 text-sm text-primary-700"
                        >
                          <input
                            type="checkbox"
                            checked={filters.workSchedule.includes(
                              option.value,
                            )}
                            onChange={() =>
                              toggleMultiSelectFilter(
                                "workSchedule",
                                option.value,
                              )
                            }
                            className="h-4 w-4 rounded border-primary-300 accent-[#92d66c]"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary-700">
                      Employment type
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {employmentTypeOptions.map((option) => (
                        <label
                          key={option.value}
                          className="inline-flex items-center gap-2 text-sm text-primary-700"
                        >
                          <input
                            type="checkbox"
                            checked={filters.employmentType.includes(
                              option.value,
                            )}
                            onChange={() =>
                              toggleMultiSelectFilter(
                                "employmentType",
                                option.value,
                              )
                            }
                            className="h-4 w-4 rounded border-primary-300 accent-[#92d66c]"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={applyFilters}
                  fullWidth
                  className="rounded-full bg-[#0a4abf] text-white hover:bg-[#093e9f]"
                >
                  Apply Filters
                </Button>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  fullWidth
                  className="rounded-full border-none bg-[#abff31] text-primary-900 hover:bg-[#9ae62c]"
                >
                  Clear All
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedJobDetails && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 lg:p-6">
            <div
              className="absolute inset-0 bg-[#0a4abf]/20"
              onClick={() => setSelectedJob(null)}
            />
            <div className="relative w-full max-w-[1380px] max-h-[92vh] overflow-y-auto rounded-3xl">
              <button
                className="sticky top-3 ml-auto mr-3 z-10 h-10 w-10 rounded-full bg-white border border-primary-200 text-primary-700 flex items-center justify-center"
                onClick={() => setSelectedJob(null)}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <JobDetailsView job={selectedJobDetails} />
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

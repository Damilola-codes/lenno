"use client";

import { useMemo, useState } from "react";
import {
  BookmarkIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ClockIcon,
  BriefcaseIcon,
  MapPinIcon,
  ShareIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export interface JobSideCard {
  id: string;
  title: string;
  company: string;
  location: string;
  tags: string[];
  postedText: string;
  applicantsText: string;
  compensationText?: string;
  matchScore?: number;
  matchSignals?: string[];
}

export interface JobAttachment {
  id: string;
  name: string;
  subtitle: string;
}

export interface JobDetailsData {
  id: string;
  title: string;
  company: string;
  location: string;
  tags: string[];
  about: string;
  qualifications: string[];
  responsibilities: string[];
  attachments: JobAttachment[];
  similarJobs: JobSideCard[];
  otherJobsFromCompany: JobSideCard[];
}

interface JobDetailsViewProps {
  job: JobDetailsData;
}

function SimilarMatchCard({ item }: { item: JobSideCard }) {
  return (
    <Card className="p-4 border border-primary-200 bg-white">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-primary-800">{item.company}</p>
          <p className="text-2xl font-semibold text-primary-900 mt-1 leading-tight">
            {item.title}
          </p>
        </div>
        <button className="text-primary-500 hover:text-primary-700">
          <BookmarkIcon className="w-5 h-5" />
        </button>
      </div>

      {item.compensationText && (
        <p className="mt-3 text-3xl font-semibold text-primary-900">
          {item.compensationText}
        </p>
      )}

      <div className="mt-3 space-y-2 text-sm text-primary-700">
        <div className="inline-flex items-center gap-2">
          <MapPinIcon className="w-4 h-4" />
          <span>Work from anywhere</span>
        </div>
        <div className="inline-flex items-center gap-2 ml-4">
          <ClockIcon className="w-4 h-4" />
          <span>Work anytime</span>
        </div>
        <div className="inline-flex items-center gap-2 ml-4">
          <BriefcaseIcon className="w-4 h-4" />
          <span>Full time | 40 hours per week</span>
        </div>
      </div>

      {item.matchSignals && item.matchSignals.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.matchSignals.map((signal) => (
            <span
              key={`${item.id}-${signal}`}
              className="inline-flex items-center rounded-md bg-[#ecf9ef] border border-[#cde9d4] px-2 py-1 text-xs text-[#2e7b4d]"
            >
              {signal}
            </span>
          ))}
        </div>
      )}

      <Button className="mt-4 w-full rounded-full bg-[#0a4abf] hover:bg-[#083c9b] text-white">
        View job
      </Button>
    </Card>
  );
}

function SideJobCard({ item }: { item: JobSideCard }) {
  return (
    <Card className="p-4 border border-primary-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-primary-900 leading-tight">
            {item.title}
          </p>
          <p className="text-sm text-primary-700 mt-1">
            {item.company} • {item.location}
          </p>
        </div>
        <button className="text-primary-500 hover:text-primary-700">
          <BookmarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={`${item.id}-${tag}`}
            className="inline-flex items-center rounded-md bg-primary-50 border border-primary-200 px-2 py-1 text-xs text-primary-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="text-sm text-primary-600 mt-3">
        {item.postedText} • {item.applicantsText}
      </p>
    </Card>
  );
}

export default function JobDetailsView({ job }: JobDetailsViewProps) {
  const [showApplicationSuccess, setShowApplicationSuccess] = useState(false);

  const aiReadySimilarJobs = useMemo(() => {
    return job.similarJobs.map((item, index) => ({
      ...item,
      compensationText: item.compensationText || "$100 - $130/hr",
      matchScore: item.matchScore ?? Math.max(78, 94 - index * 6),
      matchSignals: item.matchSignals || [
        "Skill overlap",
        "Relevant experience",
      ],
    }));
  }, [job.similarJobs]);

  if (showApplicationSuccess) {
    return (
      <div className="px-4 lg:px-6 py-4 bg-[#f5f7fb] min-h-screen">
        <div className="rounded-3xl overflow-hidden border border-primary-200 bg-white">
          <div className="bg-[#d8f0b8] px-5 lg:px-8 py-6 relative text-center">
            <button
              className="absolute right-4 top-4 text-primary-700 hover:text-primary-900"
              onClick={() => setShowApplicationSuccess(false)}
            >
              <XMarkIcon className="w-7 h-7" />
            </button>

            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/70 border border-[#c5e09f]">
              <SparklesIcon className="w-7 h-7 text-[#2e7b4d]" />
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-primary-900">
              Your application was sent! Good luck!
            </h2>
            <p className="mt-2 text-primary-800 max-w-3xl mx-auto">
              Most clients review applications within a few days, so keep an eye
              out for interview requests or messages.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                className="rounded-full border-primary-700 text-primary-900"
              >
                View application
              </Button>
              <Button
                className="rounded-full bg-[#0a4abf] hover:bg-[#083c9b] text-white"
                onClick={() => setShowApplicationSuccess(false)}
              >
                Browse more jobs →
              </Button>
            </div>
          </div>

          <div className="p-4 lg:p-6 bg-[#f5f7fb]">
            <div className="flex items-center justify-center gap-2 text-primary-900 mb-4">
              <CheckCircleIcon className="w-5 h-5 text-[#2e7b4d]" />
              <p className="font-medium">
                You’re a good match for these similar jobs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {aiReadySimilarJobs.slice(0, 3).map((item) => (
                <SimilarMatchCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 py-4 bg-[#f5f7fb] min-h-screen">
      <div className="rounded-3xl bg-white border border-primary-200 p-5 lg:p-7">
        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr,1fr] gap-6">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-4xl font-semibold text-primary-900">
                  {job.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-primary-700">
                  <span className="inline-flex items-center gap-1.5 text-base">
                    <BuildingOffice2Icon className="w-5 h-5" />
                    {job.company}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-base">
                    <MapPinIcon className="w-5 h-5" />
                    {job.location}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={`main-tag-${tag}`}
                      className="inline-flex items-center rounded-md bg-[#ecf9ef] border border-[#cde9d4] px-2.5 py-1 text-xs text-[#2e7b4d]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  className="bg-[#0a4abf] hover:bg-[#083c9b] text-white"
                  onClick={() => setShowApplicationSuccess(true)}
                >
                  Apply Now
                </Button>
                <button className="h-10 w-10 rounded-xl border border-primary-200 text-primary-700 flex items-center justify-center hover:bg-primary-50">
                  <BookmarkIcon className="w-5 h-5" />
                </button>
                <button className="h-10 w-10 rounded-xl border border-primary-200 text-primary-700 flex items-center justify-center hover:bg-primary-50">
                  <ShareIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-primary-900">
                About this role
              </h2>
              <p className="text-primary-700 mt-3 leading-relaxed">
                {job.about}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-primary-900">
                Qualification
              </h2>
              <ul className="mt-3 space-y-2 text-primary-700 list-disc pl-5">
                {job.qualifications.map((item, index) => (
                  <li key={`qualification-${index}`}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-primary-900">
                Responsibility
              </h2>
              <ul className="mt-3 space-y-2 text-primary-700 list-disc pl-5">
                {job.responsibilities.map((item, index) => (
                  <li key={`responsibility-${index}`}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-primary-900">
                Attachment
              </h2>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {job.attachments.map((attachment) => (
                  <Card
                    key={attachment.id}
                    className="p-3 border border-primary-200"
                  >
                    <div className="h-24 rounded-lg bg-gradient-to-br from-[#0a4abf] to-[#78d45a]" />
                    <p className="text-sm font-medium text-primary-900 mt-2 truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-primary-600">
                      {attachment.subtitle}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-primary-900 mb-3">
                Similar Jobs
              </h3>
              <div className="space-y-3">
                {job.similarJobs.map((item) => (
                  <SideJobCard key={item.id} item={item} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-900 mb-3">
                Other Jobs From {job.company}
              </h3>
              <div className="space-y-3">
                {job.otherJobsFromCompany.map((item) => (
                  <SideJobCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

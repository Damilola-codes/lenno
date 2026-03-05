"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BoltIcon,
  LinkIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import MobileLayout from "@/components/layout/MobileLayout";

type ProposalTab = "active" | "referrals" | "archived";
type ProposalBucket = "offers" | "interviews" | "activeProposals" | "submitted";

interface ProposalRecord {
  id: string;
  tab: ProposalTab;
  bucket: ProposalBucket;
}

const proposalSeed: ProposalRecord[] = [
  { id: "p-1", tab: "active", bucket: "submitted" },
  { id: "p-2", tab: "active", bucket: "submitted" },
  { id: "p-3", tab: "active", bucket: "activeProposals" },
  { id: "p-4", tab: "referrals", bucket: "offers" },
  { id: "p-5", tab: "archived", bucket: "submitted" },
];

export default function ProposalsPage() {
  const [selectedTab, setSelectedTab] = useState<ProposalTab>("active");
  const [availableNow, setAvailableNow] = useState(false);

  const tabbedRecords = useMemo(
    () => proposalSeed.filter((item) => item.tab === selectedTab),
    [selectedTab],
  );

  const counts = useMemo(() => {
    const counter = {
      offers: 0,
      interviews: 0,
      activeProposals: 0,
      submitted: 0,
    };

    tabbedRecords.forEach((record) => {
      counter[record.bucket] += 1;
    });

    return counter;
  }, [tabbedRecords]);

  const sections = [
    { key: "offers", label: "Offers", count: counts.offers },
    {
      key: "interviews",
      label: "Invitations to interview",
      count: counts.interviews,
      withAvailability: true,
    },
    {
      key: "activeProposals",
      label: "Active proposals",
      count: counts.activeProposals,
    },
    { key: "submitted", label: "Submitted proposals", count: counts.submitted },
  ] as const;

  return (
    <MobileLayout>
      <div className="px-3 sm:px-4 lg:px-6 py-4 bg-[#f5f7fb] min-h-screen">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary-900">
              My proposals
            </h1>
            <Link
              href="/dashboard/trends"
              className="text-sm sm:text-base text-[#40ea42] font-medium underline underline-offset-4"
            >
              Stats and trends
            </Link>
          </div>

          <div className="mt-8 border-b border-primary-200">
            <div className="flex items-center gap-5 sm:gap-8 text-lg sm:text-2xl overflow-x-auto no-scrollbar whitespace-nowrap">
              {[
                { key: "active", label: "Active" },
                { key: "referrals", label: "Referrals" },
                { key: "archived", label: "Archived" },
              ].map((tab) => {
                const isActive = selectedTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key as ProposalTab)}
                    className={`relative pb-2 transition-colors ${
                      isActive
                        ? "text-primary-900 font-medium"
                        : "text-primary-500 hover:text-primary-800"
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute left-0 right-0 -bottom-[1px] h-[3px] rounded-full bg-[#0a4abf]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {sections.map((section) => (
              <div
                key={section.key}
                className="rounded-3xl bg-[#f4fbf6] border border-[#cfead9] p-2"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl sm:rounded-full bg-[#f8fdf9] border border-[#d8efdf] px-4 sm:px-5 py-4">
                  <div className="inline-flex items-center gap-2 min-w-0">
                    <h5 className="text-base sm:text-xl font-semibold text-primary-900 break-words">
                      {section.label} ({section.count})
                    </h5>
                    <QuestionMarkCircleIcon className="w-5 h-5 text-primary-500 shrink-0" />
                  </div>

                  {"withAvailability" in section &&
                    section.withAvailability && (
                      <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => setAvailableNow((prev) => !prev)}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border ${
                            availableNow
                              ? "bg-[#ecf9ef] border-[#cde9d4] text-[#2e7b4d]"
                              : "bg-white border-[#cde9d4] text-primary-600"
                          }`}
                        >
                          <BoltIcon className="w-4 h-4" />
                          Available now
                        </button>
                        <span className="text-sm font-medium text-primary-700">
                          {availableNow ? "on" : "off"}
                        </span>
                        <button className="h-10 w-10 rounded-full border-2 border-[#78d45a] text-[#2e7b4d] flex items-center justify-center">
                          <LinkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-start sm:justify-end gap-2 sm:gap-3 text-sm">
            <Link
              href="/jobs"
              className="text-[#2e7b4d] font-medium underline underline-offset-4"
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

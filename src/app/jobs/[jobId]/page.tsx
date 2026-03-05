import MobileLayout from "@/components/layout/MobileLayout";
import JobDetailsView, {
  type JobDetailsData,
} from "@/components/jobs/JobDetailsView";

const defaultJobDetails: JobDetailsData = {
  id: "dummy-1",
  title: "UI/UX Designer",
  company: "Pixelz Studio",
  location: "Yogyakarta, Indonesia",
  tags: ["Fulltime", "Remote", "2-4 Years"],
  about:
    "As a UI/UX Designer on Pixelz Studio, you’ll focus on design user-friendly experiences across web and mobile products. Your innovative solution will elevate how users interact with products and improve engagement outcomes.",
  qualifications: [
    "At least 2-4 years of relevant experience in product design or related roles.",
    "Knowledge of design validation through qualitative or quantitative research.",
    "Have good knowledge using Figma and FigJam.",
    "Experience with analytics tools to gather data from users.",
  ],
  responsibilities: [
    "Create design and user journeys on key features across multiple devices.",
    "Identify design problems through user journeys and devise elegant solutions.",
    "Develop low and high-fidelity designs, user flow and prototypes.",
    "Collaborate with Design Leads, UX Engineers and PMs in sprint cycles.",
  ],
  attachments: [
    {
      id: "att-1",
      name: "Jobs_Requirement.pdf",
      subtitle: "Requirement document",
    },
    {
      id: "att-2",
      name: "Company_Benefit.pdf",
      subtitle: "Benefits and perks",
    },
    {
      id: "att-3",
      name: "Design_Task.pdf",
      subtitle: "Take-home challenge",
    },
  ],
  similarJobs: [
    {
      id: "sim-1",
      title: "Lead UI Designer",
      company: "Gojek",
      location: "Jakarta, Indonesia",
      tags: ["Fulltime", "Onsite", "3-5 Years"],
      postedText: "2 day ago",
      applicantsText: "521 Applicants",
    },
    {
      id: "sim-2",
      title: "Sr. UX Designer",
      company: "GoPay",
      location: "Jakarta, Indonesia",
      tags: ["Fulltime", "Onsite", "3-5 Years"],
      postedText: "2 day ago",
      applicantsText: "210 Applicants",
    },
    {
      id: "sim-3",
      title: "Jr. UI Designer",
      company: "OVO",
      location: "Jakarta, Indonesia",
      tags: ["Fulltime", "Onsite", "1-3 Years"],
      postedText: "an hour ago",
      applicantsText: "120 Applicants",
    },
  ],
  otherJobsFromCompany: [
    {
      id: "other-1",
      title: "UI Designer",
      company: "Pixelz Studio",
      location: "Yogyakarta, Indonesia",
      tags: ["Internship", "Onsite", "Fresh Graduate"],
      postedText: "a day ago",
      applicantsText: "35 Applicants",
    },
    {
      id: "other-2",
      title: "Frontend Developer",
      company: "Pixelz Studio",
      location: "Yogyakarta, Indonesia",
      tags: ["Full Time", "Onsite", "1-3 Years"],
      postedText: "a day ago",
      applicantsText: "22 Applicants",
    },
  ],
};

const jobDetailsById: Record<string, JobDetailsData> = {
  "dummy-1": defaultJobDetails,
  "dummy-2": {
    ...defaultJobDetails,
    id: "dummy-2",
    title: "Junior UI/UX Designer",
    company: "Google",
    location: "California, USA",
  },
  "dummy-3": {
    ...defaultJobDetails,
    id: "dummy-3",
    title: "Senior Motion Designer",
    company: "Dribbble",
    location: "New York, USA",
  },
};

interface JobDetailsPageProps {
  params: Promise<{ jobId: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { jobId } = await params;
  const job = jobDetailsById[jobId] ?? defaultJobDetails;

  return (
    <MobileLayout>
      <JobDetailsView job={job} />
    </MobileLayout>
  );
}

// app/api/jobs/[jobId]/proposals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/library/auth";
import { prisma } from "@/library/prisma";
import { z } from "zod";

const createProposalSchema = z.object({
  coverLetter: z.string().min(50),
  proposedRate: z.number().positive(),
  duration: z.string().optional()
});

// GET /api/jobs/[jobId]/proposals - Get all proposals for a job (CLIENT only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user owns this job (for clients) or if they're viewing their own proposal
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { clientId: true }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Only job owner can see all proposals
    if (session.user.id !== job.clientId && session.user.userType !== "CLIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const proposals = await prisma.proposal.findMany({
      where: { jobId },
      include: {
        freelancer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                title: true,
                hourlyRate: true,
                avatar: true,
                location: true,
                skills: true
              }
            },
            reviewsReceived: {
              select: {
                rating: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Calculate average rating for each freelancer
    interface ReviewReceived {
        rating: number;
    }

    interface FreelancerProfile {
        title: string | null;
        hourlyRate: number | null;
        avatar: string | null;
        location: string | null;
        skills: { name: string; id: string; }[];
    }

    interface FreelancerData {
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        profile: FreelancerProfile | null;
        reviewsReceived: ReviewReceived[];
    }

    interface Proposal {
        id: string;
        jobId: string;
        freelancerId: string;
        coverLetter: string;
        proposedRate: number;
        duration: string | null;
        status: string; // or use an enum like 'PENDING' | 'ACCEPTED' | 'REJECTED'
        createdAt: Date;
        updatedAt: Date;
        freelancer: FreelancerData;
    }

    interface FreelancerWithRating extends Omit<FreelancerData, 'reviewsReceived'> {
        averageRating: number | null;
        totalReviews: number;
    }

    interface ProposalWithRating extends Omit<Proposal, 'freelancer'> {
        freelancer: FreelancerWithRating;
    }

    const proposalsWithRatings: ProposalWithRating[] = proposals.map((proposal: Proposal) => ({
        ...proposal,
        freelancer: {
            ...proposal.freelancer,
            averageRating: proposal.freelancer.reviewsReceived.length > 0
                ? proposal.freelancer.reviewsReceived.reduce((acc: number, review: ReviewReceived) => acc + review.rating, 0) / proposal.freelancer.reviewsReceived.length
                : null,
            totalReviews: proposal.freelancer.reviewsReceived.length
        }
    }));

    return NextResponse.json(proposalsWithRatings);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/jobs/[jobId]/proposals - Submit a proposal (FREELANCER only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    const session = await getServerSession();
    
    if (!session || session.user.userType !== "FREELANCER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createProposalSchema.parse(body);

    // Check if job exists and is open
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { status: true, clientId: true }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "OPEN") {
      return NextResponse.json({ error: "Job is not open for proposals" }, { status: 400 });
    }

    // Check if freelancer already submitted a proposal
    const existingProposal = await prisma.proposal.findUnique({
      where: {
        jobId_freelancerId: {
          jobId,
          freelancerId: session.user.id
        }
      }
    });

    if (existingProposal) {
      return NextResponse.json(
        { error: "You have already submitted a proposal for this job" },
        { status: 400 }
      );
    }

    const proposal = await prisma.proposal.create({
      data: {
        jobId,
        freelancerId: session.user.id,
        coverLetter: validatedData.coverLetter,
        proposedRate: validatedData.proposedRate,
        duration: validatedData.duration
      },
      include: {
        freelancer: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                title: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((i: z.ZodIssue) => i.message).join('; ')
      return NextResponse.json({ error: message, details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

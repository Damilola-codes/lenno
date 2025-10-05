// app/api/proposals/[proposalId]/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/library/auth";
import { prisma } from "@/library/prisma";

// POST /api/proposals/[proposalId]/accept - Accept a proposal and create contract
export async function POST(
  req: NextRequest,
  { params }: { params: { proposalId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userType !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposalId = params.proposalId;

    // Get proposal with job details
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            clientId: true,
            status: true
          }
        },
        freelancer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Check if user owns the job
    if (proposal.job.clientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if job is still open
    if (proposal.job.status !== "OPEN") {
      return NextResponse.json({ error: "Job is no longer open" }, { status: 400 });
    }

    // Use transaction to ensure data consistency
    interface FreelancerInfo {
        firstName: string;
        lastName: string;
        username: string;
    }

    interface ContractResult {
        id: string;
        jobId: string;
        clientId: string;
        freelancerId: string;
        title: string;
        description: string;
        amount: number;
        startDate: Date | null;
        freelancer: FreelancerInfo;
    }

    const result: ContractResult = await prisma.$transaction(async (tx) => {
        // Accept the proposal
        await tx.proposal.update({
            where: { id: proposalId },
            data: { status: "ACCEPTED" }
        });

        // Reject all other proposals for this job
        await tx.proposal.updateMany({
            where: {
                jobId: proposal.job.id,
                id: { not: proposalId }
            },
            data: { status: "REJECTED" }
        });

        // Update job status
        await tx.job.update({
            where: { id: proposal.job.id },
            data: { status: "IN_PROGRESS" }
        });

        // Create contract
        const contract: ContractResult = await tx.contract.create({
            data: {
                jobId: proposal.job.id,
                clientId: proposal.job.clientId,
                freelancerId: proposal.freelancerId,
                title: proposal.job.title,
                description: proposal.job.description,
                amount: proposal.proposedRate,
                startDate: new Date()
            },
            include: {
                freelancer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        username: true
                    }
                }
            }
        });

        return contract;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
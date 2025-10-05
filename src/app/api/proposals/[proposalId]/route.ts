// /api/proposals/[proposalId] - GET, PUT, DELETE

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/library/auth";
import { prisma } from "@/library/prisma";
import { z } from "zod";


const updateProposalSchema = z.object({
  coverLetter: z.string().min(10).max(1000).optional(),
  proposedRate: z.number().positive().optional(),
  duration: z.string().optional(),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional()
});

export async function GET(req: NextRequest, { params }: { params: { proposalId: string } }) {
    try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { proposalId } = params;
    const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: {
            job: {
                include: {
                    client: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            username: true,
                            profile: {
                                select: {
                                    avatar: true,
                                    location: true
                                }
                            }
                        }
                    },
                    skills: true
                }
            },
            freelancer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    email: true,
                    profile: {
                        select: {
                            avatar: true,
                            location: true,
                            hourlyRate: true,
                            skills: true
                        }
                    }
                }
            }
        }
    });
    if (!proposal) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    // Authorization: Only the freelancer who submitted the proposal or the client who owns the job can view it
    if (session.user.userType === "FREELANCER" && proposal.freelancerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (session.user.userType === "CLIENT" && proposal.job.clientId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ proposal });
}
catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function PUT(req: NextRequest, { params }: { params: { proposalId: string } }) {
    try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { proposalId } = params;
    const existingProposal = await prisma.proposal.findUnique({
        where: { id: proposalId }
    });
    if (!existingProposal) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    // Authorization: Only the freelancer who submitted the proposal can update it
    if (session.user.userType !== "FREELANCER" || existingProposal.freelancerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const parsedBody = updateProposalSchema.safeParse(body);
    if (!parsedBody.success) {
        return NextResponse.json({ error: "Invalid input", details: parsedBody.error.issues }, { status: 400 });
    }
    const updatedProposal = await prisma.proposal.update({
        where: { id: proposalId },
        data: parsedBody.data
    });
    return NextResponse.json({ proposal: updatedProposal });
}
catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(req: NextRequest, { params }: { params: { proposalId: string } }) {
    try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { proposalId } = params;
    const existingProposal = await prisma.proposal.findUnique({
        where: { id: proposalId }
    });
    if (!existingProposal) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    // Authorization: Only the freelancer who submitted the proposal can delete it
    if (session.user.userType !== "FREELANCER" || existingProposal.freelancerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.proposal.delete({
        where: { id: proposalId }
    });
    return NextResponse.json({ message: "Proposal deleted successfully" });
}
catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
}
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/library/auth";
import { prisma } from "@/library/prisma";

// POST /api/milestones/[milestoneId]/pay - Mark milestone as paid
export async function POST(
  req: NextRequest,
  { params }: { params: { milestoneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const milestoneId = params.milestoneId;

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: {
          select: {
            clientId: true,
            freelancerId: true
          }
        }
      }
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Only client can mark milestone as paid
    if (milestone.contract.clientId !== session.user.id) {
      return NextResponse.json({ error: "Only client can pay milestones" }, { status: 403 });
    }

    if (!milestone.isCompleted) {
      return NextResponse.json({ error: "Milestone must be completed before payment" }, { status: 400 });
    }

    if (milestone.isPaid) {
      return NextResponse.json({ error: "Milestone already paid" }, { status: 400 });
    }

    // Here you would integrate with Pi Network payment system
    // For now, we'll just mark as paid
    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { isPaid: true }
    });

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
    
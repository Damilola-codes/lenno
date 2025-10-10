import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/library/auth";
import { prisma } from "@/library/prisma";

// POST /api/milestones/[milestonesId]/pay - Mark milestone as paid
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ milestonesId: string }> }
) {
  try {
    const { milestonesId } = await params
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const milestoneId = milestonesId;

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

    // Integrate with Pi Network payment system
    // For milestone payments, we don't create a Transaction record here
    // as Transaction is for job-based payments. 
    // Milestone payments are tracked via the milestone.isPaid status.

    // Mark milestone as paid
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
    
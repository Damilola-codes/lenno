// app/api/contracts/[contractId]/milestones/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/library/auth";
import { prisma } from "@/library/prisma";
import { z } from "zod";

const createMilestoneSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().positive(),
  dueDate: z.string().optional()
});

// POST /api/contracts/[contractId]/milestones - Create milestone
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const { contractId } = await params
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createMilestoneSchema.parse(body);

    // Check if contract exists and user has access
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: { clientId: true, freelancerId: true, status: true }
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.clientId !== session.user.id && contract.freelancerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (contract.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Can only add milestones to active contracts" },
        { status: 400 }
      );
    }

    const milestone = await prisma.milestone.create({
      data: {
        contractId,
        title: validatedData.title,
        description: validatedData.description,
        amount: validatedData.amount,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null
      }
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// GET /api/contracts/[contractId]/milestones - Get milestones for contract
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const { contractId } = await params
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if contract exists and user has access
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: { clientId: true, freelancerId: true }
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.clientId !== session.user.id && contract.freelancerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const milestones = await prisma.milestone.findMany({
      where: { contractId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
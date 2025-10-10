import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/library/auth";
import { prisma } from "@/library/prisma";

// GET /api/contracts - Get user's contracts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: {
      OR: Array<{ clientId?: string; freelancerId?: string }>;
      status?: string;
    } = {
      OR: [
        { clientId: session.user.id },
        { freelancerId: session.user.id }
      ]
    };

    if (status) {
      where.status = status;
    }

    const contracts = await prisma.contract.findMany({
      include: {
        job: {
          select: {
            title: true,
            skills: true
          }
        },
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
        freelancer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                avatar: true,
                location: true,
                title: true
              }
            }
          }
        },
        milestones: {
          orderBy: { createdAt: "asc" }
        },
        _count: {
          select: {
            milestones: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// POST /api/contracts - Create a new contract (not typically used, as contracts are created via proposal acceptance)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { jobId, freelancerId, title, description, amount } = await req.json();
    if (session.user.userType !== "CLIENT") {
        return NextResponse.json({ error: "Only clients can create contracts" }, { status: 403 });
    }
    // Verify job ownership
    const job = await prisma.job.findUnique({
        where: { id: jobId }
    });
    if (!job || job.clientId !== session.user.id) {
        return NextResponse.json({ error: "Job not found or access denied" }, { status: 404 });
    }
    // Create contract
    const contract = await prisma.contract.create({
        data: {
            jobId,
            clientId: session.user.id,
            freelancerId,
            title,
            description,
            amount,
            status: "ACTIVE"
        }
    });
    return NextResponse.json(contract, { status: 201 });
  }
    catch (error) {
    console.error(error);
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
  }
}


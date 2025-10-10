// app/api/contracts/[contractId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/library/auth";
import { prisma } from "@/library/prisma";
import { z } from "zod";

const updateContractSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  endDate: z.string().optional()
});

// GET /api/contracts/[contractId] - Get contract details
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

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        job: {
          include: {
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
                title: true,
                skills: true
              }
            }
          }
        },
        milestones: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Check if user is part of this contract
    if (contract.clientId !== session.user.id && contract.freelancerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/contracts/[contractId] - Update contract status
export async function PUT(
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
    const validatedData = updateContractSchema.parse(body);

    // Get contract to check ownership
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: { clientId: true, freelancerId: true, status: true }
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Check if user is part of this contract
    if (contract.clientId !== session.user.id && contract.freelancerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow certain status transitions
    if (validatedData.status === "COMPLETED" && contract.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot complete a cancelled contract" },
        { status: 400 }
      );
    }

    const updateData: { status?: "ACTIVE" | "COMPLETED" | "CANCELLED"; endDate?: Date } = {};
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.endDate) updateData.endDate = new Date(validatedData.endDate);

    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: updateData,
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        },
        freelancer: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json(updatedContract);
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

// GET /api/contracts - List contracts for the authenticated user (client or freelancer)
export async function PATCH(
  req: NextRequest
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where = {
      OR: [
        { clientId: session.user.id },
        { freelancerId: session.user.id }
      ],
      ...(status && { status: status as "ACTIVE" | "COMPLETED" | "CANCELLED" })
    };

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          job: {
            select: {
              title: true,
              budget: true
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
                  avatar: true
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
                  title: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.contract.count({ where })
    ]);

    return NextResponse.json({
      contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/contracts/[contractId] - Delete a contract
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const { contractId } = await params
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get contract to check ownership and status
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: { clientId: true, freelancerId: true, status: true }
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Check if user is part of this contract
    if (contract.clientId !== session.user.id && contract.freelancerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow deletion of cancelled contracts or contracts that haven't started
    if (contract.status === "ACTIVE" || contract.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot delete active or completed contracts" },
        { status: 400 }
      );
    }

    await prisma.contract.delete({
      where: { id: contractId }
    });

    return NextResponse.json({ message: "Contract deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
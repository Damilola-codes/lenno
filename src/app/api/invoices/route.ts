import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/library/prisma";
import { getServerSession } from "@/library/auth";

const db = prisma as unknown as {
  invoiceRequest: {
    findMany: (args: unknown) => Promise<unknown[]>;
    create: (args: unknown) => Promise<unknown>;
  };
};

const createSchema = z.object({
  clientName: z.string().min(1),
  projectTitle: z.string().min(1),
  amount: z.number().positive(),
});

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await db.invoiceRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(invoices);
  } catch {
    return NextResponse.json(
      { error: "Failed to load invoices" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createSchema.parse(body);

    const created = await db.invoiceRequest.create({
      data: {
        userId: session.user.id,
        clientName: data.clientName,
        projectTitle: data.projectTitle,
        amount: data.amount,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create invoice request" },
      { status: 500 },
    );
  }
}

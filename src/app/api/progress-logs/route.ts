import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/library/prisma";
import { getServerSession } from "@/library/auth";

const db = prisma as unknown as {
  progressLog: {
    findMany: (args: unknown) => Promise<unknown[]>;
    create: (args: unknown) => Promise<unknown>;
  };
};

const createSchema = z.object({
  projectTitle: z.string().min(1),
  update: z.string().min(1),
});

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await db.progressLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(logs);
  } catch {
    return NextResponse.json(
      { error: "Failed to load progress logs" },
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

    const created = await db.progressLog.create({
      data: {
        userId: session.user.id,
        projectTitle: data.projectTitle,
        update: data.update,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create progress log" },
      { status: 500 },
    );
  }
}

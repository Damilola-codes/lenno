import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/library/prisma";
import { getServerSession } from "@/library/auth";

const db = prisma as unknown as {
  notification: {
    updateMany: (args: unknown) => Promise<{ count: number }>;
  };
};

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const updated = await db.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { read: true },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 },
    );
  }
}

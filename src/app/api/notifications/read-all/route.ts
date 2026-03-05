import { NextResponse } from "next/server";
import { prisma } from "@/library/prisma";
import { getServerSession } from "@/library/auth";

const db = prisma as unknown as {
  notification: {
    updateMany: (args: unknown) => Promise<{ count: number }>;
  };
};

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 },
    );
  }
}

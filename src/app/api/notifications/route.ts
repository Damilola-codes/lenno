import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/library/prisma";
import { getServerSession } from "@/library/auth";

type NotificationRecord = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

const db = prisma as unknown as {
  notification: {
    findMany: (args: unknown) => Promise<NotificationRecord[]>;
    create: (args: unknown) => Promise<NotificationRecord>;
    deleteMany: (args: unknown) => Promise<{ count: number }>;
  };
};

const createSchema = z.object({
  type: z.enum(["info", "success", "warning", "error"]),
  title: z.string().min(1),
  message: z.string().min(1),
});

function toClientType(value: string) {
  return value.toLowerCase() as "info" | "success" | "warning" | "error";
}

function isMissingNotificationTable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("P2021") ||
    message.toLowerCase().includes("table") &&
      message.toLowerCase().includes("notifications")
  );
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(
      notifications.map((item: NotificationRecord) => ({
        id: item.id,
        type: toClientType(item.type),
        title: item.title,
        message: item.message,
        read: item.read,
        timestamp: item.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    if (isMissingNotificationTable(error)) {
      return NextResponse.json([]);
    }

    return NextResponse.json(
      { error: "Failed to load notifications" },
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

    const created = await db.notification.create({
      data: {
        userId: session.user.id,
        type: data.type.toUpperCase() as "INFO" | "SUCCESS" | "WARNING" | "ERROR",
        title: data.title,
        message: data.message,
      },
    });

    return NextResponse.json({
      id: created.id,
      type: toClientType(created.type),
      title: created.title,
      message: created.message,
      read: created.read,
      timestamp: created.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (isMissingNotificationTable(error)) {
      return NextResponse.json(
        { error: "Notifications are not ready. Run database migrations." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.notification.deleteMany({ where: { userId: session.user.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isMissingNotificationTable(error)) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Failed to clear notifications" },
      { status: 500 },
    );
  }
}

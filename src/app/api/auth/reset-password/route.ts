import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { prisma } from "@/library/prisma";

type PasswordResetTokenRow = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  user: { id: string };
};

const db = prisma as unknown as {
  passwordResetToken: {
    findUnique: (args: unknown) => Promise<PasswordResetTokenRow | null>;
    update: (args: unknown) => Promise<PasswordResetTokenRow>;
    updateMany: (args: unknown) => Promise<{ count: number }>;
  };
  user: {
    update: (args: unknown) => Promise<unknown>;
  };
  $transaction: <T>(operations: Promise<T>[]) => Promise<T[]>;
};

const resetSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(6),
});

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetSchema.parse(body);

    const tokenHash = hashToken(token);
    const resetRecord = await db.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: { id: true },
        },
      },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    if (resetRecord.usedAt) {
      return NextResponse.json({ error: "This reset link was already used." }, { status: 400 });
    }

    if (resetRecord.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "This reset link has expired." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.$transaction([
      db.user.update({
        where: { id: resetRecord.user.id },
        data: { password: hashedPassword },
      }),
      db.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      db.passwordResetToken.updateMany({
        where: {
          userId: resetRecord.user.id,
          usedAt: null,
          id: { not: resetRecord.id },
        },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true, message: "Password updated successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message || "Invalid input.";
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }

    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Unable to reset password right now." }, { status: 500 });
  }
}

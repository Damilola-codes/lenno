import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/library/prisma";

const requestSchema = z.object({
  email: z.string().email(),
});

const GENERIC_MESSAGE = "If the email exists, a reset link has been sent.";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.parse(body);
    const email = parsed.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
    }

    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;

    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        ok: true,
        message: GENERIC_MESSAGE,
        resetUrl,
      });
    }

    console.info("Password reset requested", { email: user.email, resetUrl });

    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Unable to process request right now." }, { status: 500 });
  }
}

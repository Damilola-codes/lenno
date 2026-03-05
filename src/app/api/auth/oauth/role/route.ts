import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/library/prisma";
import { authOptions } from "@/library/nextauth";

const roleSchema = z.object({
  userType: z.enum(["CLIENT", "FREELANCER"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as {
      user?: { email?: string };
    } | null;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userType } = roleSchema.parse(body);

    const email = session.user.email.toLowerCase().trim();
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { userType },
      select: {
        id: true,
        username: true,
        email: true,
        userType: true,
        isVerified: true,
        firstName: true,
        lastName: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((issue) => issue.message).join("; ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

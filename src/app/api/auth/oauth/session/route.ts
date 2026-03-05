import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/library/prisma";
import { authOptions } from "@/library/nextauth";

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as {
      user?: { email?: string };
    } | null;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      requiresRoleSelection: user.userType === "USER",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

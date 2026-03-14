import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/library/prisma";
import { getServerSession } from "@/library/auth";

const switchRoleSchema = z.object({
  userType: z.enum(["CLIENT", "FREELANCER"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userType } = switchRoleSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
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

    const sessionPayload = {
      user: {
        ...updatedUser,
      },
      expires:
        session.expires ||
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const response = NextResponse.json({ user: updatedUser });
    response.cookies.set(
      "auth-session",
      encodeURIComponent(JSON.stringify(sessionPayload)),
      {
        path: "/",
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
        httpOnly: false,
      },
    );

    return response;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((issue) => issue.message).join("; ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from '@/library/prisma'
import { Prisma } from "@prisma/client";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  userType: z.enum(["CLIENT", "FREELANCER"]),
  // (Previously supported external wallet id; removed)
});

function databaseUrlIssue() {
  const value = process.env.DATABASE_URL;
  if (!value) return "Database not configured. Set DATABASE_URL.";

  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return "DATABASE_URL appears to include wrapping quotes. Remove surrounding quotes in production env vars.";
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const dbIssue = databaseUrlIssue();
    if (dbIssue) {
      console.error("Register route DB config issue:", dbIssue);
      return NextResponse.json({ error: dbIssue }, { status: 503 });
    }
    const body = await req.json();
    const validatedData = registerSchema.parse(body);
    const normalizedUsername = validatedData.username.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          {
            username: {
              equals: normalizedUsername,
              mode: "insensitive",
            },
          }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        username: normalizedUsername,
        userType: validatedData.userType,
        profile: {
          create: {}
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        userType: true,
        createdAt: true
      }
    });

    const sessionPayload = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: false,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    const response = NextResponse.json(user, { status: 201 });
    response.cookies.set('auth-session', encodeURIComponent(JSON.stringify(sessionPayload)), {
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map(i => i.message).join('; ')
      return NextResponse.json({ error: message, details: error.issues }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "User with this email or username already exists" },
          { status: 400 },
        );
      }

      if (error.code === "P2021") {
        return NextResponse.json(
          { error: "Database schema is not up to date. Run prisma migrate deploy." },
          { status: 503 },
        );
      }
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: "Database not configured or unreachable in production environment." },
        { status: 503 },
      );
    }

    // Log detailed error for debugging (safe in dev)
    console.error('Register route error:', error)
    const msg = error instanceof Error ? error.message : String(error ?? '')
    if (msg.includes('Environment variable not found: DATABASE_URL') || msg.includes('PrismaClientInitializationError')) {
      return NextResponse.json({ error: 'Database not configured or unreachable. Ensure DATABASE_URL is set and the DB is running.' }, { status: 503 })
    }

    const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : msg || 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
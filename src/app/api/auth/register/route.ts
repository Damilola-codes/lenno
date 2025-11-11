// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from '@/library/prisma'
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(3),
  userType: z.enum(["CLIENT", "FREELANCER"]),
  // (Previously supported external wallet id; removed)
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set')
      return NextResponse.json({ error: 'Database not configured. Please set DATABASE_URL in .env' }, { status: 503 })
    }
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
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
        username: validatedData.username,
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

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    // Log detailed error for debugging (safe in dev)
    console.error('Register route error:', error)
    const msg = error?.message ?? ''
    if (String(msg).includes('Environment variable not found: DATABASE_URL') || String(msg).includes('PrismaClientInitializationError')) {
      return NextResponse.json({ error: 'Database not configured or unreachable. Ensure DATABASE_URL is set and the DB is running.' }, { status: 503 })
    }

    const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : msg || 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
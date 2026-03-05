import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/library/prisma";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function validateUsername(username: string) {
  if (!username) return "Username is required.";
  if (!USERNAME_REGEX.test(username)) {
    return "Use 3-20 characters: lowercase letters, numbers, and underscores only.";
  }
  return null;
}

async function checkUsername(rawUsername: string) {
  const username = normalizeUsername(rawUsername);
  const validationError = validateUsername(username);

  if (validationError) {
    return NextResponse.json(
      {
        available: false,
        username,
        reason: validationError,
      },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  return NextResponse.json({
    available: !existing,
    username,
    reason: existing ? "Username is already taken." : "Username is available.",
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || "";
    return await checkUsername(username);
  } catch {
    return NextResponse.json(
      { available: false, reason: "Unable to validate username right now." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { username?: string };
    return await checkUsername(body.username || "");
  } catch {
    return NextResponse.json(
      { available: false, reason: "Unable to validate username right now." },
      { status: 500 },
    );
  }
}
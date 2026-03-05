import { NextResponse } from "next/server";
import { prisma } from "@/library/prisma";

function isConfigured(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function validatePostgresUrl(value: string | undefined, key: string) {
  if (!isConfigured(value)) {
    return { ok: false, issue: `${key} is missing.` };
  }

  const trimmed = String(value).trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return {
      ok: false,
      issue: `${key} contains wrapping quotes. Remove surrounding quotes in host environment variables.`,
    };
  }

  if (!trimmed.startsWith("postgresql://") && !trimmed.startsWith("postgres://")) {
    return {
      ok: false,
      issue: `${key} must start with postgresql:// or postgres://`,
    };
  }

  return { ok: true as const, issue: null as string | null };
}

export async function GET() {
  const startedAt = Date.now();

  const env = {
    DATABASE_URL: isConfigured(process.env.DATABASE_URL),
    DIRECT_URL: isConfigured(process.env.DIRECT_URL),
    NEXTAUTH_URL: isConfigured(process.env.NEXTAUTH_URL),
    NEXTAUTH_SECRET: isConfigured(process.env.NEXTAUTH_SECRET),
    GOOGLE_OAUTH:
      isConfigured(process.env.GOOGLE_CLIENT_ID) &&
      isConfigured(process.env.GOOGLE_CLIENT_SECRET),
  };

  const dbUrlValidation = validatePostgresUrl(process.env.DATABASE_URL, "DATABASE_URL");
  const directUrlValidation = validatePostgresUrl(process.env.DIRECT_URL, "DIRECT_URL");

  if (!dbUrlValidation.ok || !directUrlValidation.ok) {
    return NextResponse.json(
      {
        ok: false,
        checks: {
          env,
          dbConnected: false,
          databaseUrlValid: dbUrlValidation.ok,
          directUrlValid: directUrlValidation.ok,
        },
        issues: [dbUrlValidation.issue, directUrlValidation.issue].filter(Boolean),
        durationMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    const resetTokenTableCheck = (await prisma.$queryRaw`
      SELECT to_regclass('public.password_reset_tokens') AS table_name
    `) as Array<{ table_name: string | null }>;

    const hasResetTokenTable = Boolean(resetTokenTableCheck[0]?.table_name);

    const allCriticalEnvPresent =
      env.DATABASE_URL && env.DIRECT_URL && env.NEXTAUTH_URL && env.NEXTAUTH_SECRET;

    const ok = allCriticalEnvPresent && hasResetTokenTable;

    return NextResponse.json(
      {
        ok,
        checks: {
          env,
          dbConnected: true,
          passwordResetTablePresent: hasResetTokenTable,
        },
        durationMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: ok ? 200 : 503 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        checks: {
          env,
          dbConnected: false,
        },
        error: error instanceof Error ? error.message : "Unknown verification failure",
        durationMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}

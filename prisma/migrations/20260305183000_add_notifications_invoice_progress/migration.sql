-- Create enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
    CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvoiceRequestStatus') THEN
    CREATE TYPE "InvoiceRequestStatus" AS ENUM ('PENDING', 'SENT', 'PAID', 'REJECTED');
  END IF;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL DEFAULT 'INFO',
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Create invoice requests table
CREATE TABLE IF NOT EXISTS "invoice_requests" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "projectTitle" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "status" "InvoiceRequestStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "invoice_requests_pkey" PRIMARY KEY ("id")
);

-- Create progress logs table
CREATE TABLE IF NOT EXISTS "progress_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "projectTitle" TEXT NOT NULL,
  "update" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "progress_logs_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx"
ON "notifications"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "invoice_requests_userId_createdAt_idx"
ON "invoice_requests"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "progress_logs_userId_createdAt_idx"
ON "progress_logs"("userId", "createdAt");

-- Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_userId_fkey'
  ) THEN
    ALTER TABLE "notifications"
      ADD CONSTRAINT "notifications_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'invoice_requests_userId_fkey'
  ) THEN
    ALTER TABLE "invoice_requests"
      ADD CONSTRAINT "invoice_requests_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'progress_logs_userId_fkey'
  ) THEN
    ALTER TABLE "progress_logs"
      ADD CONSTRAINT "progress_logs_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

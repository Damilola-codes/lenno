import { PrismaClient } from "@prisma/client";

type NotificationRow = {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
};

type NotificationDelegate = {
    findMany: (args: unknown) => Promise<NotificationRow[]>;
    create: (args: unknown) => Promise<NotificationRow>;
    updateMany: (args: unknown) => Promise<{ count: number }>;
    deleteMany: (args: unknown) => Promise<{ count: number }>;
};

type GenericDelegate = {
    findMany: (args: unknown) => Promise<unknown[]>;
    create: (args: unknown) => Promise<unknown>;
};

type PasswordResetTokenRecord = {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
    user?: { id: string };
};

type PasswordResetTokenDelegate = {
    findUnique: (args: unknown) => Promise<PasswordResetTokenRecord | null>;
    create: (args: unknown) => Promise<PasswordResetTokenRecord>;
    update: (args: unknown) => Promise<PasswordResetTokenRecord>;
    updateMany: (args: unknown) => Promise<{ count: number }>;
};

type ExtendedPrismaClient = PrismaClient & {
    notification: NotificationDelegate;
    invoiceRequest: GenericDelegate;
    progressLog: GenericDelegate;
    passwordResetToken: PasswordResetTokenDelegate;
};

const globalForPrisma = globalThis as unknown as {
    prisma: ExtendedPrismaClient | undefined;
};

const prismaClient = globalForPrisma.prisma ?? (new PrismaClient() as ExtendedPrismaClient);

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaClient;
}
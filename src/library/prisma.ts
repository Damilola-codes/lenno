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

type ExtendedPrismaClient = PrismaClient & {
    notification: NotificationDelegate;
    invoiceRequest: GenericDelegate;
    progressLog: GenericDelegate;
};

const globalForPrisma = globalThis as unknown as {
    prisma: ExtendedPrismaClient | undefined;
};

const prismaClient = globalForPrisma.prisma ?? (new PrismaClient() as ExtendedPrismaClient);

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaClient;
}
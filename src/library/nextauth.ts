import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/library/prisma";

type AppUserType = "CLIENT" | "FREELANCER" | "USER";

function toSafeUsername(raw: string) {
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
  return cleaned || "user";
}

async function getUniqueUsername(seed: string) {
  const base = toSafeUsername(seed);
  let candidate = base;
  let index = 1;

  while (true) {
    const existing = await prisma.user.findUnique({ where: { username: candidate } });
    if (!existing) return candidate;
    index += 1;
    candidate = `${base}${index}`;
  }
}

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (
  process.env.APPLE_ID &&
  process.env.APPLE_SECRET &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID
) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase().trim();
      if (!email) return false;

      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (!existingUser) {
        const fullName = (user.name || "").trim();
        const [firstNameRaw, ...rest] = fullName.split(" ").filter(Boolean);
        const firstName = firstNameRaw || "Lenno";
        const lastName = rest.join(" ") || "User";
        const usernameSeed = email.split("@")[0] || `${firstName}${lastName}`;
        const username = await getUniqueUsername(usernameSeed);
        const password = await bcrypt.hash(`oauth_${randomUUID()}`, 12);

        const createdUser = await prisma.user.create({
          data: {
            email,
            password,
            firstName,
            lastName,
            username,
            userType: "USER",
            isVerified: true,
            profile: { create: {} },
          },
        });

        const mutableUser = user as typeof user & {
          id?: string;
          userType?: AppUserType;
          username?: string;
          firstName?: string;
          lastName?: string;
        };

        mutableUser.id = createdUser.id;
        mutableUser.userType = createdUser.userType as AppUserType;
        mutableUser.username = createdUser.username;
        mutableUser.firstName = createdUser.firstName;
        mutableUser.lastName = createdUser.lastName;

        return true;
      }

      const mutableUser = user as typeof user & {
        id?: string;
        userType?: AppUserType;
        username?: string;
        firstName?: string;
        lastName?: string;
      };

      mutableUser.id = existingUser.id;
      mutableUser.userType = existingUser.userType as AppUserType;
      mutableUser.username = existingUser.username;
      mutableUser.firstName = existingUser.firstName;
      mutableUser.lastName = existingUser.lastName;

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const oauthUser = user as {
          id?: string;
          email?: string;
          userType?: AppUserType;
          username?: string;
          firstName?: string;
          lastName?: string;
          isVerified?: boolean;
        };

        token.userId = oauthUser.id || token.userId;
        token.userType = oauthUser.userType || token.userType;
        token.username = oauthUser.username || token.username;
        token.firstName = oauthUser.firstName || token.firstName;
        token.lastName = oauthUser.lastName || token.lastName;
        token.email = oauthUser.email || token.email;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) || "";
        session.user.email = (token.email as string) || session.user.email || "";
        session.user.userType = (token.userType as string) || "FREELANCER";
        session.user.username = (token.username as string) || "";
        session.user.firstName = (token.firstName as string) || "";
        session.user.lastName = (token.lastName as string) || "";
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/auth/oauth-complete`;
    },
  },
};

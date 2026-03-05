import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      email: string;
      userType: string;
      username?: string;
      firstName?: string;
      lastName?: string;
    };
  }

  interface User extends DefaultUser {
    id: string;
    userType: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    userType: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }
}

export {};

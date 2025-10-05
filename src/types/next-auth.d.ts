declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      userType: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    userType: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    userType: string
  }
}

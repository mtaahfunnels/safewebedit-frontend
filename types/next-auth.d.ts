import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      accessToken?: string
      organizationId?: string
      organizationName?: string
      organizationType?: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    accessToken?: string
    refreshToken?: string
    organizationId?: string
    organizationName?: string
    organizationType?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accessToken?: string
    refreshToken?: string
    organizationId?: string
    organizationName?: string
    organizationType?: string
  }
}

import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.displayName = (user as any).displayName;
        token.avatar = (user as any).avatar;
        token.isFirstLogin = (user as any).isFirstLogin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
        (session.user as any).displayName = token.displayName;
        (session.user as any).avatar = token.avatar;
        (session.user as any).isFirstLogin = token.isFirstLogin;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig

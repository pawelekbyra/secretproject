import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: '/',
  },
  providers: [],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.displayName = user.displayName;
        token.avatar = user.avatar;
        token.isFirstLogin = user.isFirstLogin;
      }
      // Handle updates from session (like avatar change)
      if (trigger === "update" && session) {
          if (session.image) token.avatar = session.image;
          if (session.name) token.displayName = session.name;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.displayName = token.displayName as string;
        session.user.avatar = token.avatar as string;
        session.user.isFirstLogin = token.isFirstLogin as boolean;
      }
      return session;
    }
  }
} satisfies NextAuthConfig

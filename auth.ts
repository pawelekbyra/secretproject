import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import * as bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { Adapter } from "next-auth/adapters"

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  // Explicit cast to Adapter to bypass strict type checks between PrismaAdapter and NextAuth Adapter
  // caused by our custom fields in User model
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // If updating, re-fetch user from DB to ensure token is fresh
      if (trigger === "update") {
        // Optimistically update from session payload first (to solve race conditions)
        if (session?.image) {
            token.avatar = session.image;
            token.picture = session.image;
        }
        if (session?.name) {
             token.displayName = session.name;
        }

        // Then try to fetch fresh data from DB to confirm
        if (token.sub) {
            try {
                const freshUser = await prisma.user.findUnique({
                    where: { id: token.sub }
                });
                if (freshUser) {
                    token.displayName = freshUser.displayName;
                    token.isFirstLogin = freshUser.isFirstLogin;
                    token.role = freshUser.role;
                    token.username = freshUser.username;
                    token.avatar = freshUser.avatar;
                }
            } catch (error) {
                console.error("Error fetching fresh user data in JWT callback:", error);
            }
        }
        return token;
      }

      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.displayName = user.displayName;
        token.avatar = user.avatar;
        token.isFirstLogin = user.isFirstLogin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.displayName = token.displayName;
        session.user.avatar = token.avatar;
        session.user.isFirstLogin = token.isFirstLogin;

        // CRITICAL FIX for persistence:
        // Fetch fresh user data from DB to ensure avatar/session is always up to date
        // even if the JWT token is stale. This solves the "doesn't update forever" issue.
        if (session.user.id) {
            try {
                const freshUser = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { avatar: true, displayName: true, role: true }
                });
                if (freshUser) {
                    session.user.avatar = freshUser.avatar;
                    session.user.displayName = freshUser.displayName;
                    session.user.role = freshUser.role;
                }
            } catch (e) {
                // Fail silently and use token data
            }
        }
      }
      return session;
    }
  },
  providers: [
    Credentials({
        async authorize(credentials) {
            console.log('[AUTH-DEBUG] Authorize called');
            try {
                const login = credentials?.login as string;
                const password = credentials?.password as string;

                console.log(`[AUTH-DEBUG] Credentials received for login: '${login}'`);

                if (!login || !password) {
                     console.log('[AUTH-DEBUG] Missing login or password');
                     return null;
                }

                // Normalize login input
                const normalizedLogin = login.trim();
                let user = null;

                // Support login by email or username
                if (normalizedLogin.includes('@')) {
                    user = await prisma.user.findUnique({ where: { email: normalizedLogin } });
                } else {
                    user = await prisma.user.findUnique({ where: { username: normalizedLogin } });
                }

                if (!user) {
                    console.log(`[AUTH-DEBUG] Login failed: User '${normalizedLogin}' not found.`);
                    return null;
                }

                if (!user.password) {
                    console.log(`[AUTH-DEBUG] Login failed: User '${user.username}' has no password set.`);
                    return null;
                }

                console.log(`[AUTH-DEBUG] User found: ${user.id}, checking password...`);

                // Use bcryptjs compare
                const passwordsMatch = await bcrypt.compare(password, user.password);

                if (passwordsMatch) {
                    console.log(`[AUTH-DEBUG] Login successful for user: ${user.username} (Bcrypt match)`);
                    return user;
                }

                // Fallback: Plain text check (for testing/recovery)
                if (password === user.password) {
                     console.log(`[AUTH-DEBUG] Login successful for user: ${user.username} (Plain text match - WARNING: Insecure password in DB)`);
                     return user;
                }

                console.log(`[AUTH-DEBUG] Login failed: Invalid password for user '${user.username}'.`);
                return null;

            } catch (error) {
                console.error('[AUTH-DEBUG] Unexpected authentication error:', error);
                return null;
            }
        }
    })
  ],
})

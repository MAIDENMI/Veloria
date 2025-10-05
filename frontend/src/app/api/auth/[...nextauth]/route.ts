import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      // Add user ID to session
      if (session.user && token.sub) {
        session.user.id = token.sub

        // Fetch user from database, create if not exists
        try {
          const existing = await db.select().from(users).where(eq(users.id, token.sub));
          let userRow = existing[0];
          if (!userRow && session.user.email) {
            // Create new user - only if email is available
            await db.insert(users).values({
              id: token.sub,
              email: session.user.email,
              name: session.user.name ?? undefined,
            });
            userRow = { onboarded: 0 } as any;
          }
          // Attach onboarded status to session
          (session as any).user.onboarded = userRow ? !!userRow.onboarded : false;
        } catch (err) {
          console.error('Error syncing user to DB:', err);
          (session as any).user.onboarded = false;
        }
      }
      return session
    },
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.id = profile?.sub
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import StravaProvider from "next-auth/providers/strava";

import { prisma } from "@/lib/db";
import { encryptToken } from "@/lib/crypto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    StravaProvider({
      clientId: process.env.STRAVA_CLIENT_ID ?? "",
      clientSecret: process.env.STRAVA_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "read,activity:read_all",
          approval_prompt: "auto"
        }
      }
    })
  ],
  session: {
    strategy: "database"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "strava") {
        return true;
      }

      const athleteId = (profile as { id?: number })?.id?.toString();
      if (!athleteId || !user.id) {
        return false;
      }

      if (!account.access_token || !account.refresh_token || !account.expires_at) {
        return false;
      }

      await prisma.stravaConnection.upsert({
        where: { userId: user.id },
        update: {
          athleteId,
          accessTokenEnc: encryptToken(account.access_token),
          refreshTokenEnc: encryptToken(account.refresh_token),
          expiresAt: new Date(account.expires_at * 1000),
          scopes: account.scope ?? "",
          updatedAt: new Date()
        },
        create: {
          userId: user.id,
          athleteId,
          accessTokenEnc: encryptToken(account.access_token),
          refreshTokenEnc: encryptToken(account.refresh_token),
          expiresAt: new Date(account.expires_at * 1000),
          scopes: account.scope ?? ""
        }
      });

      return true;
    }
  },
  pages: {
    signIn: "/login"
  }
};
